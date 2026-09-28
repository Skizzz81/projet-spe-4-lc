import mysql from 'mysql2/promise';
import './env.js';

const databaseName = process.env.DB_NAME ?? process.env.MYSQL_DATABASE;
const databaseUser = process.env.DB_USER ?? process.env.MYSQL_USER;
const databasePassword = process.env.DB_PASSWORD ?? process.env.MYSQL_PASSWORD;

if (!databaseName || !databaseUser || !databasePassword) {
  throw new Error(
    'Les variables de connexion MySQL sont incomplètes. Vérifie le fichier .env.',
  );
}

export const database = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? process.env.MYSQL_PORT ?? 3307),
  database: databaseName,
  user: databaseUser,
  password: databasePassword,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 5000,
});

export async function checkDatabaseConnection() {
  await database.query('SELECT 1');
}
