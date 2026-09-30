import { useEffect, useState } from 'react';
import { socket } from '../lib/socket.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useVoiceCall } from '../lib/useVoiceCall.js';
import { Chat } from './Chat.jsx';

// Panneau d'appel + messagerie affiche pendant l'edition d'un document.
// Le socket est deja connecte par la page document, on ajoute juste la presence.
export function DocumentCollaboration() {
  const { user } = useAuth();
  const pseudo = user?.nom ?? user?.email ?? 'Utilisateur';
  const [users, setUsers] = useState([]);
  const { call, muted, remoteAudioRef, startCall, acceptCall, hangup, toggleMute } =
    useVoiceCall();

  // On signale sa presence pour apparaitre dans la liste et etre appelable.
  useEffect(() => {
    socket.emit('join', pseudo);
  }, [pseudo]);

  useEffect(() => {
    function onUsers(liste) {
      setUsers(liste);
    }
    socket.on('users', onUsers);
    return () => socket.off('users', onUsers);
  }, []);

  // Les autres presents (tout le monde sauf soi).
  const autres = users.filter((u) => u.id !== socket.id);

  return (
    <section className="doc-collab">
      <h2>Appel et messagerie</h2>

      <div className="colonnes">
        <aside className="participants">
          <h3>En ligne ({autres.length})</h3>
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
    </section>
  );
}
