import { createServer } from 'node:http';
import { Server } from 'socket.io';

const port = Number(process.env.PORT ?? 3001);
const httpServer = createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ service: 'realtime', status: 'ok' }));
    return;
  }

  response.writeHead(404);
  response.end();
});

const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log(`Connexion temps réel : ${socket.id}`);
});

httpServer.listen(port, () => {
  console.log(`Serveur temps réel disponible sur http://localhost:${port}`);
});
