# Règles métier observées

Ce document décrit l'implémentation actuelle, sans la valider comme cible.

## Gestion financière

Les calculs sont réalisés côté navigateur dans `public/javascripts/docelec/gestion.js`. La chaîne observée combine montant initial et taux de change, TVA simple ou mixte, frais de gestion, récupération de TVA, montant TTC et reliquat. Le frontend sait aussi cloner/projeter une ligne vers une autre année avec un taux d'évolution.

Point important : ces règles ne sont pas imposées par le contrôleur API. Un appel direct peut enregistrer des valeurs sans exécuter les calculs.

## Groupements de commandes

Le dashboard rapproche une gestion annuelle des GC dont la période contient l'année de gestion. Le comportement en cas de plusieurs GC simultanément applicables doit être clarifié.

## Statistiques

Le frontend gère saisie mensuelle, total annuel et indicateurs. Le dashboard public calcule un coût par usage par division du montant annuel par le nombre d'usages. Le cas d'un usage nul doit être spécifié.

La sortie Esgbu utilise les statistiques de dimension `total`, exclut actuellement le report 3 et tient compte du paramétrage annuel `calcul_esgbu`.

## SUSHI / COUNTER

Le frontend construit l'URL SUSHI avec les paramètres fournisseur. Le backend récupère le JSON, parcourt les Report_Items, filtre la métrique demandée et agrège les valeurs par mois.

Une anomalie est visible dans `stats.js` : certaines expressions de filtre utilisent une affectation `d.cle = ...` au lieu d'une comparaison. Ce comportement doit être couvert par un test avant correction.

## Signalement

Les sorties enrichies associent les métadonnées de signalement aux ressources configurées pour être signalées. Une sortie spécifique Primo existe.

## Permissions UI

Le groupe `guest` désactive l'édition dans l'écran maître. Il s'agit d'une restriction d'interface et non d'une autorisation serveur.
