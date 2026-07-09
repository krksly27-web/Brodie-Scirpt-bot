import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  GuildMember,
} from 'discord.js';
import { setRequiredRole } from '../roleConfig.js';

export const data = new SlashCommandBuilder()
  .setName('setrole')
  .setDescription('Définir le rôle autorisé à utiliser les commandes du bot (Admin uniquement)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addRoleOption((o) =>
    o.setName('role').setDescription('Rôle qui aura accès aux commandes').setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  // Runtime admin check — defense in depth beyond Discord metadata
  const member = interaction.member;
  const isAdmin =
    member instanceof GuildMember
      ? member.permissions.has(PermissionFlagsBits.Administrator)
      : typeof member?.permissions === 'string'
        ? (BigInt(member.permissions) & PermissionFlagsBits.Administrator) !== 0n
        : false;

  if (!isAdmin) {
    return void (await interaction.editReply('❌ Seuls les administrateurs peuvent utiliser cette commande.'));
  }

  const role = interaction.options.getRole('role', true);
  const guildId = interaction.guildId;

  if (!guildId) {
    return void (await interaction.editReply('❌ Cette commande doit être utilisée dans un serveur.'));
  }

  setRequiredRole(guildId, role.id);

  const embed = new EmbedBuilder()
    .setColor(0x6c5ce7)
    .setTitle('✅ Rôle configuré')
    .setDescription(`Le rôle <@&${role.id}> peut maintenant utiliser toutes les commandes du bot.`)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
