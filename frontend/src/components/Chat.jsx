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
    // Chat d'un document -> on envoie le documentId ; sinon chat global.
    socket.emit('chat:message', documentId ? { documentId, text: contenu } : contenu);
    setTexte('');
  }

  return (
    <section className="chat">
      <h2>Chat</h2>

      <div className="messages">
        {messages.length === 0 && (
          <p className="chat-empty">Pas encore de message.</p>
        )}
        {messages.map((m) => {
          const moi = m.fromId === socket.id;
          return (
            <div key={m.id} className={moi ? 'message moi' : 'message'}>
              {!moi && <span className="auteur">{m.from}</span>}
              <span className="texte">{m.text}</span>
            </div>
          );
        })}
        <div ref={finRef} />
      </div>

      <form onSubmit={envoyer} className="barre-message">
        <input
          type="text"
          placeholder="Message..."
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
        <button type="submit" className="chat-send" aria-label="Envoyer" disabled={!texte.trim()}>
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </section>
  );
}
