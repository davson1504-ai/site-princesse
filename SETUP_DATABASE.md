# PostgreSQL
Créer une base PostgreSQL (Neon, Supabase ou autre), copier l'URL dans `DATABASE_URL`, puis lancer `npm run prisma:generate`, `npm run prisma:migrate` et `npm run db:seed`. En production, `npm run prisma:deploy` applique les migrations existantes. Activer les sauvegardes. Sans URL, le mode local utilise `data/appointments.json`; ne pas l'utiliser sur Vercel.
