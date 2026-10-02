import { useEffect, useState } from 'react';
import { socket } from '../lib/socket.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useVoiceCall } from '../lib/useVoiceCall.js';

// Colonne de gauche de la room : invitation (children) + appel des participants.
// La presence est liee au document courant et au vrai compte connecte.
export function DocumentCollaboration({ documentId, children }) {
  const { user } = useAuth();
  const monId = user?.id;
  const [participants, setParticipants] = useState([]);
  const [recherche, setRecherche] = useState('');
  const { call, muted, remoteAudioRef, startCall, acceptCall, hangup, toggleMute } =
    useVoiceCall();

  useEffect(() => {
    if (!documentId) return undefined;

    function onList(liste) {
      setParticipants(liste);
    }

    function sync() {
      socket.emit('presence:sync', documentId);
    }

    socket.on('presence:list', onList);
    socket.on('connect', sync);
    sync(); // au cas ou le socket est deja connecte

    return () => {
      socket.off('presence:list', onList);
      socket.off('connect', sync);
    };
  }, [documentId]);

  // Les autres presents (tout le monde sauf mon compte), filtres par la recherche.
  const q = recherche.trim().toLowerCase();
  const autres = participants
    .filter((p) => p.userId !== monId)
    .filter(
      (p) =>
        !q ||
        p.nom.toLowerCase().includes(q) ||
        (p.email ?? '').toLowerCase().includes(q),
    );

  return (
    <div className="doc-collab collab-panel">
      {children}

      <aside className="participants">
        <h3>Appel ({autres.length} en ligne)</h3>
        <input
          className="participant-search"
          type="search"
          placeholder="Rechercher par nom ou email..."
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
        />
        {autres.length === 0 && <p className="vide">Personne à appeler pour l’instant.</p>}
        <ul>
          {autres.map((p) => (
            <li key={p.userId}>
              <div className="participant-info">
                <span className="participant-name">{p.nom}</span>
                <span className="participant-email">{p.email}</span>
              </div>
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
    </div>
  );
}
