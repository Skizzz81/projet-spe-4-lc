import { useEffect, useState } from 'react';
import { socket } from '../lib/socket.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useVoiceCall } from '../lib/useVoiceCall.js';
import { Chat } from './Chat.jsx';

// Panneau d'appel + messagerie affiche pendant l'edition d'un document.
// La presence est liee au document courant et au vrai compte connecte.
export function DocumentCollaboration({ documentId }) {
  const { user } = useAuth();
  const monId = user?.id;
  const [participants, setParticipants] = useState([]);
  const { call, muted, remoteAudioRef, startCall, acceptCall, hangup, toggleMute } =
    useVoiceCall();

  useEffect(() => {
    if (!documentId) return undefined;

    function onList(liste) {
      setParticipants(liste);
    }

    socket.on('presence:list', onList);
    socket.emit('presence:sync', documentId);

    return () => socket.off('presence:list', onList);
  }, [documentId]);

  // Les autres presents (tout le monde sauf mon propre compte).
  const autres = participants.filter((p) => p.userId !== monId);

  return (
    <section className="doc-collab">
      <h2>Appel et messagerie</h2>

      <div className="colonnes">
        <aside className="participants">
          <h3>En ligne ({autres.length})</h3>
          {autres.length === 0 && <p className="vide">Personne d’autre pour l’instant.</p>}
          <ul>
            {autres.map((p) => (
              <li key={p.userId}>
                <span>{p.nom}</span>
                <button
                  onClick={() => startCall({ id: p.socketId, pseudo: p.nom })}
                  disabled={Boolean(call)}
                >
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
    </section>
  );
}
