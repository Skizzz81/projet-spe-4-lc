import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { checkDatabaseConnection, database } from './config/database.js';
import errorHandler from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

const app = express();
const port = Number(process.env.PORT ?? 3000);
const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/+$/, '');

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/documents', documentRoutes);

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

app.use(errorHandler);

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
