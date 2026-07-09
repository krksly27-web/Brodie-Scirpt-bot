import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  GuildMember,
} from 'discord.js';
import { setRequiredRole } from '../roleConfig.js';
import { getGuildLang } from '../langConfig.js';
import { t } from '../i18n.js';

export const data = new SlashCommandBuilder()
  .setName('setrole')
  .setDescription('Définir le rôle autorisé / Set the allowed role (Admin only)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addRoleOption((o) =>
    o.setName('role').setDescription('Rôle / Role').setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const guildId = interaction.guildId ?? '';
  const lang = getGuildLang(guildId);
  const tr = t(lang);

  // Runtime admin check — defense in depth
  const member = interaction.member;
  const isAdmin =
    member instanceof GuildMember
      ? member.permissions.has(PermissionFlagsBits.Administrator)
      : typeof member?.permissions === 'string'
        ? (BigInt(member.permissions) & PermissionFlagsBits.Administrator) !== 0n
        : false;

  if (!isAdmin) {
    return void (await interaction.editReply(tr.adminOnly));
  }

  if (!guildId) {
    return void (await interaction.editReply(tr.guildOnly));
  }

  const role = interaction.options.getRole('role', true);
  setRequiredRole(guildId, role.id);

  const embed = new EmbedBuilder()
    .setColor(0x6c5ce7)
    .setTitle(tr.setroleTitle)
    .setDescription(tr.setroleDesc(role.id))
    .setTimestamp()
    .setFooter({ text: tr.footer });

  await interaction.editReply({ embeds: [embed] });
}
