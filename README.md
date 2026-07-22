# Beauty Haïr by Nao

Site vitrine et socle de réservation Next.js de Beauty Haïr by Nao.

## Démarrage

Prérequis : Node.js 20+ et npm. PostgreSQL est requis en production.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Ouvrir `http://localhost:3000`. Le stockage JSON local n'est activé que par `LOCAL_JSON_STORAGE=true` (notamment pour les E2E) et n'est jamais utilisé en production.

Commandes qualité :

```bash
npm run lint
npm test
npx playwright install chromium webkit
npm run test:e2e
npm run build
```

## Configuration prioritaire

Remplacer dans `.env.local` Gmail, WhatsApp au format international (ex. `+228...`), téléphone, horaires, services et localisation. Les valeurs temporaires sont centralisées dans `src/data/site.ts`. Ne jamais committer les secrets.

### Variables de production

Obligatoires : `NEXT_PUBLIC_SITE_URL`, `PRINCESSE_EMAIL`, `PRINCESSE_PHONE`, `PRINCESSE_WHATSAPP`, `PRINCESSE_TIMEZONE`, `DATABASE_URL`, `AUTH_SECRET` et `ADMIN_PASSWORD_HASH`. `DIRECT_URL` est utile lorsque le fournisseur propose une connexion directe distincte pour les migrations.

Facultatives : `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, les variables Meta `WHATSAPP_*`, les variables Turnstile et les DSN Sentry. Une intégration reste désactivée tant que son groupe de variables n'est pas complet. `src/lib/env.ts` valide la configuration sans journaliser les valeurs.

## Base de données

Renseigner `DATABASE_URL`, puis `npm run prisma:generate`, `npm run prisma:migrate` et `npm run db:seed`. Le schéma et la migration initiale sont dans `prisma/`. En production, utiliser `npm run prisma:deploy`.

Le fichier `data/appointments.json` est réservé au développement sans PostgreSQL. L'application refuse ce fallback en production.

## Administration Beauty Haïr by Nao

La route `/admin` est protégée par une session HTTP-only signée. En développement seulement, sans configuration, le mot de passe temporaire est `princesse-local`. Avant tout déploiement, générer un hash bcrypt pour `ADMIN_PASSWORD_HASH` et un secret aléatoire long pour `AUTH_SECRET`.

L'administration permet de gérer les rendez-vous, les dates réellement ouvertes, les coiffures, le catalogue produit et les quatre tarifs de tresses. Le tableau de bord synthétise dates publiées, rendez-vous, demandes, produits et coiffures. Une date doit être publiée dans `/admin/disponibilites` avant d'être réservable côté public ; sept dates futures peuvent être ouvertes simultanément.

## Email et WhatsApp

Voir `SETUP_EMAIL.md` et `SETUP_WHATSAPP.md`. Les échecs de notification sont enregistrés sans supprimer le rendez-vous. Un lien `wa.me` ouvre seulement un message prérempli : la cliente doit valider manuellement. L'envoi automatique exige Meta WhatsApp Cloud API.

## Contenu et modèle 3D

Ajouter les photos licenciées dans `public/images` et documenter leur provenance dans `CONTENT_GUIDE.md`. Ajouter le futur modèle `.glb` dans `public/models`; prévoir un fallback statique sur appareils faibles.

## Déploiement

Voir `DEPLOYMENT.md`. Configurer les variables Vercel, PostgreSQL, Resend et Meta, appliquer les migrations, puis lancer `npm run build`.
