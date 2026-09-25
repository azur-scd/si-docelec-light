# Audit initial de rétro-documentation

> Phase 1 — constats issus du dépôt actuel. Priorités techniques, pas décisions de produit.

## Constats prioritaires

### P0 — à vérifier avant toute évolution importante

1. **Docker Compose appelle `npm start` mais aucun script `start` n'existe dans `package.json`.**
2. **La configuration DB Docker ne semble pas consommée par Sequelize.** Docker transmet `DB_*`, tandis que `api/config/config.json` contient des valeurs statiques.
3. **Un fichier `.env` est versionné à la racine.** Son contenu et l'historique Git doivent être audités pour vérifier l'absence de secrets réels. En cas de secret historique, supprimer le fichier courant ne suffit pas : rotation nécessaire.
4. **Les endpoints API ne montrent pas de middleware d'authentification/autorisation.**
5. **Certaines pages `admin-*` ne sont pas protégées par `isLoggedIn`.**
6. **Secret de session codé en dur et cookie `secure: false`.**
7. **Configuration CAS héritée avec une URL applicative HTTP et l'ancien chemin `si-scd-prod`.**

### P1 — incohérences structurelles

- référence `stats_reports_basic` dans `BddStat` contre table `stats_reports` du modèle associé ;
- double relation Bdd ↔ Gc ;
- associations Sequelize atypiques entre BddGestion et BddDiscipline ;
- `Disc.parent_id` sans association hiérarchique ;
- données monétaires en FLOAT ;
- absence de migrations identifiées ;
- table utilisateurs nommée `users_tmp` ;
- redirections vers des chemins/domaines historiques ;
- données XLS/XLSX métier versionnées sous `uploads/`.

### P2 — maintenabilité

- absence de tests automatisés déclarés ;
- pas de script lint/format ;
- contrôleurs parfois volumineux ;
- routes API centralisées dans un seul fichier ;
- frontend tiers largement vendorié ;
- code et documentation mélangés via de longs commentaires générés ;
- README mélange guide utilisateur, architecture, recommandations et analyse Copilot.

## Points positifs de l'existant

- séparation routes / contrôleurs / modèles identifiable ;
- modèles métier déjà individualisés ;
- Dockerfile et Compose fournissent une base de reproductibilité ;
- usage de bcrypt pour les mots de passe locaux ;
- usage de Sequelize facilitant l'inventaire du schéma logique ;
- vues organisées par domaines ;
- API suffisamment structurée pour permettre la mise en place progressive de tests.

## Vérifications restantes pour clore complètement la rétro-documentation

- inventaire des scripts applicatifs sous `public/` et correspondance avec les endpoints ;
- lecture détaillée de chaque contrôleur pour documenter règles de calcul, imports/exports et SUSHI ;
- comparaison des modèles avec un dump de schéma MySQL réel ;
- identification des consommateurs externes de l'API ;
- vérification des rôles réellement appliqués dans les vues ;
- inventaire des bibliothèques frontend et de leurs versions ;
- exécution de l'application dans un environnement isolé et tests de fumée.

## Recommandation de séquençage pour la phase suivante

Avant le PRD cible, recueillir les besoins de modification et classer chaque fonctionnalité actuelle en : **à conserver**, **à corriger**, **à refactoriser**, **à supprimer**, **à ajouter**. Le PRD devra rester séparé de ces fichiers décrivant l'état réel.
