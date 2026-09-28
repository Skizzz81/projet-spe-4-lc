import { io } from 'socket.io-client';

// URL du serveur temps réel. En local c'est le port 3001.
const url = import.meta.env.VITE_REALTIME_URL ?? 'http://localhost:3001';

// On ne connecte pas tout de suite : on attend que l'utilisateur ait choisi son pseudo.
export const socket = io(url, { autoConnect: false });
