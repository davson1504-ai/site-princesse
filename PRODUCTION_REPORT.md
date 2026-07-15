# Rapport de mise en production

Date : 15 juillet 2026

## Déploiements

- Production : https://site-princesse.vercel.app
- Administration : https://site-princesse.vercel.app/admin
- Preview validée : https://site-princesse-c016vakah-davson1504s-projects.vercel.app
- Projet Vercel : `site-princesse`
- Base : Neon PostgreSQL, ressource `princesse-db`

## Fonctionnalités actives

- Pages publiques, services, coiffures, contact, réservation mobile et bureau.
- Disponibilités en `Europe/Paris`, durées par service, pause, marge, délai minimal et exceptions administratives.
- Persistance PostgreSQL et exclusion en base des chevauchements actifs.
- Administration avec bcrypt, JWT signé, cookie HTTP-only/Secure, expiration, limitation de tentatives et audit.
- Recherche, filtres, détails, statuts, archivage, créneaux bloqués, contacts et export CSV.
- Lien `wa.me/33745238006` avec message complet prérempli et confirmation manuelle explicite.
- Rate limiting PostgreSQL atomique, honeypot, validation Zod et Turnstile conditionnel.
- En-têtes de sécurité, endpoints de santé et intégration Sentry conditionnelle.

## Intégrations volontairement désactivées

- Resend : désactivé faute de `RESEND_API_KEY` et `EMAIL_FROM` réels. Aucune prétention d’envoi email.
- Meta WhatsApp Cloud API : désactivée faute des identifiants Meta et d’un template approuvé. Le secours `wa.me` reste actif et manuel.
- Turnstile et Sentry : inactifs tant que leurs variables facultatives ne sont pas fournies.

## Variables Vercel

Configurées pour Production et Preview :

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_PRINCESSE_WHATSAPP`
- `PRINCESSE_NAME`, `PRINCESSE_EMAIL`, `PRINCESSE_PHONE`, `PRINCESSE_WHATSAPP`
- `PRINCESSE_ADDRESS`, `PRINCESSE_HOURS`, `PRINCESSE_TIMEZONE`
- `DATABASE_URL`, `DIRECT_URL`
- `AUTH_SECRET`, `ADMIN_PASSWORD_HASH`

Les URL PostgreSQL utilisent `sslmode=verify-full`. Les secrets ne sont pas suivis par Git. Le mot de passe administrateur généré a été placé dans le presse-papiers Windows pour remise au propriétaire ; seul son hash bcrypt est stocké dans Vercel.

## Migrations et données

- `20260714190000_init` appliquée.
- `20260715050000_production_booking` appliquée.
- `prisma migrate status` : schéma à jour.
- Seed des services et coiffures temporaires exécuté.
- Les rendez-vous de validation ont été archivés ; aucun compte cliente n’est créé par l’application.

## Vérifications

- `npm run lint` : réussi.
- `npm test` : 17 tests réussis.
- `npm run test:e2e` : 7 réussis, 1 scénario de concurrence volontairement exécuté sur Chromium uniquement.
- `npm run build` : réussi.
- `npm audit` : 0 vulnérabilité.
- Production : 8 pages publiques HTTP 200, santé application/DB OK, en-têtes de sécurité présents.
- Réservation réelle : création 201, persistance vérifiée après plusieurs appels serveur, doublon 409.
- Administration réelle : connexion, lecture, confirmation, archivage et déconnexion réussies.
- Créneau réapparu dans les disponibilités après archivage.
- WhatsApp : mode manuel confirmé, URL et champs préremplis vérifiés.
- Email : `emailSent=false`, conformément à l’absence de clés Resend.

## Maintenance

- Services, tarifs et textes : modifier `src/data/site.ts`, puis synchroniser le seed si nécessaire.
- Horaires et règles : modifier `src/config/availability.ts`.
- Photos : remplacer les placeholders dans `public/images/hairstyles/` et mettre à jour les chemins dans `src/data/site.ts`.
- Variables : modifier séparément Preview et Production dans Vercel, puis redéployer.
- Schéma : créer une migration Prisma, la tester en Preview, puis exécuter `npm run prisma:deploy` avec `DIRECT_URL` avant Production.

## Sauvegarde et rollback

- Sauvegarde : utiliser les sauvegardes/restaurations et branches proposées par Neon avant toute migration destructive ; exporter ponctuellement les données critiques si nécessaire.
- Rollback applicatif : sélectionner le dernier déploiement sain dans Vercel et utiliser Promote/Rollback.
- Rollback base : privilégier une migration corrective. Restaurer une sauvegarde Neon seulement après évaluation de la perte de données et pendant une fenêtre de maintenance.
- Diagnostic détaillé : voir `OPERATIONS.md` et `VERCEL_CHECKLIST.md`.

## Limites restantes

- Localisation, horaires définitifs, informations légales et politique d’annulation restent à confirmer.
- Les photos et contenus définitifs restent des placeholders.
- Resend, Meta, Turnstile et Sentry nécessitent encore leurs identifiants réels respectifs.
