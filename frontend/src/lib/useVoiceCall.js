import { useCallback, useEffect, useRef, useState } from 'react';
import { socket } from './socket.js';

// Serveur STUN public de Google. Utile des qu'on n'est plus sur la meme machine.
const rtcConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

/**
 * Gere un appel vocal en pair a pair entre deux utilisateurs.
 * On garde volontairement un seul appel a la fois, c'est un POC.
 */
export function useVoiceCall() {
  // null | { peerId, peerPseudo, status: 'calling' | 'incoming' | 'in-call' }
  const [call, setCall] = useState(null);
  const [muted, setMuted] = useState(false);

  const remoteAudioRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const pendingIceRef = useRef([]); // candidats recus avant que la connexion soit prete

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    pendingOfferRef.current = null;
    pendingIceRef.current = [];
    setMuted(false);
    setCall(null);
  }, []);

  const createPeer = useCallback((peerId) => {
    const pc = new RTCPeerConnection(rtcConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('call:ice', { to: peerId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  }, []);

  async function getMicro() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
    return stream;
  }

  // Lancer un appel vers quelqu'un.
  const startCall = useCallback(
    async (peer) => {
      try {
        const stream = await getMicro();
        const pc = createPeer(peer.id);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        pcRef.current = pc;

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('call:offer', { to: peer.id, sdp: offer });

        setCall({ peerId: peer.id, peerPseudo: peer.pseudo, status: 'calling' });
      } catch (err) {
        console.error('Impossible de démarrer l’appel', err);
        cleanup();
      }
    },
    [createPeer, cleanup],
  );

  // Accepter un appel entrant.
  const acceptCall = useCallback(async () => {
    const offer = pendingOfferRef.current;
    if (!offer) return;

    try {
      const stream = await getMicro();
      const pc = createPeer(offer.from);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      pcRef.current = pc;

      await pc.setRemoteDescription(offer.sdp);

      // On vide les candidats ICE arrivés trop tot.
      for (const candidate of pendingIceRef.current) {
        await pc.addIceCandidate(candidate);
      }
      pendingIceRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('call:answer', { to: offer.from, sdp: answer });

      setCall((c) => (c ? { ...c, status: 'in-call' } : c));
    } catch (err) {
      console.error('Impossible d’accepter l’appel', err);
      cleanup();
    }
  }, [createPeer, cleanup]);

  // Raccrocher (et prévenir l'autre).
  const hangup = useCallback(() => {
    if (call) {
      socket.emit('call:hangup', { to: call.peerId });
    }
    cleanup();
  }, [call, cleanup]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const enabled = stream.getAudioTracks()[0]?.enabled;
    stream.getAudioTracks().forEach((t) => (t.enabled = !enabled));
    setMuted(enabled);
  }, []);

  // Ecoute des évènements de signalisation.
  useEffect(() => {
    function onOffer({ from, fromPseudo, sdp }) {
      // Si on est déjà en appel, on ignore (POC : un seul appel).
      pendingOfferRef.current = { from, sdp };
      setCall({ peerId: from, peerPseudo: fromPseudo, status: 'incoming' });
    }

    async function onAnswer({ sdp }) {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(sdp);
      setCall((c) => (c ? { ...c, status: 'in-call' } : c));
    }

    async function onIce({ candidate }) {
      const pc = pcRef.current;
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(candidate);
        } catch (err) {
          console.error('Candidat ICE refusé', err);
        }
      } else {
        pendingIceRef.current.push(candidate);
      }
    }

    function onHangup() {
      cleanup();
    }

    socket.on('call:offer', onOffer);
    socket.on('call:answer', onAnswer);
    socket.on('call:ice', onIce);
    socket.on('call:hangup', onHangup);

    return () => {
      socket.off('call:offer', onOffer);
      socket.off('call:answer', onAnswer);
      socket.off('call:ice', onIce);
      socket.off('call:hangup', onHangup);
    };
  }, [cleanup]);

  return { call, muted, remoteAudioRef, startCall, acceptCall, hangup, toggleMute };
}
