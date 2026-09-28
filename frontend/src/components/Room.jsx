import { useEffect, useState } from 'react';
import { socket } from '../lib/socket.js';
import { useVoiceCall } from '../lib/useVoiceCall.js';
import { Chat } from './Chat.jsx';

export function Room({ pseudo }) {
  const [users, setUsers] = useState([]);
  const { call, muted, remoteAudioRef, startCall, acceptCall, hangup, toggleMute } =
    useVoiceCall();

  useEffect(() => {
    function onUsers(liste) {
      setUsers(liste);
    }
    socket.on('users', onUsers);
    return () => socket.off('users', onUsers);
  }, []);

  // Les autres présents (tout le monde sauf soi).
  const autres = users.filter((u) => u.id !== socket.id);

  return (
    <main className="room">
      <header className="entete">
        <h1>Salle campus</h1>
        <span className="moi-badge">Connecté en tant que {pseudo}</span>
      </header>

      <div className="colonnes">
        <aside className="participants">
          <h2>En ligne ({autres.length})</h2>
          {autres.length === 0 && <p className="vide">Personne d’autre pour l’instant.</p>}
          <ul>
            {autres.map((u) => (
              <li key={u.id}>
                <span>{u.pseudo}</span>
                <button onClick={() => startCall(u)} disabled={Boolean(call)}>
                  Appeler
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <Chat />
      </div>

      {/* Barre d'appel : s'affiche seulement quand il se passe quelque chose. */}
      {call && (
        <div className="barre-appel">
          {call.status === 'incoming' && (
            <>
              <span>📞 {call.peerPseudo} t’appelle...</span>
              <button onClick={acceptCall}>Accepter</button>
              <button onClick={hangup}>Refuser</button>
            </>
          )}
          {call.status === 'calling' && (
            <>
              <span>Appel de {call.peerPseudo}...</span>
              <button onClick={hangup}>Annuler</button>
            </>
          )}
          {call.status === 'in-call' && (
            <>
              <span>🟢 En appel avec {call.peerPseudo}</span>
              <button onClick={toggleMute}>{muted ? 'Réactiver le micro' : 'Couper le micro'}</button>
              <button onClick={hangup}>Raccrocher</button>
            </>
          )}
        </div>
      )}

      {/* Lecture du son distant. */}
      <audio ref={remoteAudioRef} autoPlay />
    </main>
  );
}
