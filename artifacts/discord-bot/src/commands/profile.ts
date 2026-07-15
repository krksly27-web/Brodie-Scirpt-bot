import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { findAccount, getAccount } from '../api.js';
import { getGuildLang } from '../langConfig.js';
import { getRequiredRole } from '../roleConfig.js';
import { t } from '../i18n.js';

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('Voir le profil d\'un compte / View account profile')
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

  await interaction.deferReply({ ephemeral: true });

  const username = interaction.options.getString('username', true);

  try {
    const account = await findAccount(username);
    if (!account) {
      return void (await interaction.editReply(tr.notFound(username)));
    }

    const fullAccount = await getAccount(account.id);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`👤 ${username}`)
      .addFields(
        { name: 'ID', value: `\`${fullAccount.id}\``, inline: true },
        { name: '📅 Statut', value: fullAccount.banned ? '🚫 Banni' : '✅ Actif', inline: true },
        { name: '⏰ Durée', value: fullAccount.days ? `${fullAccount.days} jour(s)` : 'N/A', inline: true },
        { name: '📍 Expire le', value: fullAccount.expiresAt ? new Date(fullAccount.expiresAt).toLocaleString() : 'N/A', inline: false }
      )
      .setTimestamp()
      .setFooter({ text: tr.footer });

    await interaction.editReply({ embeds: [embed] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await interaction.editReply(tr.error(msg));
  }
}

