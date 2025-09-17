# Utilise l'image officielle Node.js 20 comme base, adaptée pour exécuter des applications Node.js
FROM node:20

# Définit le dossier de travail à /app dans le conteneur
WORKDIR /app

# Copie les fichiers de gestion des dépendances dans le conteneur
COPY package*.json ./

# Installe toutes les dépendances (dev et production)
RUN npm install

# Copie le reste des fichiers de l'application dans le conteneur
COPY . .

# Expose le port sur lequel l'application écoute (port 7200 par défaut selon server.js)
EXPOSE 7200

# Définit la commande à exécuter pour démarrer l'application
CMD ["node", "server.js"]

COPY wait-for-it.sh /usr/bin/wait-for-it.sh
RUN chmod +x /usr/bin/wait-for-it.sh