export type Lang = 'fr' | 'en';

export const translations = {
  fr: {
    noPermission: '❌ Vous n\'avez pas la permission d\'utiliser cette commande.',
    guildOnly: '❌ Cette commande doit être utilisée dans un serveur.',
    notFound: (u: string) => `❌ Compte \`${u}\` introuvable.`,
    error: (m: string) => `❌ Erreur: ${m}`,
    genericError: '❌ Une erreur est survenue lors de l\'exécution de la commande.',
    adminOnly: '❌ Seuls les administrateurs peuvent utiliser cette commande.',

    // genkey
    genkeyTitle: '🔑 Nouveau compte créé',
    genkeyFieldUser: '👤 Username',
    genkeyFieldPass: '🔒 Password',
    genkeyFieldDays: '📅 Durée',
    genkeyDays: (d: number) => `${d} jour(s)`,
    genkeyDescription: '> Merci d\'avoir acheté chez **Brodie Scripts** !\n> Si vous avez besoin d\'aide, n\'hésitez pas à ouvrir un ticket 🎫',
    genkeyConfirm: '✅ Compte créé et message envoyé dans le salon.',

    // extraday
    extradayTitle: '✅ Jours ajoutés',
    extradayFieldAdded: 'Jours ajoutés',
    extradayFieldAdded2: (d: number) => `+${d} jour(s)`,
    extradayFieldTotal: 'Total restant',
    extradayFieldTotal2: (d: number) => `${d} jour(s)`,

    // reset
    resetTitle: '✅ Sessions réinitialisées',
    resetStatus: 'Statut',
    resetStatusValue: 'Sessions supprimées — le compte peut se reconnecter',

    // ban
    banTitle: '🔨 Compte banni',
    banStatus: '🚫 Banni',

    // unban
    unbanTitle: '✅ Compte débanni',
    unbanStatus: '✅ Actif',

    // setrole
    setroleTitle: '✅ Rôle configuré',
    setroleDesc: (id: string) => `Le rôle <@&${id}> peut maintenant utiliser toutes les commandes du bot.`,

    // langue
    langueTitle: '🌐 Langue configurée',
    langueDesc: 'La langue du bot est maintenant le **Français** 🇫🇷',
    langueField: 'Langue',
    langueValue: '🇫🇷 Français',

    // shared fields
    fieldUsername: 'Username',
    fieldStatus: 'Statut',
    footer: 'Brodie Scripts',
  },

  en: {
    noPermission: '❌ You do not have permission to use this command.',
    guildOnly: '❌ This command must be used in a server.',
    notFound: (u: string) => `❌ Account \`${u}\` not found.`,
    error: (m: string) => `❌ Error: ${m}`,
    genericError: '❌ An error occurred while executing the command.',
    adminOnly: '❌ Only administrators can use this command.',

    // genkey
    genkeyTitle: '🔑 New account created',
    genkeyFieldUser: '👤 Username',
    genkeyFieldPass: '🔒 Password',
    genkeyFieldDays: '📅 Duration',
    genkeyDays: (d: number) => `${d} day(s)`,
    genkeyDescription: '> Thank you for purchasing from **Brodie Scripts**!\n> If you need any help, feel free to open a ticket 🎫',
    genkeyConfirm: '✅ Account created and message sent in the channel.',

    // extraday
    extradayTitle: '✅ Days added',
    extradayFieldAdded: 'Days added',
    extradayFieldAdded2: (d: number) => `+${d} day(s)`,
    extradayFieldTotal: 'Remaining total',
    extradayFieldTotal2: (d: number) => `${d} day(s)`,

    // reset
    resetTitle: '✅ Sessions reset',
    resetStatus: 'Status',
    resetStatusValue: 'Sessions cleared — account can register a new device',

    // ban
    banTitle: '🔨 Account banned',
    banStatus: '🚫 Banned',

    // unban
    unbanTitle: '✅ Account unbanned',
    unbanStatus: '✅ Active',

    // setrole
    setroleTitle: '✅ Role configured',
    setroleDesc: (id: string) => `The role <@&${id}> can now use all bot commands.`,

    // langue
    langueTitle: '🌐 Language configured',
    langueDesc: 'The bot language is now **English** 🇬🇧',
    langueField: 'Language',
    langueValue: '🇬🇧 English',

    // shared fields
    fieldUsername: 'Username',
    fieldStatus: 'Status',
    footer: 'Brodie Scripts',
  },
} as const;

export function t(lang: Lang) {
  return translations[lang];
}
