# Authentification et autorisations actuelles

## Authentification locale

Passport utilise `passport-local`. La recherche se fait sur `User.username`, puis le mot de passe est vérifié avec bcrypt. Le modèle utilisateur pointe sur `users_tmp`.

## Authentification CAS

`passport-cas` est configuré avec :
- SSO : `https://login.unice.fr` ;
- serveur applicatif déclaré : ancien chemin HTTP `si-scd.unice.fr/si-scd-prod`.

Après retour CAS, l'utilisateur doit déjà exister en base ; sinon l'authentification échoue avec `Unknown user`.

## Session

`express-session` utilise actuellement :
- secret codé en dur dans `server.js` ;
- `resave: true` ;
- `saveUninitialized: true` ;
- cookie d'une heure ;
- `sameSite: true` ;
- `secure: false`.

Le stockage de session n'est pas explicitement configuré : le store mémoire par défaut d'Express Session est donc utilisé dans l'état du code.

## Groupes

Le code de redirection après login connaît quatre valeurs :
- `admin`
- `docelec`
- `horaires`
- `guest`

Le package `accesscontrol` est déclaré comme dépendance, mais son usage n'a pas été constaté dans les fichiers centraux examinés. Les groupes servent au moins à la redirection et probablement à l'affichage conditionnel dans les vues ; un inventaire frontend reste nécessaire.

## Autorisation des routes

Le seul contrôle explicite des pages est `isLoggedIn`, qui vérifie uniquement `req.isAuthenticated()`. Il ne vérifie pas le groupe.

Certaines pages administratives ne l'utilisent pas. Les routes API ne présentent pas de contrôle d'authentification dans `api/routes/routes.js`.

## Risques à traiter avant exposition élargie

- secret de session codé en dur ;
- cookies non `secure` ;
- store mémoire de session ;
- absence apparente de contrôle d'autorisation par rôle côté serveur ;
- endpoints CRUD API apparemment accessibles sans authentification ;
- endpoints utilisateurs inclus ;
- identifiants fournisseurs/SUSHI potentiellement exposables selon les sérialisations des contrôleurs ;
- configuration CAS héritée en HTTP côté `serverBaseURL`.

Ces constats doivent être validés en environnement de test avant correction, car un reverse proxy ou des contrôles externes peuvent exister hors dépôt.
