# Audit de production

Date : 15 juillet 2026

## Déjà prêt

- Next.js 16.2.10, React 19, TypeScript, App Router et Tailwind CSS.
- Pages publiques, réservation responsive, secours WhatsApp `wa.me` et administration avec cookie HTTP-only.
- Prisma 7 avec schéma PostgreSQL, migration initiale et seed.
- Lint, 5 tests Vitest et build de production réussis au début de l'audit.
- `.env.local` ignoré par Git et absent des fichiers suivis.
- Dépôt distant `origin` configuré sur GitHub, branche locale `main`.

## Manques constatés au début de l'audit

- Validation centralisée des variables de production absente.
- Fallback JSON non explicitement interdit en production.
- Modèle de disponibilité insuffisant : pas de durée normalisée, fuseau, exceptions ou créneaux bloqués.
- Pas de `NotificationLog` ni de journal d'audit administrateur.
- Notifications sans confirmation cliente ni relance protégée.
- Rate limiting en mémoire uniquement et Turnstile non branché.
- Pas d'endpoint de santé DB ni d'en-têtes HTTP de sécurité.
- Couverture de tests encore inférieure aux scénarios de production demandés.
- Vercel CLI non installée et aucun projet Vercel lié localement.

## Risques

- Perte de rendez-vous sur Vercel si le stockage JSON était utilisé.
- Réservations qui se chevauchent pour des services de durées différentes.
- Production susceptible de démarrer sans secrets d'administration ou base.
- Notifications externes non traçables et impossibles à relancer.

## Actions réalisées pendant l'audit

- Exécution de `npm install`, `npm run lint`, `npm test` et `npm run build` : réussite.
- Vérification de Node 24.14.0, npm 11.9.0, Next.js 16.2.10, Prisma, migrations, routes, tests, Git et variables.
- Confirmation que l'audit npm ne signale aucune vulnérabilité.

## Identifiants externes nécessaires

- PostgreSQL : `DATABASE_URL` et éventuellement `DIRECT_URL`.
- Administration : `AUTH_SECRET` et `ADMIN_PASSWORD_HASH` de production.
- Email facultatif : `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`.
- Meta facultatif : variables `WHATSAPP_*` complètes.
- Turnstile et Sentry : variables dédiées uniquement si activés.
- Authentification Vercel dans le navigateur avant le premier déploiement.

## État de clôture locale

- Validation Zod centralisée et refus du stockage JSON en production.
- Migration PostgreSQL préparée avec exclusion des chevauchements actifs, index, journaux, créneaux bloqués et rate limiting persistant.
- Disponibilités Europe/Paris, durées de services, pauses, marge, délai minimal et contrôle serveur finalisés.
- Administration protégée, auditée, filtrable, exportable et capable de relancer les notifications.
- Resend et Meta restent facultatifs ; leurs chemins de succès et d’échec sont testés avec des mocks sans appel réel.
- Sentry et Turnstile sont conditionnels ; les endpoints de santé et les en-têtes de sécurité sont présents.
- Dernière validation locale : 17 tests Vitest réussis, 7 scénarios Playwright réussis, 1 scénario multi-projet volontairement ignoré, lint et build réussis, 0 vulnérabilité npm.

## Validations externes terminées

- Conditions Neon Marketplace acceptées et ressource `princesse-db` provisionnée.
- Dépôt GitHub `davson1504-ai/site-princesse` relié au projet Vercel.
- PostgreSQL Neon opérationnel, migration et seed appliqués.
- Preview puis Production déployées et testées avec une réservation contrôlée.
- URL Production : `https://site-princesse.vercel.app`.
