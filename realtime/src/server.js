import { createServer } from 'node:http';
import { Server } from 'socket.io';

const port = Number(process.env.PORT ?? 3001);

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

io.on('connection', (socket) => {
  console.log(`Connexion temps réel : ${socket.id}`);

  socket.on('join', (pseudo) => {
    const nom = String(pseudo ?? '').trim() || 'Anonyme';
    pseudos.set(socket.id, nom);
    socket.join(ROOM);

    // On previent tout le monde de la nouvelle liste des présents.
    io.to(ROOM).emit('users', listUsers());
    console.log(`${nom} a rejoint la salle`);
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
