import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { findAccount, resetSessions } from '../api.js';

export const data = new SlashCommandBuilder()
  .setName('reset')
  .setDescription('Réinitialiser les sessions d\'un compte')
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

    await resetSessions(account.id);

    const embed = new EmbedBuilder()
      .setColor(0xfdcb6e)
      .setTitle('✅ Sessions réinitialisées')
      .addFields(
        { name: 'Username', value: `\`${username}\``, inline: true },
        { name: 'Statut', value: 'Sessions supprimées — le compte peut se reconnecter', inline: false }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await interaction.editReply(`❌ Erreur: ${msg}`);
  }
}
