import { useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket.js';

// Panneau de chat texte. Les messages passent par le serveur Socket.IO.
export function Chat() {
  const [messages, setMessages] = useState([]);
  const [texte, setTexte] = useState('');
  const finRef = useRef(null);

  useEffect(() => {
    function onMessage(message) {
      setMessages((liste) => [...liste, message]);
    }

    socket.on('chat:message', onMessage);
    return () => socket.off('chat:message', onMessage);
  }, []);

  // On scroll en bas à chaque nouveau message.
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function envoyer(event) {
    event.preventDefault();
    const contenu = texte.trim();
    if (!contenu) return;
    socket.emit('chat:message', contenu);
    setTexte('');
  }

  return (
    <section className="chat">
      <h2>Chat</h2>
      <div className="messages">
        {messages.map((m) => (
          <div key={m.id} className={m.fromId === socket.id ? 'message moi' : 'message'}>
            <span className="auteur">{m.from}</span>
            <span className="texte">{m.text}</span>
          </div>
        ))}
        <div ref={finRef} />
      </div>
      <form onSubmit={envoyer} className="barre-message">
        <input
          type="text"
          placeholder="Écris un message..."
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
        <button type="submit">Envoyer</button>
      </form>
    </section>
  );
}
