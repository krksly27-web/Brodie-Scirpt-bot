import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
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

    const publicEmbed = new EmbedBuilder()
      .setColor(0x00b894)
      .setTitle(tr.genkeyTitle)
      .addFields(
        { name: tr.genkeyFieldUser, value: `\`${username}\``, inline: true },
        { name: tr.genkeyFieldPass, value: `\`${password}\``, inline: true },
        { name: tr.genkeyFieldDays, value: tr.genkeyDays(days), inline: true },
      )
      .setDescription('\n' + tr.genkeyDescription)
      .setTimestamp()
      .setFooter({ text: tr.footer });

    if (interaction.channel && 'send' in interaction.channel) {
      await interaction.channel.send({ embeds: [publicEmbed] });
    }
    await interaction.editReply({ content: tr.genkeyConfirm });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await interaction.editReply(tr.error(msg));
  }
}
