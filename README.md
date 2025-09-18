# SI-Docelec light
En développement

Version du SI-Docelec basée sur Node.js, Express, Sequelize et ejs pour le moteur de rendu

## Installation et lancement avec Docker

Cette application peut être facilement lancée avec Docker et docker-compose.

### Prérequis

- Docker
- Docker Compose

### Lancement de l'application

1. **Cloner le projet** (si ce n'est pas déjà fait)
   ```bash
   git clone <url-du-repo>
   cd si-scd-prod
   ```

2. **Configuration des variables d'environnement**
   
   Le fichier `.env` à la racine du projet contient toutes les variables d'environnement nécessaires :
   - Configuration MySQL (mot de passe root, nom de base de données)
   - Configuration de connexion de l'application à la base de données
   - Port d'écoute de l'application

   Vous pouvez modifier ces valeurs selon vos besoins en éditant le fichier `.env`.

3. **Lancer l'application avec docker compose**
   ```bash
   docker compose up -d
   ```

4. **Accéder à l'application**
   
   L'application sera accessible sur : http://localhost:7200

### Commandes utiles

- **Voir les logs de l'application** :
  ```bash
  docker compose logs app
  ```

- **Voir les logs de la base de données** :
  ```bash
  docker compose logs db
  ```

- **Suivre les logs en temps réel** :
  ```bash
  docker compose logs -f app
  ```

- **Arrêter l'application** :
  ```bash
  docker compose down
  ```

- **Arrêter et supprimer les volumes (⚠️ supprime les données)** :
  ```bash
  docker compose down -v
  ```

- **Reconstruire l'image en cas de modification du code** :
  ```bash
  docker compose up --build
  ```

### Résolution de problèmes

- **L'application se redémarre en boucle** : Vérifiez les logs avec `docker compose logs app`. Cela peut être dû à des problèmes de compatibilité entre les versions des dépendances.

- **Problème de connexion à la base de données** : Assurez-vous que la base MySQL est complètement initialisée avant que l'application ne démarre. Le healthcheck configuré dans docker-compose.yml aide à gérer cela automatiquement.

### Structure des fichiers Docker

- `Dockerfile` : Construction de l'image Node.js de l'application
- `docker-compose.yml` : Orchestration des services (app Node.js + base MySQL)
- `.dockerignore` : Fichiers à exclure lors de la construction de l'image
- `.env` : Variables d'environnement pour la configuration

# Architecture (par copilot)

## 1. Structure générale

L’application suit une architecture classique Node.js Express / MVC, organisée en plusieurs dossiers principaux :

routes/ : Définition des routes Express pour la partie front-end et back-end.

api/controllers/ : Contrôleurs métier (logique des endpoints API).

api/models/ : Définition des modèles Sequelize (ORM pour la base de données).

views/ : Templates EJS pour le rendu côté serveur (pages web dynamiques).

## 2. Routage

Les routes sont définies dans routes/routes.js pour la partie front (pages web) et dans api/routes/routes.js pour l’API REST.

Exemple :

```js
app.get('/login', function(req, res, next) {
  res.render('pages/auth/login', {...});
});
```

Les routes API exposent des endpoints pour manipuler les entités métier (bdd, statSuivi, user, etc.).

Les routes sont sécurisées via Passport (authentification).

## 3. Modèle de données

Les modèles sont définis via Sequelize dans api/models/.

Exemple de modèle :

```js
// api/models/bddGestion.js
const BddGestion = sequelize.define('BddGestion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  // autres champs métier...
});
```

Les modèles sont reliés entre eux par des clés étrangères (ex : bdd_id), et ils représentent les différentes entités manipulées par l’application (BDD, gestion, signalement, stats…).

## 4. Contrôleurs

Les contrôleurs dans api/controllers/ contiennent la logique métier : CRUD sur les modèles, réponses aux requêtes, jointures, filtrage, etc.

Exemple :

```js
exports.list = function(req, res) {
  StatSuivi.findAll({where : req.query}).then(rows => res.json(rows));
};
```

Les contrôleurs sont regroupés via un index (api/controllers/index.js) et exposés dans les routes API.

## 5. Vue / Frontend

Les vues sont des fichiers EJS dans le dossier views/.

Les pages sont composées via des includes de partials (head, sidebar, navbar, etc.).

Les templates affichent des données dynamiques, par exemple la liste des applications, la configuration, les dashboards, etc.

L’accès aux différentes fonctionnalités dépend du groupe de l’utilisateur (admin, docelec, horaires…).

## 6. Authentification et sécurité

Utilisation de Passport.js pour l’authentification.

Les routes critiques sont protégées par un middleware isLoggedIn.

La redirection post-login dépend du groupe utilisateur (req.user.groupe).

## 7. Fonctionnalités

Applications métiers : gestion et suivi de bases de données, signalements, statistiques d’usage, gestion budgétaire, exploration de données, etc.

API REST : manipulation et consultation des données via endpoints dédiés.

Interface graphique : dashboards, tableaux, visualisations, etc.

## 8. Exemples d’intégration

Des applications externes ou complémentaires sont référencées dans l’interface (SudocToolkit, Data-Explorer, CheckCB, etc.).

Certaines pages proposent des liens d’installation, de documentation, ou des exemples d’utilisation.

## 9. Résumé graphique

```
[Client Web (EJS)]
      |
      v
[Express Routes]---[Passport Auth]
      |
      v
[API Controllers]---[API Routes]
      |
      v
[Sequelize Models] <-> [Base de données]
```

## En résumé :

L’application azur-scd/si-scd-prod est une plateforme web Node.js Express structurée en MVC, avec une API REST (Sequelize), une authentification sécurisée (Passport), des vues dynamiques (EJS), et de nombreuses fonctionnalités métier autour de la gestion documentaire et des statistiques.

# Analyse des dépendances (par copilot)

## Version de node.js

Le fichier package.json actuel ne précise pas la version de Node.js utilisée (aucune section "engines" ou version explicitement définie). La version de Node utilisée dépend donc de celle installée sur le serveur ou la machine où tourne l’application.

Pour garantir la compatibilité et faciliter le déploiement, il est conseillé d’ajouter une section "engines" dans le package.json.

Copilot estime que toutes tes dépendances (Express, Sequelize, Passport, etc.) sont parfaitement compatibles avec Node.js 18.x et 20.x (LTS) et recommande d’utiliser la version LTS la plus récente, c’est-à-dire Node.js 20.x.

Code à ajouter dans package.json :

```JSON
"engines": {
  "node": ">=20.0.0"
}
```

Si on utilise Docker cette ligne dans package.json garantit que la bonne version de Node sera utilisée. Pour l'intégration continue (GitHub Actions, GitLab CI…), spécifieil faudrait également node-version: 20.x.

## Framework, serveur et moteur de template

* __express__ : Framework web principal, structure les routes et la logique serveur.
* __ejs__ : Moteur de templates pour générer les pages HTML dynamiques.
* __express-session__ : Gestion des sessions utilisateurs côté serveur.

## Sécurité, authentification et gestion des droits

* __passport__ : Middleware pour l’authentification utilisateur.
* __passport-cas__ : Authentification via le protocole CAS (Central Authentication Service).
* __passport-local__ : Authentification locale (login/mot de passe).
* __bcryptjs__ : Hashage des mots de passe pour sécuriser les données utilisateurs.
* __accesscontrol__ : Gestion fine des permissions et rôles.

## Base de données et ORM

* __sequelize__ : ORM pour manipuler la base MySQL en objets JavaScript.
* __mysql2__ : Connecteur rapide pour MySQL.

## Utilitaires et middlewares

* __connect-busboy__ : Gestion de l’upload de fichiers (stream).
* __cookie-parser__ : Parse et gère les cookies HTTP.
* __cors__ : Autorise les requêtes cross-origin (CORS).

## Outils de développement
* __nodemon__ : Redémarrage automatique du serveur lors des modifications.
* __node-gyp__ & __node-pre-gyp__ : Compilation et gestion des modules natifs Node.js.

## Visualisation des liens et dépendances

```
[Express] <--- [express-session] <--- [passport] <--- [passport-cas / passport-local]
     |                    |
     |                    +--- [accesscontrol] (permissions)
     |                    +--- [cookie-parser], [bcryptjs]
     |
     +--- [ejs] (templates)
     |
     +--- [sequelize] <--- [mysql2] (base de données)
     |
     +--- [connect-busboy] (upload fichiers)
     +--- [cors] (CORS)
```

## Points d’attention

* __Sécurité__ : L’application combine authentification locale et CAS, avec hashage des mots de passe et gestion des droits.
* __Scalabilité__ : Utilisation d’un ORM (Sequelize), facilitant la gestion évolutive de la base de données.
* __Interopérabilité__ : CORS et gestion des sessions permettent une ouverture vers des clients variés (fronts externes, API).
* __Déploiement__ : Outils comme nodemon et node-gyp facilitent le développement et le packaging sur différentes plateformes.

connect-busboy : c’est le point faible. Il est obsolète, peu maintenu, et peut poser souci avec les versions récentes d’Express.

passport-cas : peu de mises à jour, donc surveille bien les failles potentielles.
