# Déploiement Vercel
1. Importer le dépôt dans Vercel.
2. Ajouter toutes les variables de `.env.example` avec leurs vraies valeurs.
3. Connecter PostgreSQL, lancer `npm run prisma:deploy` puis `npm run db:seed`, et vérifier le domaine Resend.
4. Configurer le domaine et `NEXT_PUBLIC_SITE_URL`.
5. Exécuter lint, tests et build; tester une réservation complète avant ouverture.
