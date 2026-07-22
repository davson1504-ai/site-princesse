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

## Ouverture des réservations

1. Ouvrir `/admin/disponibilites`.
2. Créer ou modifier la journée, ses horaires, sa pause et son intervalle.
3. Publier la date : elle apparaît en vert dans le calendrier public.
4. Dépublier la date pour bloquer toute nouvelle réservation ; les rendez-vous existants sont conservés.

Les tarifs se gèrent dans `/admin/tarifs` et sont stockés en centimes : XS 11000, S 9000, M 7000, L 5000, supplément longueur 1000.

## Sauvegarde et rollback

Activer les sauvegardes du fournisseur PostgreSQL. Avant une migration importante, créer une sauvegarde vérifiée. Pour un rollback, restaurer le déploiement Vercel précédent; si le schéma est incompatible, restaurer la sauvegarde correspondante. Ne jamais supprimer le schéma de production.
