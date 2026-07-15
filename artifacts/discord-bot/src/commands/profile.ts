import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { findAccount } from '../api.js';
import { getGuildLang } from '../langConfig.js';
import { t } from '../i18n.js';

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('Voir le profil d\'un compte / View account profile')
  .addStringOption((o) =>
    o.setName('username').setDescription('Nom d\'utilisateur / Username').setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guildId ?? '';
  const lang = getGuildLang(guildId);
  const tr = t(lang);

  const username = interaction.options.getString('username', true);

  try {
    const account = await findAccount(username);
    if (!account) {
      return void (await interaction.editReply(tr.notFound(username)));
    }

    // Déterminer le statut
    let statusText = tr.profileStatusActive;
    if (account.banned) {
      statusText = tr.profileStatusBanned;
    } else if (account.expiresAt) {
      const expiryDate = new Date(account.expiresAt);
      if (expiryDate < new Date()) {
        statusText = tr.profileExpired;
      }
    }

    const embed = new EmbedBuilder()
      .setColor(account.banned ? 0xff6b6b : 0x51cf66)
      .setTitle(tr.profileTitle)
      .addFields(
        { name: tr.fieldUsername, value: `\`${username}\``, inline: true },
        { name: tr.profileStatus, value: statusText, inline: true }
      );

    // Ajouter les champs optionnels
    if (account.expiresAt) {
      const expiryDate = new Date(account.expiresAt);
      embed.addFields({
        name: tr.profileExpiresAt,
        value: `<t:${Math.floor(expiryDate.getTime() / 1000)}:f>`,
        inline: false,
      });
    }

    if (account.days) {
      embed.addFields({
        name: tr.profileDays,
        value: tr.genkeyDays(account.days),
        inline: true,
      });
    }

    embed.setTimestamp().setFooter({ text: tr.footer });

    await interaction.editReply({ embeds: [embed] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await interaction.editReply(tr.error(msg));
  }
}

