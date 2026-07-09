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
  // Defer ephemerally first so we can handle errors privately
  await interaction.deferReply({ ephemeral: true });

  const username = interaction.options.getString('username', true);
  const password = interaction.options.getString('password', true);
  const days = interaction.options.getInteger('days', true);

  try {
    await createAccount(username, password, days);

    // Send a public message in the channel
    const publicEmbed = new EmbedBuilder()
      .setColor(0x00b894)
      .setTitle('🔑 Nouveau compte créé')
      .addFields(
        { name: '👤 Username', value: `\`${username}\``, inline: true },
        { name: '🔒 Password', value: `\`${password}\``, inline: true },
        { name: '📅 Durée', value: `${days} jour(s)`, inline: true },
      )
      .setDescription(
        '\n> Merci d\'avoir acheté chez **Brodie Scripts** !\n> Si vous avez besoin d\'aide, n\'hésitez pas à ouvrir un ticket 🎫'
      )
      .setTimestamp()
      .setFooter({ text: 'Brodie Scripts' });

    // Send public message in the channel
    await interaction.channel?.send({ embeds: [publicEmbed] });

    // Confirm privately to the admin who ran the command
    await interaction.editReply({ content: '✅ Compte créé et message envoyé dans le salon.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await interaction.editReply(`❌ Erreur: ${msg}`);
  }
}
