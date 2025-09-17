# SI-SCD

Version du SI-SCD basée sur Node.js, Express, Sequelize et ejs pour le moteur de rendu

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
