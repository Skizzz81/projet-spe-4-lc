import { useEffect, useRef, useState } from 'react';
import { socket } from '../lib/socket.js';

// Panneau de chat texte. Avec un documentId, la conversation est propre a ce document.
export function Chat({ documentId }) {
  const [messages, setMessages] = useState([]);
  const [texte, setTexte] = useState('');
  const finRef = useRef(null);

  useEffect(() => {
    // On repart d'une conversation vide quand on change de document.
    setMessages([]);

    function onMessage(message) {
      setMessages((liste) => [...liste, message]);
    }

    socket.on('chat:message', onMessage);
    return () => socket.off('chat:message', onMessage);
  }, [documentId]);

  // On scroll en bas à chaque nouveau message.
  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function envoyer(event) {
    event.preventDefault();
    const contenu = texte.trim();
    if (!contenu) return;
    // Chat d'un document -> on envoie le documentId ; sinon chat global (/room).
    socket.emit('chat:message', documentId ? { documentId, text: contenu } : contenu);
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
