import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { findAccount, resetSessions } from '../api.js';
import { getGuildLang } from '../langConfig.js';
import { getRequiredRole } from '../roleConfig.js';
import { t } from '../i18n.js';

export const data = new SlashCommandBuilder()
  .setName('reset')
  .setDescription('Réinitialiser les sessions / Reset sessions')
  .addStringOption((o) =>
    o.setName('username').setDescription('Nom d\'utilisateur / Username').setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guildId ?? '';
  const lang = getGuildLang(guildId);
  const tr = t(lang);

  // Vérifier si l'utilisateur a le rôle requis
  const requiredRole = getRequiredRole(guildId);
  if (requiredRole) {
    const member = interaction.member;
    if (!member || !('roles' in member) || !member.roles.cache.has(requiredRole)) {
      await interaction.reply({ content: tr.noPermission, ephemeral: true });
      return;
    }
  }

  await interaction.deferReply({ ephemeral: false });

  const username = interaction.options.getString('username', true);

  try {
    const account = await findAccount(username);
    if (!account) {
      return void (await interaction.editReply(tr.notFound(username)));
    }

    await resetSessions(account.id);

    const embed = new EmbedBuilder()
      .setColor(0xfdcb6e)
      .setTitle(tr.resetTitle)
      .addFields(
        { name: tr.fieldUsername, value: `\`${username}\``, inline: true },
        { name: tr.resetStatus, value: tr.resetStatusValue, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: tr.footer });

    await interaction.editReply({ embeds: [embed] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await interaction.editReply(tr.error(msg));
  }
}

