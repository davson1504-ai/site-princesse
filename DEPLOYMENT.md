# Déploiement Vercel

## Variables obligatoires

Configurer séparément Preview et Production : `NEXT_PUBLIC_SITE_URL`, `PRINCESSE_EMAIL`, `PRINCESSE_PHONE`, `PRINCESSE_WHATSAPP`, `PRINCESSE_TIMEZONE`, `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_PASSWORD_HASH`. Ajouter `DIRECT_URL` si le fournisseur distingue la connexion de migration.

`AUTH_SECRET` doit être long et aléatoire. `ADMIN_PASSWORD_HASH` doit être un hash bcrypt, jamais un mot de passe en clair.

## Variables facultatives

- Resend : `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`.
- Meta : les quatre variables `WHATSAPP_*`.
- Turnstile : `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.
- Sentry : `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`.

## Procédure

1. Lier le dépôt GitHub existant au projet Vercel sans créer de doublon.
2. Configurer PostgreSQL persistant et les variables obligatoires.
3. Exécuter `npm run prisma:deploy` puis `npm run db:seed`.
4. Déployer une Preview et vérifier `/api/health`.
5. Tester réservation, persistance après redémarrage, administration et `wa.me`.
6. Tester Resend et Meta uniquement si leurs identifiants sont configurés.
7. Déployer en production et définir l'URL finale dans `NEXT_PUBLIC_SITE_URL`.

Pour cette version, la migration additive `20260722090000_beauty_hair_catalogue_availability` doit être appliquée avant le déploiement applicatif. Elle ajoute le catalogue, les variantes tarifaires et les dates de disponibilité sans supprimer les rendez-vous existants. Créer d'abord une branche de sauvegarde Neon, valider la migration sur une branche Preview isolée, puis l'appliquer à `main`.

La Preview Beauty Haïr by Nao utilise une branche Neon distincte. Ne jamais configurer Preview et Production avec la même URL PostgreSQL.

Le fallback `data/appointments.json` est interdit par le code en production.
