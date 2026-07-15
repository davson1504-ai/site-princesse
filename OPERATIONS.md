# Exploitation et diagnostic

## Santé

- `GET /api/health` retourne l'état minimal de l'application et de la base.
- `GET /api/admin/health` exige une session administratrice.
- `database: unavailable` impose de vérifier `DATABASE_URL`, le réseau et PostgreSQL.

## Incident de réservation

1. Noter la référence affichée, sans copier les coordonnées dans les journaux publics.
2. Vérifier le rendez-vous dans l'administration.
3. Consulter les journaux Vercel par route et référence technique.
4. Si une notification échoue, conserver le rendez-vous et utiliser le secours WhatsApp manuel.

## Sauvegarde et rollback

Activer les sauvegardes du fournisseur PostgreSQL. Avant une migration importante, créer une sauvegarde vérifiée. Pour un rollback, restaurer le déploiement Vercel précédent; si le schéma est incompatible, restaurer la sauvegarde correspondante. Ne jamais supprimer le schéma de production.
