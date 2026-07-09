import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { setGuildLang, getGuildLang } from '../langConfig.js';
import type { Lang } from '../i18n.js';
import { t } from '../i18n.js';

export const data = new SlashCommandBuilder()
  .setName('langue')
  .setDescription('Choisir la langue du bot / Choose the bot language')
  .addStringOption((o) =>
    o
      .setName('langue')
      .setDescription('Langue / Language')
      .setRequired(true)
      .addChoices(
        { name: '🇫🇷 Français', value: 'fr' },
        { name: '🇬🇧 English', value: 'en' }
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guildId;
  if (!guildId) {
    return void (await interaction.editReply('❌ Serveur introuvable / Server not found.'));
  }

  const lang = interaction.options.getString('langue', true) as Lang;
  setGuildLang(guildId, lang);

  const tr = t(lang);

  const embed = new EmbedBuilder()
    .setColor(0x6c5ce7)
    .setTitle(tr.langueTitle)
    .setDescription(tr.langueDesc)
    .addFields({ name: tr.langueField, value: tr.langueValue })
    .setTimestamp()
    .setFooter({ text: tr.footer });

  await interaction.editReply({ embeds: [embed] });
}
