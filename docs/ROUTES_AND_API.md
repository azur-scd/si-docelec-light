# Routes Web et API actuelles

## Pages Web

Les routes HTML sont définies dans `routes/routes.js`.

### Publiques ou non protégées par `isLoggedIn`

- `/`
- `/error`
- `/login`
- `/cas_login`
- `/logout`
- `/admin-docelec-stats`
- `/admin-docelec-suivistats`
- `/admin-help`
- `/public-iub-explore`
- `/public-docelec-dashboard`
- `/public-docelec-stats-ebooks`
- `/public-apps-app`
- `/public-apps-utils`
- `/public-apps-utilebooks`
- `/public-apps-utiladmingen`

La présence de routes nommées `admin-*` sans middleware d'authentification doit être considérée comme un fait technique à examiner, pas comme une intention fonctionnelle.

### Protégées par `isLoggedIn`

- `/admin-docelec-master`
- `/admin-docelec-signalement`
- `/admin-docelec-gestion`
- `/admin-docelec-dashboardgestion`
- `/admin-docelec-dashboardgc`
- `/admin-config`
- `/admin-disc`

## API

L'API est définie directement sur l'application Express, sans Router séparé et sans middleware d'authentification visible dans ce fichier.

Domaines exposés :
- `/api/bus*` : bibliothèques ;
- `/api/horaires*` : horaires ;
- `/api/users*` : utilisateurs ;
- `/api/discs*` : disciplines ;
- `/api/bdds*` : bases ;
- `/api/signalement*` : signalement, import/export ;
- `/api/gestion*` : gestion financière ;
- `/api/bdd2disc*` : ventilation disciplinaire ;
- `/api/gcs*` : groupements de commandes ;
- `/api/stats_reports*` : référentiel des mesures ;
- `/api/bdds_stats*` : statistiques ;
- `/api/stats_suivi*` : suivi de saisie ;
- `/api/sushi_harvest*` : collecte SUSHI ;
- `/api/bdds_indicators` et `/api/bdds_esgbu` : indicateurs.

## Style d'API

Les URL mélangent ressource et action, par exemple `/create`, `/:id/update`, `/:id/delete`. Elles utilisent néanmoins les verbes HTTP POST/PUT/DELETE. Une normalisation REST pourra être envisagée dans la cible, mais changer ces URL pourrait casser le JavaScript frontend existant.

## Points à vérifier avant modification

- recenser les appels AJAX/Fetch effectués depuis `public/` et les vues ;
- identifier les consommateurs externes éventuels, notamment la route `/api/v1/horaires/custom/9` ;
- vérifier les formats de réponse réellement attendus ;
- documenter les imports/exports de signalement ;
- documenter les paramètres et effets de la collecte SUSHI ;
- ne pas renommer une route avant d'avoir identifié tous ses consommateurs.
