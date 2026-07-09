import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { findAccount, getAccount, addDays } from '../api.js';

export const data = new SlashCommandBuilder()
  .setName('extraday')
  .setDescription('Ajouter des jours supplémentaires à un compte')
  .addStringOption((o) =>
    o.setName('username').setDescription('Nom d\'utilisateur').setRequired(true)
  )
  .addIntegerOption((o) =>
    o
      .setName('days')
      .setDescription('Nombre de jours à ajouter')
      .setRequired(true)
      .setMinValue(1)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const username = interaction.options.getString('username', true);
  const daysToAdd = interaction.options.getInteger('days', true);

  try {
    const account = await findAccount(username);
    if (!account) {
      return void (await interaction.editReply(`❌ Compte \`${username}\` introuvable.`));
    }

    // Fetch full account to compute additive days
    const full = await getAccount(account.id);

    // Compute remaining days from expiresAt, or fall back to stored days field
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
      .setTitle('✅ Jours ajoutés')
      .addFields(
        { name: 'Username', value: `\`${username}\``, inline: true },
        { name: 'Jours ajoutés', value: `+${daysToAdd} jour(s)`, inline: true },
        { name: 'Total restant', value: `${newTotal} jour(s)`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await interaction.editReply(`❌ Erreur: ${msg}`);
  }
}
