import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { createAccount } from '../api.js';

export const data = new SlashCommandBuilder()
  .setName('genkey')
  .setDescription('Créer un nouveau compte avec username, password et durée')
  .addStringOption((o) =>
    o.setName('username').setDescription('Nom d\'utilisateur').setRequired(true)
  )
  .addStringOption((o) =>
    o.setName('password').setDescription('Mot de passe').setRequired(true)
  )
  .addIntegerOption((o) =>
    o
      .setName('days')
      .setDescription('Durée en jours')
      .setRequired(true)
      .setMinValue(1)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const username = interaction.options.getString('username', true);
  const password = interaction.options.getString('password', true);
  const days = interaction.options.getInteger('days', true);

  try {
    const account = await createAccount(username, password, days);

    const embed = new EmbedBuilder()
      .setColor(0x00b894)
      .setTitle('✅ Compte créé')
      .addFields(
        { name: 'Username', value: `\`${username}\``, inline: true },
        { name: 'Password', value: `\`${password}\``, inline: true },
        { name: 'Durée', value: `${days} jour(s)`, inline: true },
        { name: 'ID', value: `\`${(account as any).id ?? 'N/A'}\``, inline: false }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await interaction.editReply(`❌ Erreur: ${msg}`);
  }
}
