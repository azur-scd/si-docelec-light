# Modèle de données actuel

> Synthèse des modèles Sequelize observés. Les contraintes décrites sont celles du code, pas nécessairement celles réellement présentes dans MySQL.

## Tables principales

| Modèle | Table | Rôle |
|---|---|---|
| Bdd | `bdds` | référentiel central des ressources électroniques |
| BddSignalement | `bdds_signalement` | métadonnées de signalement/diffusion |
| BddGestion | `bdds_gestion` | données financières annuelles |
| BddDiscipline | `bdds_disc` | ventilation d'une base par discipline |
| BddStat | `bdds_stats` | mesures statistiques |
| StatSuivi | `stats_suivi` | suivi annuel de la saisie |
| StatReport | `stats_reports` | référentiel des types de mesures |
| Gc | `gcs` | groupements de commandes |
| Disc | `disciplines` | référentiel des disciplines |
| Bu | `bus` | bibliothèques |
| Horaires | `horaires` | horaires des bibliothèques |
| User | `users_tmp` | utilisateurs/authentification |

## Relations déclarées

```text
Bu 1 ── n User
Bu 1 ── n Horaires

Bdd 1 ── 1 BddSignalement
Bdd 1 ── n BddGestion
Bdd 1 ── n BddDiscipline n ── 1 Disc
Bdd 1 ── n BddStat n ── 1 StatReport
Bdd 1 ── n StatSuivi

Bdd ── Gc : relations déclarées dans les deux sens via bdd.gc_id et gc.bdd_id
```

## Bdd

Le modèle central contient des informations de typologie, acquisition, périmètre, signalement, statistiques et SUSHI. Plusieurs informations sensibles ou techniques sont stockées directement dans cette table : `sushi_api_key`, `stats_login`, `stats_mdp`, identifiants SUSHI et URL d'administration.

Les champs `gestion`, `stats_collecte` et `calcul_esgbu` sont des `TEXT` avec getter JSON. Le setter ne sérialise pas explicitement avec `JSON.stringify` ; le comportement réel doit être vérifié sur la base existante.

## Points d'attention du modèle

1. `BddStat.stats_reports_id` déclare une référence vers `stats_reports_basic`, alors que le modèle `StatReport` utilise la table `stats_reports`.
2. Les relations Bdd/Gc utilisent simultanément `bdds.gc_id` et `gcs.bdd_id`, ce qui crée deux mécanismes de liaison dont la sémantique doit être clarifiée.
3. Les associations `BddGestion.belongsTo(BddDiscipline, {through: "bdds", ...})` et réciproques sont atypiques : `through` n'est normalement pas utilisé avec `belongsTo`. Leur effet réel doit être testé.
4. `Disc.parent_id` suggère une hiérarchie, mais aucune auto-association Sequelize n'est déclarée.
5. Plusieurs montants financiers sont en `FLOAT`; pour des montants monétaires, la cible devra examiner l'usage de `DECIMAL`.
6. Aucune migration Sequelize n'a été identifiée dans l'arbre observé. Le schéma réel MySQL doit donc être comparé aux modèles avant toute migration.

## Données à caractère sensible

Les mots de passe locaux sont stockés sous forme de hash bcrypt côté utilisateur. En revanche, des identifiants/mots de passe fournisseurs et clés SUSHI sont présents dans le modèle `Bdd`. Leur stockage, exposition API et cycle de vie devront faire l'objet d'un audit spécifique.
