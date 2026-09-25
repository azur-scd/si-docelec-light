# Baseline de tests avant évolution

Aucun framework de test n'est actuellement déclaré. Les comportements suivants sont prioritaires.

## Smoke et authentification

Tester démarrage, pages publiques, login local, session et accès avec/sans authentification.

## CRUD

Pour les principaux domaines : liste, filtre, lecture, création, mise à jour, suppression, ID inexistant, entrée invalide et autorisation.

## Gestion financière

Créer des cas validés métier pour taux de change, TVA simple et mixte, frais de gestion, récupération de TVA, reliquat, projection annuelle et arrondis.

## Statistiques

Tester saisie mensuelle, total annuel, dimension total, filtres année/report, coût par usage, usage nul et paramétrage `calcul_esgbu`.

## SUSHI

Avec réponses simulées : rapport valide, plusieurs mois, métrique absente, réponse vide, JSON invalide, erreurs HTTP, timeout et URL interdite. Aucun test ne doit dépendre d'un fournisseur réel.

## Signalement et fichiers

Tester sortie enrichie, sortie Primo, upload, nom de fichier dangereux, listing annuel, téléchargement et fichier absent.

## Permissions

Vérifier notamment qu'un guest ou utilisateur non authentifié ne peut pas écrire par API, que l'API utilisateurs ne renvoie pas de donnée de mot de passe et qu'un changement de mot de passe conserve un stockage haché.

Les fonctions de calcul financier gagneront à être extraites du DOM afin de devenir testables unitairement.
