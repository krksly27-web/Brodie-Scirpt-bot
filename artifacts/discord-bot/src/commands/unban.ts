import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { findAccount, unbanAccount } from '../api.js';
import { getGuildLang } from '../langConfig.js';
import { t } from '../i18n.js';

export const data = new SlashCommandBuilder()
  .setName('unban')
  .setDescription('Débannir un compte / Unban an account')
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

    await unbanAccount(account.id);

    const embed = new EmbedBuilder()
      .setColor(0x00b894)
      .setTitle(tr.unbanTitle)
      .addFields(
        { name: tr.fieldUsername, value: `\`${username}\``, inline: true },
        { name: tr.fieldStatus, value: tr.unbanStatus, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: tr.footer });

    await interaction.editReply({ embeds: [embed] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await interaction.editReply(tr.error(msg));
  }
}
