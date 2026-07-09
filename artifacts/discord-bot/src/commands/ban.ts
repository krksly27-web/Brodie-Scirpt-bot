import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { findAccount, banAccount } from '../api.js';

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Bannir un compte')
  .addStringOption((o) =>
    o.setName('username').setDescription('Nom d\'utilisateur').setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const username = interaction.options.getString('username', true);

  try {
    const account = await findAccount(username);
    if (!account) {
      return void (await interaction.editReply(`❌ Compte \`${username}\` introuvable.`));
    }

    await banAccount(account.id);

    const embed = new EmbedBuilder()
      .setColor(0xd63031)
      .setTitle('🔨 Compte banni')
      .addFields(
        { name: 'Username', value: `\`${username}\``, inline: true },
        { name: 'Statut', value: '🚫 Banni', inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await interaction.editReply(`❌ Erreur: ${msg}`);
  }
}
