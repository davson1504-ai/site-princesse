# Audit initial — 22 juillet 2026

- Branche initiale : `main`, commit `63b8d2e`.
- Branche de travail : `feat/beauty-hair-by-nao`.
- Dépôt : `origin` sur `davson1504-ai/site-princesse`.
- Stack : Node 24.14, npm 11.9, Next.js 16.2.10, Prisma 7.8, PostgreSQL.
- Base locale : URL configurée vers localhost mais serveur indisponible; aucune donnée ni migration n’a été modifiée.
- État initial : 15 images cliente non suivies présentes; les quatre fichiers brouillons/manifeste annoncés étaient absents.
- Modèles préexistants : Appointment, Service, Hairstyle, BlockedSlot, NotificationLog, AdminAuditLog et RateLimitBucket.
- Sécurité préservée : authentification JWT/cookie, rate limit, Turnstile, contrôle d’origine et transactions sérialisables.
- Tests : Vitest et Playwright présents.
- Secrets : `.env.local` ignoré et non suivi.
- Sauvegarde logique : non créée car PostgreSQL local est inaccessible; aucune opération de production n’a été lancée.
