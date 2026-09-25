# Constats de sécurité initiaux

Audit statique préliminaire : des protections supplémentaires peuvent exister hors dépôt.

## Points prioritaires

- Les routes API ne montrent pas de middleware d'authentification ou de rôle.
- Le modèle User contient le champ password et les contrôleurs renvoient des instances sans exclusion explicite de ce champ.
- La création d'utilisateur hache le mot de passe, tandis que la mise à jour passe directement le body au modèle : le changement de mot de passe doit être vérifié.
- Le backend SUSHI effectue un fetch vers une URL fournie par le client : une politique stricte d'URL autorisées est nécessaire.
- L'upload écrit un fichier à partir du nom fourni : nom, chemin, taille et type doivent être contrôlés.
- Le secret de session est codé en dur, le cookie n'est pas marqué secure et le store mémoire semble utilisé.
- Les contrôleurs acceptent largement `req.body` et `req.query` sans schéma de validation visible.
- Le modèle Bdd contient des identifiants fournisseurs et clés SUSHI qui nécessitent des règles d'exposition et de stockage.

## Fichier .env

Un fichier `.env` est versionné. Son contenu ne doit pas être reproduit dans la documentation. L'historique doit être vérifié et les éventuels secrets réels remplacés si nécessaire.

## Ordre de traitement proposé

Avant les refactorisations fonctionnelles : tests de non-régression, autorisations serveur, limitation des données utilisateur exposées, sécurisation SUSHI et upload, externalisation des secrets, validation des entrées.
