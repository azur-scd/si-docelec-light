# Architecture technique actuelle

> Description de l'architecture observée, sans présumer de l'architecture cible.

## Flux principal

```text
Navigateur
  ├─ pages HTML → routes/routes.js → vues EJS
  └─ appels /api/* → api/routes/routes.js → contrôleurs → modèles Sequelize → MySQL
```

`server.js` configure Express, les parseurs URL/JSON, Busboy, CORS, les sessions, Passport, EJS, les fichiers statiques et les deux modules de routes.

## Backend

- Runtime : Node.js >= 20 déclaré dans `package.json`.
- Framework : Express 4.
- ORM : Sequelize 6.
- SGBD : MySQL via `mysql2`.
- Templates : EJS.
- Sessions : `express-session`.
- Authentification : Passport Local + CAS.
- Uploads : `connect-busboy`.
- CORS : activé globalement.

Les contrôleurs sont centralisés par `api/controllers/index.js`. Les modèles sont chargés dynamiquement par `api/models/index.js`.

## Configuration de base de données

`api/models/index.js` définit deux variables d'environnement logiques, `env` et `prod`, mais utilise `prod`. En l'absence de `NODE_ENV`, `prod` vaut `production`. Les trois environnements du `config.json` sont actuellement identiques.

Point important : les variables `DB_HOST`, `DB_USER`, `DB_PASSWORD` et `DB_NAME` passées par Docker Compose ne sont pas utilisées par `config.json` dans l'état observé. La configuration contient des valeurs statiques.

## Frontend

Les pages sont rendues côté serveur. Les partials EJS structurent les en-têtes, navigations, sidebars et scripts. Les actifs sont servis directement depuis `public/`.

Le dépôt embarque localement un volume important de bibliothèques frontend. Leur présence dans l'arbre ne prouve pas qu'elles soient toutes encore utilisées.

## Déploiement Docker

`Dockerfile` :
- image `node:20` ;
- `npm install` ;
- copie du code ;
- port 7200 ;
- commande par défaut `node server.js`.

`docker-compose.yml` remplace toutefois la commande par `wait-for-it.sh db:3306 -- npm start`.

### Anomalie bloquante potentielle

`package.json` ne définit pas de script `start`, seulement `dev`. La commande Compose `npm start` est donc incohérente avec le manifeste actuel et doit être testée/corrigée avant de considérer le déploiement Docker comme reproductible.

## Tests et qualité

Aucun framework de test ni script `test` n'est déclaré dans `package.json`. Aucun mécanisme CI n'a été identifié à la racine examinée. La rétro-documentation ne permet donc pas d'affirmer l'existence d'une couverture automatisée.

## Architecture cible

Non définie à ce stade. Les choix de refactorisation, séparation frontend/backend, remplacement de dépendances ou évolution du modèle de données relèveront du PRD et des spécifications cibles.
