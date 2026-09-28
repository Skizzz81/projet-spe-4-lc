# Projet Spé 4

Application web collaborative réalisée avec React, JavaScript, deux serveurs Node.js et MySQL.

## Applications

- `frontend` : interface React construite avec Vite.
- `api` : API REST Express pour les données et les règles métier.
- `realtime` : serveur Socket.IO pour la collaboration et la signalisation WebRTC.

## Prérequis

- Node.js 22 ou version LTS compatible
- npm 10 ou version compatible
- Docker Desktop avec Docker Compose

## Commandes

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Démarrage avec Docker

Crée d'abord le fichier local contenant les variables d'environnement :

```powershell
Copy-Item .env.example .env
```

Les mots de passe présents dans `.env.example` sont uniquement des valeurs de développement. Modifie-les dans `.env` et ne publie jamais ce fichier.

Construis et démarre ensuite les quatre services :

```bash
docker compose up --build
```

Les services sont disponibles aux adresses suivantes :

- frontend : http://localhost:5173
- API REST et connexion MySQL : http://localhost:3000/health
- serveur temps réel : http://localhost:3001/health
- MySQL depuis la machine : `localhost:3307`

Entre les conteneurs, l'API contacte toujours MySQL avec `mysql:3306`. Le port `3307` sert uniquement aux outils lancés directement sur la machine, comme MySQL Workbench.

Pour arrêter les conteneurs :

```bash
docker compose down
```

Les données MySQL restent dans le volume Docker `mysql_data`. La commande `docker compose down -v` supprime aussi ce volume et toutes ses données.

L'API utilise un pool de connexions `mysql2`. Sa route `/health` exécute une requête simple pour vérifier que MySQL est réellement disponible.
