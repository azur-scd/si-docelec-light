# Cartographie fonctionnelle actuelle

> Première cartographie code ↔ fonction. Elle sera affinée lors de la définition du PRD.

| Domaine | Modèles principaux | Contrôleurs | Vues principales |
|---|---|---|---|
| Référentiel docelec | Bdd | bdd | docelec/master |
| Signalement | BddSignalement, Bdd | bddSignalement | docelec/signalement |
| Gestion financière | BddGestion, Bdd | bddGestion | docelec/gestion, dashboard_gestion |
| Disciplines | Disc, BddDiscipline | disc, bddDiscipline | admin/disc |
| Groupements de commandes | Gc, Bdd | gc, bddGestion | docelec/dashboard_gc |
| Statistiques | BddStat, StatReport | bddStat, statReport | docelec/stats |
| Suivi statistiques | StatSuivi | statSuivi | docelec/suivi_stats |
| SUSHI/COUNTER | Bdd, BddStat | sushiHarvest | intégré au domaine statistiques |
| BU | Bu | bu | admin/config |
| Horaires | Horaires, Bu | horaires | pas de vue dédiée actuelle identifiée dans ce dépôt |
| Utilisateurs | User, Bu | user | admin/config, auth/login |
| Dashboard public | Bdd et données associées | API existante | docelec/public_dashboard |
| Stats ebooks publiques | fichiers versionnés | — | docelec/public_stats_ebooks |
| Applications/utilitaires | — | — | pages/apps/* |
| IUB | — | — | iub/explore |

## Flux type

```text
Vue EJS
  ↓ JavaScript navigateur
endpoint /api/*
  ↓
contrôleur
  ↓
modèle(s) Sequelize
  ↓
MySQL
```

Les vues EJS sont généralement des conteneurs de page qui chargent des scripts et actifs sous `public/`. Pour obtenir une cartographie exhaustive fonction → fonction JavaScript → endpoint, une seconde passe doit inventorier les scripts applicatifs de `public/`.

## Fonctionnalités transversales

- authentification locale/CAS ;
- session utilisateur ;
- imports/exports de signalement ;
- calculs et agrégations de gestion/statistiques ;
- exposition publique de certains tableaux de bord ;
- liens vers applications et utilitaires externes.

## Hors conclusion à ce stade

La présence d'un fichier ou d'une route ne permet pas de savoir si la fonctionnalité est encore utilisée en production. La phase PRD devra classer chaque domaine : conserver, corriger, refactoriser, remplacer, supprimer ou hors périmètre.
