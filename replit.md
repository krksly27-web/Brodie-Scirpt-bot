# Brodie Scripts — Discord Bot

Bot Discord relié au panneau admin Brodie Scripts pour gérer les comptes (licences).

## Run & Operate

- `pnpm --filter @workspace/discord-bot run dev` — lancer le bot Discord
- `pnpm --filter @workspace/api-server run dev` — lancer le serveur API (port 5000)
- `pnpm run typecheck` — vérification TypeScript complète

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Bot: discord.js v14 (slash commands)
- API cible: https://key-management-system--akka92762vgggg.replit.app
- Auth API: session cookie (login admin au démarrage)

## Where things live

- `artifacts/discord-bot/src/index.ts` — point d'entrée du bot, gestion des événements
- `artifacts/discord-bot/src/api.ts` — client HTTP vers le panneau admin (session cookie)
- `artifacts/discord-bot/src/roleConfig.ts` — persistance du rôle Discord autorisé (fichier JSON)
- `artifacts/discord-bot/src/commands/` — une commande par fichier
- `artifacts/discord-bot/data/role-config.json` — config du rôle (créé automatiquement)

## Commandes Discord

| Commande | Description |
|---|---|
| `/genkey <username> <password> <days>` | Créer un nouveau compte |
| `/extraday <username> <days>` | Ajouter des jours (additif) |
| `/reset <username>` | Réinitialiser les sessions |
| `/ban <username>` | Bannir un compte |
| `/unban <username>` | Débannir un compte |
| `/setrole <role>` | Définir le rôle autorisé (Admin Discord only) |

## Variables d'environnement (Secrets)

- `DISCORD_BOT_TOKEN` — Token du bot Discord
- `API_ADMIN_USERNAME` — Username admin du panneau Brodie Scripts
- `API_ADMIN_PASSWORD` — Mot de passe admin du panneau Brodie Scripts
- `DISCORD_GUILD_ID` (optionnel) — ID du serveur pour enregistrement instantané des commandes

## Architecture decisions

- Les commandes slash sont enregistrées **globalement** (délai 1h) sauf si `DISCORD_GUILD_ID` est défini (instantané).
- L'autorisation est vérifiée **à l'exécution** (runtime) — pas seulement via les métadonnées Discord.
- La recherche de compte est **exact-match uniquement** : une commande refuse d'agir si le username exact n'est pas trouvé.
- `extraday` est additif : récupère les jours restants, ajoute le delta, puis appelle `set-lifetime` avec le total.
- La session API se renouvelle automatiquement en cas de 401.

## User preferences

_Populate as you build._

## Gotchas

- Les commandes globales Discord peuvent prendre jusqu'à 1 heure à apparaître. Définir `DISCORD_GUILD_ID` pour un enregistrement instantané dans un serveur spécifique.
- Le fichier `data/role-config.json` est créé automatiquement au premier `/setrole`.
