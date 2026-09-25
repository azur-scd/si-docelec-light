# Cartographie frontend ↔ API

`apiUrls.js` centralise les URL métier et `crud.js` fournit les opérations GET, POST create, PUT update et DELETE.

| Script | Fonction | API principales |
|---|---|---|
| docelec/master.js | référentiel central | bdds, gestion, signalement, GC, stats, disciplines |
| docelec/gestion.js | saisie et calcul budgétaire | gestion, gestion_custom, bdds |
| docelec/dashboard_gestion.js | synthèse gestion | gestion_custom |
| docelec/dashboard_gc.js | synthèse GC | gcs_custom |
| docelec/signalement.js | signalement et fichiers | signalement, signalement_custom |
| docelec/stats.js | statistiques, indicateurs, SUSHI | stats, reports, suivi, SUSHI |
| docelec/suivi_stats.js | suivi de saisie | stats_suivi |
| docelec/public_dashboard.js | indicateurs publics | bdds_esgbu, bdds_indicators |
| docelec/public_stats_ebooks.js | fichiers ebooks | signalement_readdir, signalement_export |
| admin/config.js | utilisateurs et BU | users, bus |
| admin/disc.js | disciplines hiérarchiques | discs |

Le frontend dépend fortement des noms de champs JSON, des URL historiques, des valeurs de `lookupArrays.js` et de DevExtreme. Une évolution d'API devra préserver ces contrats ou les migrer explicitement.

Des fichiers anciens, notamment `gestion_old.js` et `dashboard_gestion.old.ejs`, restent dans l'arbre.
