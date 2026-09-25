# État actuel de SI-Docelec Light

> Rétro-documentation de l'état observé sur la branche `master` au 25 septembre 2026. Ce document décrit l'existant ; il ne constitue pas la cible fonctionnelle future.

## Vue d'ensemble

SI-Docelec Light est une application web monolithique Node.js/Express avec rendu serveur EJS, API HTTP et persistance MySQL via Sequelize. Le point d'entrée est `server.js`. Deux ensembles de routes sont chargés : `api/routes/routes.js` pour l'API et `routes/routes.js` pour les pages HTML.

Le dépôt conserve le nom historique `si-scd-prod` dans `package.json`, la configuration de base de données et plusieurs URL/chemins. Le README a déjà été enrichi par Copilot ; ses commentaires doivent être considérés comme indicatifs lorsqu'ils ne sont pas confirmés par le code.

## Domaines fonctionnels constatés

- référentiel des ressources électroniques / bases (`Bdd`) ;
- signalement et exposition de métadonnées de bases ;
- gestion financière annuelle et prévisionnelle ;
- ventilation par discipline ;
- groupements de commandes (GC) ;
- statistiques d'usage et suivi de leur saisie ;
- collecte SUSHI/COUNTER ;
- bibliothèques (BU) et horaires ;
- utilisateurs et authentification ;
- pages publiques : tableaux de bord, statistiques ebooks, catalogue d'applications/utilitaires, exploration IUB.

## Interface

Le rendu HTML repose sur EJS. Les vues métier sont principalement dans `views/pages/docelec/`, les écrans d'administration dans `views/pages/admin/`, les pages d'outils dans `views/pages/apps/` et les composants communs dans `views/partials/`.

Le frontend embarque de nombreuses bibliothèques JavaScript/CSS directement sous `public/`, notamment Bootstrap, D3, DevExtreme et divers plugins historiques. Cette partie devra faire l'objet d'un inventaire de versions et d'usages avant modernisation.

## Authentification constatée

Deux stratégies Passport sont configurées : authentification locale et CAS. L'utilisateur est chargé depuis la table `users_tmp`. Après connexion locale, la redirection dépend de `user.groupe` : `admin`, `docelec`, `horaires` ou `guest`.

La fonction `isLoggedIn` protège certaines pages, mais pas toutes les pages d'administration. L'API définie dans `api/routes/routes.js` n'applique pas de middleware d'authentification au niveau du fichier de routes.

## Déploiement constaté

Le dépôt fournit un `Dockerfile` Node 20 et un `docker-compose.yml` avec deux services : application et MySQL 8. `wait-for-it.sh` est utilisé pour attendre MySQL.

## Éléments manifestement hérités ou à vérifier

- nom de package `si-scd-prod` ;
- base `si_scd_prod` ;
- URL CAS `serverBaseURL` en HTTP et chemin `si-scd-prod` ;
- redirection du groupe `horaires` vers l'ancien domaine `si-scd.unice.fr` ;
- route CAS redirigeant vers `./admin/docelec/master`, qui ne correspond pas aux routes Express actuelles ;
- vue `dashboard_gestion.old.ejs` conservée dans l'arbre ;
- fichiers de statistiques ebooks 2022 versionnés sous `uploads/`.

## Statut documentaire

Ce fichier doit rester synchronisé avec le code. Toute évolution fonctionnelle significative doit mettre à jour l'état courant et, lorsque la cible sera définie, être distinguée des spécifications cibles.
