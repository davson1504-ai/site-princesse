# Configuration email
1. Créer un compte Resend, vérifier le domaine et créer une clé.
2. Renseigner `RESEND_API_KEY`, `EMAIL_FROM` et `PRINCESSE_EMAIL` dans l'environnement.
3. Pour Gmail SMTP alternatif, créer un mot de passe d'application Google (2FA requis) et utiliser un transport SMTP côté serveur uniquement. Ne jamais exposer le mot de passe au navigateur.
