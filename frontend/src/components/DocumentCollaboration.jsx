import { useEffect, useState } from 'react';
import { socket } from '../lib/socket.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useVoiceCall } from '../lib/useVoiceCall.js';

// Colonne de gauche de la room : invitation (children) + appel de groupe des participants.
// La presence est liee au document courant et au vrai compte connecte.
export function DocumentCollaboration({ documentId, children }) {
  const { user } = useAuth();
  const monId = user?.id;
  const [enLigne, setEnLigne] = useState([]);
  const [recherche, setRecherche] = useState('');
  const { inCall, muted, participants: dansAppel, roster, joinCall, leaveCall, toggleMute } =
    useVoiceCall(documentId);

  // Qui est dans l'appel, moi exclu (pour l'affichage).
  const autresDansAppel = roster.filter((r) => r.socketId !== socket.id);

  useEffect(() => {
    if (!documentId) return undefined;

    function onList(liste) {
      setEnLigne(liste);
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
  const autres = enLigne
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
        <h3>Appel</h3>

        {inCall ? (
          <div className="call-controls">
            <span className="call-status">🟢 En appel · {roster.length}</span>
            {autresDansAppel.length > 0 && (
              <ul className="call-members">
                {autresDansAppel.map((p) => (
                  <li key={p.socketId}>{p.nom}</li>
                ))}
              </ul>
            )}
            <div className="call-actions">
              <button onClick={toggleMute}>
                {muted ? 'Réactiver le micro' : 'Couper le micro'}
              </button>
              <button className="call-leave" onClick={leaveCall}>
                Quitter l'appel
              </button>
            </div>
          </div>
        ) : autresDansAppel.length > 0 ? (
          <div className="call-controls">
            <span className="call-status">📞 Appel en cours · {autresDansAppel.length}</span>
            <ul className="call-members">
              {autresDansAppel.map((p) => (
                <li key={p.socketId}>{p.nom}</li>
              ))}
            </ul>
            <button className="call-join" onClick={joinCall}>
              Rejoindre l'appel
            </button>
          </div>
        ) : (
          <>
            <button className="call-join" onClick={joinCall}>
              Démarrer un appel
            </button>
            <p className="call-hint">
              Lance un appel vocal, les autres sur le document pourront te rejoindre.
            </p>
          </>
        )}

        <h4 className="online-title">En ligne ({autres.length})</h4>
        <input
          className="participant-search"
          type="search"
          placeholder="Rechercher par nom ou email..."
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
        />
        {autres.length === 0 && <p className="vide">Personne d’autre pour l’instant.</p>}
        <ul>
          {autres.map((p) => (
            <li key={p.userId}>
              <div className="participant-info">
                <span className="participant-name">{p.nom}</span>
                <span className="participant-email">{p.email}</span>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Un element audio par participant distant de l'appel. */}
      {dansAppel.map((p) => (
        <audio
          key={p.socketId}
          autoPlay
          ref={(el) => {
            if (el && p.stream && el.srcObject !== p.stream) {
              el.srcObject = p.stream;
            }
          }}
        />
      ))}
    </div>
  );
}
