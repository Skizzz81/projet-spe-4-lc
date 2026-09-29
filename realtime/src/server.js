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

  socket.on('chat:message', (text) => {
    const contenu = String(text ?? '').trim();
    if (!contenu) return;

    io.to(ROOM).emit('chat:message', {
      id: `${socket.id}-${Date.now()}`,
      fromId: socket.id,
      from: pseudos.get(socket.id) ?? 'Anonyme',
      text: contenu,
      at: Date.now(),
    });
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
