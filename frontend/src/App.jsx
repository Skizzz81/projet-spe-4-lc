import { useState } from 'react';
import { socket } from './lib/socket.js';
import { Login } from './components/Login.jsx';
import { Room } from './components/Room.jsx';

export function App() {
  const [pseudo, setPseudo] = useState(null);

  function handleJoin(nom) {
    socket.connect();
    socket.emit('join', nom);
    setPseudo(nom);
  }

  if (!pseudo) {
    return <Login onJoin={handleJoin} />;
  }

  return <Room pseudo={pseudo} />;
}
