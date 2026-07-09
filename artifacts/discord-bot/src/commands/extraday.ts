import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { findAccount, getAccount, addDays } from '../api.js';
import { getGuildLang } from '../langConfig.js';
import { t } from '../i18n.js';

export const data = new SlashCommandBuilder()
  .setName('extraday')
  .setDescription('Ajouter des jours à un compte / Add days to an account')
  .addStringOption((o) =>
    o.setName('username').setDescription('Nom d\'utilisateur / Username').setRequired(true)
  )
  .addIntegerOption((o) =>
    o
      .setName('days')
      .setDescription('Nombre de jours / Number of days')
      .setRequired(true)
      .setMinValue(1)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guildId ?? '';
  const lang = getGuildLang(guildId);
  const tr = t(lang);

  const username = interaction.options.getString('username', true);
  const daysToAdd = interaction.options.getInteger('days', true);

  try {
    const account = await findAccount(username);
    if (!account) {
      return void (await interaction.editReply(tr.notFound(username)));
    }

    const full = await getAccount(account.id);

    let currentDays = 0;
    if (full.expiresAt) {
      const remaining = Math.ceil(
        (new Date(full.expiresAt as string).getTime() - Date.now()) / 86_400_000
      );
      currentDays = Math.max(0, remaining);
    } else if (typeof full.days === 'number') {
      currentDays = full.days;
    }

    const newTotal = currentDays + daysToAdd;
    await addDays(account.id, newTotal);

    const embed = new EmbedBuilder()
      .setColor(0x0984e3)
      .setTitle(tr.extradayTitle)
      .addFields(
        { name: tr.fieldUsername, value: `\`${username}\``, inline: true },
        { name: tr.extradayFieldAdded, value: tr.extradayFieldAdded2(daysToAdd), inline: true },
        { name: tr.extradayFieldTotal, value: tr.extradayFieldTotal2(newTotal), inline: true }
      )
      .setTimestamp()
      .setFooter({ text: tr.footer });

    await interaction.editReply({ embeds: [embed] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await interaction.editReply(tr.error(msg));
  }
}
