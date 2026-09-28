import express from 'express';
import { checkDatabaseConnection, database } from './config/database.js';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.get('/health', async (_request, response) => {
  try {
    await checkDatabaseConnection();
    response.json({ service: 'api', status: 'ok', database: 'connected' });
  } catch {
    response.status(503).json({
      service: 'api',
      status: 'error',
      database: 'unavailable',
    });
  }
});

async function startServer() {
  try {
    await checkDatabaseConnection();

    const server = app.listen(port, () => {
      console.log(`API disponible sur http://localhost:${port}`);
      console.log('Connexion MySQL établie');
    });

    async function shutdown() {
      server.close(async () => {
        await database.end();
        process.exit(0);
      });
    }

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch {
    console.error(
      'Impossible de joindre MySQL. Vérifie les variables du fichier .env.',
    );
    process.exit(1);
  }
}

await startServer();
