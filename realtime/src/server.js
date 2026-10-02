import { createServer } from 'node:http';
import { Server } from 'socket.io';

const port = Number(process.env.PORT ?? 3001);
const apiUrl = process.env.INTERNAL_API_URL ?? 'http://localhost:3000';

// En dev le frontend Vite tourne sur un autre port, il faut autoriser son origine.
const allowedOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

const httpServer = createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ service: 'realtime', status: 'ok' }));
    return;
  }

  response.writeHead(404);
  response.end();
});

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// POC : une seule salle partagee pour tout le monde.
// Quand l'authentification sera prete on remplacera le pseudo par le vrai user.
const ROOM = 'campus';

// socket.id -> pseudo
const pseudos = new Map();

function listUsers() {
  return [...pseudos.entries()].map(([id, pseudo]) => ({ id, pseudo }));
}

function getDocumentRoom(documentId) {
  return `document:${documentId}`;
}

async function getDocumentAccess(socket, documentId) {
  const cookie = socket.handshake.headers.cookie;

  if (!cookie) return null;

  const response = await fetch(`${apiUrl}/api/documents/${documentId}/access`, {
    headers: { cookie },
  });

  if (!response.ok) return null;

  const data = await response.json();
  const allowedAccess = ['owner', 'editor', 'viewer'];

  return allowedAccess.includes(data.access) ? data.access : null;
}

function getPresenceRoom(documentId) {
  return `presence:${documentId}`;
}

// Recupere le vrai compte connecte via le cookie (meme principe que getDocumentAccess).
async function getCurrentUser(socket) {
  const cookie = socket.handshake.headers.cookie;

  if (!cookie) return null;

  try {
    const response = await fetch(`${apiUrl}/api/auth/profile`, {
      headers: { cookie },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.user ?? null;
  } catch {
    // API injoignable (ex: en plein redemarrage) : on n'a pas l'identite, tant pis.
    return null;
  }
}

// Liste des personnes presentes sur un document, dedupliquee par compte.
async function listPresence(documentId, excludeSocketId) {
  const sockets = await io.in(getPresenceRoom(documentId)).fetchSockets();
  const parUtilisateur = new Map();

  for (const presentSocket of sockets) {
    if (presentSocket.id === excludeSocketId) continue;

    const utilisateur = presentSocket.data.user;
    if (!utilisateur) continue;

    parUtilisateur.set(utilisateur.id, {
      userId: utilisateur.id,
      nom: utilisateur.nom,
      email: utilisateur.email,
      socketId: presentSocket.id,
    });
  }

  return [...parUtilisateur.values()];
}

io.on('connection', (socket) => {
  socket.data.documentAccess = new Map();
  console.log(`Connexion temps réel : ${socket.id}`);

  socket.on('join', (pseudo) => {
    const nom = String(pseudo ?? '').trim() || 'Anonyme';
    pseudos.set(socket.id, nom);
    socket.join(ROOM);

    // On previent tout le monde de la nouvelle liste des présents.
    io.to(ROOM).emit('users', listUsers());
    console.log(`${nom} a rejoint la salle`);
  });

  socket.on('document:join', async (documentId, respond) => {
    const id = Number(documentId);

    if (!Number.isInteger(id) || id <= 0) {
      if (typeof respond === 'function') respond({ ok: false });
      return;
    }

    try {
      const access = await getDocumentAccess(socket, id);

      if (!access) {
        if (typeof respond === 'function') respond({ ok: false });
        return;
      }

      socket.data.documentAccess.set(id, access);
      socket.join(getDocumentRoom(id));

      if (typeof respond === 'function') respond({ ok: true, access });
    } catch (error) {
      console.error(`Vérification impossible pour le document ${id}:`, error.message);
      if (typeof respond === 'function') respond({ ok: false });
    }
  });

  socket.on('document:leave', (documentId) => {
    const id = Number(documentId);

    if (!Number.isInteger(id) || id <= 0) return;

    socket.data.documentAccess.delete(id);
    socket.leave(getDocumentRoom(id));
  });

  socket.on('document:update', (payload = {}) => {
    const documentId = Number(payload.documentId);
    const { content } = payload;

    if (!Number.isInteger(documentId) || documentId <= 0) return;
    if (typeof content !== 'string') return;

    const room = getDocumentRoom(documentId);
    const access = socket.data.documentAccess.get(documentId);

    if (!socket.rooms.has(room)) return;
    if (access !== 'owner' && access !== 'editor') return;

    socket.to(room).emit('document:updated', { documentId, content });
  });

  socket.on('chat:message', (payload) => {
    // Deux formes : une chaine (chat global de /room) ou { documentId, text } (chat d'un document).
    const scoped = payload && typeof payload === 'object';
    const contenu = String((scoped ? payload.text : payload) ?? '').trim();
    if (!contenu) return;

    const message = {
      id: `${socket.id}-${Date.now()}`,
      fromId: socket.id,
      from: socket.data.user?.nom ?? pseudos.get(socket.id) ?? 'Anonyme',
      text: contenu,
      at: Date.now(),
    };

    if (scoped) {
      const room = getPresenceRoom(Number(payload.documentId));
      if (!socket.rooms.has(room)) return; // on n'envoie qu'aux gens du meme document
      io.to(room).emit('chat:message', message);
    } else {
      io.to(ROOM).emit('chat:message', message);
    }
  });

  // --- Signalisation WebRTC (le serveur ne fait que relayer, l'audio est en pair a pair) ---
  socket.on('call:offer', ({ to, sdp }) => {
    io.to(to).emit('call:offer', {
      from: socket.id,
      fromPseudo: pseudos.get(socket.id) ?? 'Anonyme',
      sdp,
    });
  });

  socket.on('call:answer', ({ to, sdp }) => {
    io.to(to).emit('call:answer', { from: socket.id, sdp });
  });

  socket.on('call:ice', ({ to, candidate }) => {
    io.to(to).emit('call:ice', { from: socket.id, candidate });
  });

  socket.on('call:hangup', ({ to }) => {
    io.to(to).emit('call:hangup', { from: socket.id });
  });

  // Presence par document, basee sur le vrai compte (corrige le "je me vois moi-meme").
  socket.on('presence:sync', async (documentId) => {
    try {
      const id = Number(documentId);
      if (!Number.isInteger(id) || id <= 0) return;

      if (!socket.data.user) {
        socket.data.user = await getCurrentUser(socket);
      }
      if (!socket.data.user) return;

      socket.join(getPresenceRoom(id));
      io.to(getPresenceRoom(id)).emit('presence:list', await listPresence(id));
    } catch (error) {
      console.error('presence:sync a échoué :', error.message);
    }
  });

  // Au depart, on met a jour la liste des documents ou la personne etait presente.
  socket.on('disconnecting', async () => {
    try {
      const presenceRooms = [...socket.rooms].filter((room) => room.startsWith('presence:'));

      for (const room of presenceRooms) {
        const id = Number(room.slice('presence:'.length));
        socket.to(room).emit('presence:list', await listPresence(id, socket.id));
      }
    } catch (error) {
      console.error('Nettoyage de présence à la déconnexion a échoué :', error.message);
    }
  });

  socket.on('disconnect', () => {
    const nom = pseudos.get(socket.id);
    pseudos.delete(socket.id);
    io.to(ROOM).emit('users', listUsers());
    if (nom) console.log(`${nom} est parti`);
  });
});

httpServer.listen(port, () => {
  console.log(`Serveur temps réel disponible sur http://localhost:${port}`);
});
