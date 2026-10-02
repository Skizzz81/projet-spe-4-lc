import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from './socket.js';

// Serveur STUN public de Google, utile des qu'on n'est plus sur la meme machine.
const rtcConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

/**
 * Appel de groupe en mesh : chaque participant ouvre une connexion vers chacun des autres.
 * Adapte a de petits groupes (3-4 personnes) autour d'un document.
 */
export function useVoiceCall(documentId) {
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  // Un participant distant : { socketId, nom, stream }
  const [participants, setParticipants] = useState([]);

  const peersRef = useRef(new Map()); // socketId -> RTCPeerConnection
  const localStreamRef = useRef(null);
  const pendingIceRef = useRef(new Map()); // socketId -> candidats recus trop tot

  const upsertParticipant = useCallback((socketId, patch) => {
    setParticipants((liste) => {
      const index = liste.findIndex((p) => p.socketId === socketId);
      if (index === -1) {
        return [...liste, { socketId, nom: 'Anonyme', stream: null, ...patch }];
      }
      const copie = [...liste];
      copie[index] = { ...copie[index], ...patch };
      return copie;
    });
  }, []);

  const createPeer = useCallback(
    (socketId, nom) => {
      const pc = new RTCPeerConnection(rtcConfig);

      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('call:ice', { to: socketId, candidate: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        upsertParticipant(socketId, { nom, stream: event.streams[0] });
      };

      peersRef.current.set(socketId, pc);
      upsertParticipant(socketId, { nom });
      return pc;
    },
    [upsertParticipant],
  );

  const closePeer = useCallback((socketId) => {
    const pc = peersRef.current.get(socketId);
    if (pc) {
      pc.close();
      peersRef.current.delete(socketId);
    }
    pendingIceRef.current.delete(socketId);
    setParticipants((liste) => liste.filter((p) => p.socketId !== socketId));
  }, []);

  const cleanup = useCallback(() => {
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
    pendingIceRef.current.clear();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setParticipants([]);
    setMuted(false);
    setInCall(false);
  }, []);

  const joinCall = useCallback(async () => {
    if (!documentId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setInCall(true);
      socket.emit('call:join', documentId);
    } catch (err) {
      console.error('Micro indisponible', err);
      cleanup();
    }
  }, [documentId, cleanup]);

  const leaveCall = useCallback(() => {
    if (documentId) socket.emit('call:leave', documentId);
    cleanup();
  }, [documentId, cleanup]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    const track = stream?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  }, []);

  useEffect(() => {
    // Liste des personnes deja dans l'appel : on les appelle (on emet une offre a chacune).
    async function onPeers(peers) {
      for (const { socketId, nom } of peers) {
        const pc = createPeer(socketId, nom);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('call:offer', { to: socketId, sdp: offer });
      }
    }

    async function onOffer({ from, fromPseudo, sdp }) {
      if (!localStreamRef.current) return; // on n'est pas dans l'appel
      let pc = peersRef.current.get(from);
      if (!pc) pc = createPeer(from, fromPseudo);

      await pc.setRemoteDescription(sdp);

      const enAttente = pendingIceRef.current.get(from) ?? [];
      for (const candidate of enAttente) await pc.addIceCandidate(candidate);
      pendingIceRef.current.delete(from);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('call:answer', { to: from, sdp: answer });
    }

    async function onAnswer({ from, sdp }) {
      const pc = peersRef.current.get(from);
      if (pc) await pc.setRemoteDescription(sdp);
    }

    async function onIce({ from, candidate }) {
      const pc = peersRef.current.get(from);
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(candidate);
        } catch (err) {
          console.error('Candidat ICE refusé', err);
        }
      } else {
        const liste = pendingIceRef.current.get(from) ?? [];
        liste.push(candidate);
        pendingIceRef.current.set(from, liste);
      }
    }

    function onPeerLeft({ from }) {
      closePeer(from);
    }

    socket.on('call:peers', onPeers);
    socket.on('call:offer', onOffer);
    socket.on('call:answer', onAnswer);
    socket.on('call:ice', onIce);
    socket.on('call:peer-left', onPeerLeft);

    return () => {
      socket.off('call:peers', onPeers);
      socket.off('call:offer', onOffer);
      socket.off('call:answer', onAnswer);
      socket.off('call:ice', onIce);
      socket.off('call:peer-left', onPeerLeft);
    };
  }, [createPeer, closePeer]);

  return { inCall, muted, participants, joinCall, leaveCall, toggleMute };
}
