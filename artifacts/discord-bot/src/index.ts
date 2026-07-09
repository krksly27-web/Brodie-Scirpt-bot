import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  Collection,
  ChatInputCommandInteraction,
  GuildMember,
  PermissionFlagsBits,
} from 'discord.js';
import { login } from './api.js';
import { getRequiredRole } from './roleConfig.js';

// ---- Load commands ----
import * as genkey from './commands/genkey.js';
import * as extraday from './commands/extraday.js';
import * as reset from './commands/reset.js';
import * as ban from './commands/ban.js';
import * as unban from './commands/unban.js';
import * as setrole from './commands/setrole.js';

type Command = {
  data: { name: string; toJSON: () => unknown };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

const commands: Command[] = [genkey, extraday, reset, ban, unban, setrole];

const commandMap = new Collection<string, Command>();
for (const cmd of commands) {
  commandMap.set(cmd.data.name, cmd);
}

// ---- Validate env ----
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID; // optional — instant registration in one guild

if (!TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN manquant dans les variables d\'environnement');
  process.exit(1);
}
if (!process.env.API_ADMIN_USERNAME || !process.env.API_ADMIN_PASSWORD) {
  console.error('❌ API_ADMIN_USERNAME ou API_ADMIN_PASSWORD manquant');
  process.exit(1);
}

// ---- Register slash commands ----
async function registerCommands(clientId: string) {
  const rest = new REST({ version: '10' }).setToken(TOKEN!);
  const body = commands.map((c) => c.data.toJSON());

  if (GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(clientId, GUILD_ID), { body });
    console.log(`✅ Commandes enregistrées dans le serveur ${GUILD_ID} (instantané)`);
  } else {
    await rest.put(Routes.applicationCommands(clientId), { body });
    console.log('✅ Commandes enregistrées globalement (peut prendre jusqu\'à 1h)');
  }
}

// ---- Check if user has required role ----
function hasAccess(interaction: ChatInputCommandInteraction): boolean {
  // setrole is always restricted to admins via setDefaultMemberPermissions
  if (interaction.commandName === 'setrole') return true;

  const guildId = interaction.guildId;
  if (!guildId) return false;

  const requiredRoleId = getRequiredRole(guildId);
  const member = interaction.member as GuildMember | null;

  if (!member) return false;

  // Admin can always use commands
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;

  // If no role configured, only admins
  if (!requiredRoleId) return false;

  return member.roles.cache.has(requiredRoleId);
}

// ---- Bot client ----
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('ready', async (c) => {
  console.log(`🤖 Bot connecté en tant que ${c.user.tag}`);

  // Login to admin API
  try {
    await login();
    console.log('✅ Connecté au panneau admin API');
  } catch (err) {
    console.error('❌ Échec connexion API:', err instanceof Error ? err.message : err);
  }

  // Register slash commands
  try {
    await registerCommands(c.user.id);
  } catch (err) {
    console.error('❌ Erreur enregistrement commandes:', err instanceof Error ? err.message : err);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commandMap.get(interaction.commandName);
  if (!command) return;

  if (!hasAccess(interaction)) {
    await interaction.reply({
      content: '❌ Vous n\'avez pas la permission d\'utiliser cette commande.',
      ephemeral: true,
    });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`Erreur commande /${interaction.commandName}:`, err);
    const msg = '❌ Une erreur est survenue lors de l\'exécution de la commande.';
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(msg).catch(() => {});
    } else {
      await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
    }
  }
});

client.login(TOKEN);
