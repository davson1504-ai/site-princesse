# Rapport de mise en production — Beauty Haïr by Nao

Date : 22 juillet 2026

## Déploiements

- Production : https://site-princesse.vercel.app
- Administration : https://site-princesse.vercel.app/admin
- Preview validée : https://site-princesse-pvvozk2uy-davson1504s-projects.vercel.app
- Projet Vercel : `site-princesse`
- Base : Neon PostgreSQL, projet `princesse-db`
- Branche Preview isolée : `preview-beauty-hair-by-nao`
- Sauvegarde avant migration : `backup-before-beauty-hair-20260722`

## Livraison

- Rebranding complet « Beauty Haïr by Nao » et coordonnées réelles.
- Catalogue de 12 produits actifs, demande manuelle par WhatsApp, sans paiement en ligne.
- Catalogue de 5 coiffures actives et manifeste des 15 images clientes intégrées.
- Tarifs tresses : XS 110 €, S 90 €, M 70 €, L 50 €, supplément longueur +10 €.
- Calendrier public limité aux dates explicitement publiées par l'administratrice.
- Administration des disponibilités, coiffures, produits et tarifs avec audit des mutations.
- Réservation atomique, limitation à 7 rendez-vous par jour et refus serveur d'une date dépubliée.

## Migration et données

- Migration additive appliquée : `20260722090000_beauty_hair_catalogue_availability`.
- Validation préalable sur la branche Neon Preview.
- Production après migration et seed idempotent : 9 rendez-vous conservés, 12 produits actifs, 5 coiffures actives, 4 variantes tarifaires, 0 date publiée par défaut.
- Aucun secret n'est suivi par Git ou envoyé dans le contexte Vercel (`.vercelignore`).

## Vérifications

- `npm run lint` : réussi.
- `npm test` : 22 tests réussis.
- `npm run test:e2e` : 7 réussis, 1 scénario mobile de concurrence ignoré conformément à la configuration du projet ; la concurrence est couverte sur Chromium.
- `npm run build` : réussi avec Next.js 16.2.10.
- `npm audit` : 0 vulnérabilité.
- Production : pages principales et administration HTTP 200.
- `/api/health` : `application=ok`, `database=ok`.
- `/api/pricing` : XS/S/M/L et supplément conformes.
- Les E2E couvrent publication, réservation M à 70 €, supplément à 80 €, affichage admin, dépublication et refus HTTP 409.

## Intégrations et limites

- WhatsApp utilise le lien manuel `wa.me`; aucun envoi automatique n'est revendiqué sans identifiants Meta.
- Resend, Turnstile et Sentry restent conditionnels à leurs variables réelles.
- Les références marquées `VERIFY` dans le brouillon produit doivent être confirmées par la cliente avant toute modification de prix ou de nom commercial.
- Le futur domaine est documenté dans `docs/client-assets/FUTURE_DOMAIN.md`.

## Rollback

- Application : promouvoir le dernier déploiement Vercel sain.
- Base : privilégier une migration corrective ; la branche Neon `backup-before-beauty-hair-20260722` contient l'état immédiatement antérieur à cette migration.
