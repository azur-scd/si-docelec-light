# Dépendances et socle technique actuel

## Dépendances npm directes

| Dépendance | Version déclarée | Usage observé/attendu |
|---|---:|---|
| express | ^4.21.2 | serveur HTTP |
| ejs | ^3.1.10 | templates |
| sequelize | ^6.29.0 | ORM |
| mysql2 | ^3.9.8 | pilote MySQL |
| passport | ^0.7.0 | authentification |
| passport-local | ^1.0.0 | login local |
| passport-cas | ^0.1.1 | CAS |
| bcryptjs | ^2.4.3 | vérification mots de passe |
| express-session | ^1.18.2 | sessions |
| cookie-parser | ^1.4.7 | cookies |
| connect-busboy | 0.0.2 | multipart/uploads |
| cors | ^2.8.5 | CORS |
| accesscontrol | ^2.2.1 | déclaré ; usage à confirmer |

Développement : `nodemon`, `node-gyp`, `node-pre-gyp`.

## Runtime

`package.json` impose Node >= 20 et le Dockerfile utilise Node 20.

## Dépendances frontend embarquées

Le répertoire `public/` contient de nombreuses bibliothèques tierces copiées dans le dépôt. Parmi celles visibles : Bootstrap, D3, DevExtreme, jQuery/UI, NVD3, Summernote et divers plugins. Leurs versions, licences, vulnérabilités et usages effectifs doivent être inventoriés avant nettoyage.

## Dette technique immédiatement visible

- `connect-busboy` est très ancien ;
- `passport-cas` est ancien et doit être évalué avant évolution de l'authentification ;
- absence de script `start` alors que Docker Compose l'appelle ;
- absence de script de test ;
- nombreuses bibliothèques frontend vendoriées ;
- configuration applicative dispersée entre `.env`, Docker Compose, `config.json` et valeurs codées en dur ;
- commentaires Copilot très volumineux intégrés au code, parfois descriptifs plutôt que normatifs.

## Règle pour la suite

Aucune montée de version ou suppression de dépendance ne doit être faite uniquement sur la base de son ancienneté. Il faut d'abord identifier les usages, les dépendances frontend et les contrats externes, puis ajouter des tests de non-régression.
