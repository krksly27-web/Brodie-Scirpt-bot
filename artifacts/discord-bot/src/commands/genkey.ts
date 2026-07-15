import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { createAccount } from '../api.js';
import { getGuildLang } from '../langConfig.js';
import { t } from '../i18n.js';

export const data = new SlashCommandBuilder()
  .setName('genkey')
  .setDescription('Créer un nouveau compte / Create a new account')
  .addStringOption((o) =>
    o.setName('username').setDescription('Nom d\'utilisateur / Username').setRequired(true)
  )
  .addStringOption((o) =>
    o.setName('password').setDescription('Mot de passe / Password').setRequired(true)
  )
  .addIntegerOption((o) =>
    o
      .setName('days')
      .setDescription('Durée en jours / Duration in days')
      .setRequired(true)
      .setMinValue(1)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guildId ?? '';
  const lang = getGuildLang(guildId);
  const tr = t(lang);

  const username = interaction.options.getString('username', true);
  const password = interaction.options.getString('password', true);
  const days = interaction.options.getInteger('days', true);

  try {
    await createAccount(username, password, days);

    const message = `Merci de votre confiance, voici vos identifiants 
-# Nom d'utilisateur
${username}

-# Mot de passe
${password}

Si vous rencontrez des problèmes ou autres, n'hésitez pas à ouvrir un ticket et à laisser un commentaire #:heart:-Feedback, merci de screen vos identifiants car en cas de perte/bugs, il ne seront pas redonnée ou aucune clé ne vous sera recreez.`;

    if (interaction.channel && 'send' in interaction.channel) {
      await interaction.channel.send(message);
    }
    await interaction.editReply({ content: tr.genkeyConfirm });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await interaction.editReply(tr.error(msg));
  }
}

