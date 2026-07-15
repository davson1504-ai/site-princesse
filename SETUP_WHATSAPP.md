# Configuration WhatsApp
1. Créer une application Meta Business et activer WhatsApp Cloud API.
2. Configurer le numéro Business, le Phone Number ID, le token permanent et si nécessaire un modèle approuvé.
3. Renseigner les variables `WHATSAPP_*` sur Vercel.
4. Tester avec les numéros autorisés puis passer l'application en production.

Sans cette configuration, le site utilise `wa.me`. Ce mode n'envoie rien automatiquement : la cliente confirme l'envoi dans WhatsApp.
