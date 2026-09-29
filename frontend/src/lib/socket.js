import { io } from 'socket.io-client';

// URL du serveur temps réel. En local c'est le port 3001.
const url = import.meta.env.VITE_REALTIME_URL ?? 'http://localhost:3001';

// Le cookie d'authentification est envoyé au serveur temps réel à la connexion.
export const socket = io(url, { autoConnect: false, withCredentials: true });
