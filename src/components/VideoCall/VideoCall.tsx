import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_SERVER_URL } from '@/config/constants';
import './video-call.styles.css';

export const VideoCall: React.FC = () => {
  const [socket, setSocket] = useState<any>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  // map of peerId -> RTCPeerConnection
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});

  // Effect to handle remote video streams
  useEffect(() => {
    Object.entries(remoteStreams).forEach(([peerId, stream]) => {
      if (remoteVideoRef.current && stream) {
        console.log('Setting remote stream to video element for peer:', peerId);
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch(e => {
          console.error('Error playing remote video:', e);
        });
      }
    });
  }, [remoteStreams]);

  useEffect(() => {
    console.log('Initializing socket connection...');
    const s = io(SOCKET_SERVER_URL);
    
    s.on('connect', () => {
      console.log('Socket connected with ID:', s.id);
      if (!s.id) {
        console.error('Socket connected but no ID assigned!');
        return;
      }
      setSocketId(s.id);
      setSocket(s);
    });

    s.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    s.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setSocketId(null);
    });

    return () => {
      console.log('Cleaning up socket and peer connections...');
      try {
        Object.entries(peerConnectionsRef.current).forEach(([peerId, pc]) => {
          console.log('Closing peer connection for:', peerId);
          try { 
            pc.close(); 
          } catch (e) {
            console.error('Error closing peer connection:', e);
          }
        });
        s.disconnect();
      } catch (e) {
        console.error('Error in cleanup:', e);
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    // When joining a room, server may emit existing users
    socket.on('existing-users', async (users: string[]) => {
      console.log('existing-users', users);
      if (!socketId) {
        console.log('Waiting for socketId before processing existing users');
        setTimeout(async () => {
          console.log('Processing delayed existing users with socketId:', socketId);
          for (const userId of users) {
            await createOfferForUser(userId);
          }
        }, 1000);
        return;
      }
      // create an offer for each existing user
      for (const userId of users) {
        await createOfferForUser(userId);
      }
    });

    socket.on('user-joined', async ({ userId }: { userId: string }) => {
      console.log('user-joined', userId);
      if (!socketId) {
        console.log('Waiting for socketId before processing new user');
        setTimeout(async () => {
          console.log('Processing delayed new user with socketId:', socketId);
          await createOfferForUser(userId);
        }, 1000);
        return;
      }
      // When a new user joins, create an offer for them
      await createOfferForUser(userId);
    });

    socket.on('offer', async (payload: any) => {
      try {
        const from: string = payload.from;
        console.log('received offer from', from);
        // If we already have a local offer for this peer, there could be a glare.
        // In that case, prefer the deterministic rule: the lower lexicographic id acts as offerer.
        if (socketId && socketId > from) {
          // We are the "polite" side in this pair and should accept their offer.
          const pc = await ensurePeerConnection(from);
          await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', { answer, target: from, from: socketId });
        } else {
          // We expected to be the offerer for this pair, but received an offer; this is a glare.
          // Ignore it to avoid conflicting signaling state. Log for debugging.
          console.warn('Received unexpected offer from', from, '— ignoring to avoid glare');
        }
      } catch (err) {
        console.error('handle offer error', err);
      }
    });

    socket.on('answer', async (payload: any) => {
      try {
        const from: string = payload.from;
        console.log('received answer from', from);
        const pc = peerConnectionsRef.current[from];
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
      } catch (err) {
        console.error('handle answer error', err);
      }
    });

    socket.on('ice-candidate', (payload: any) => {
      try {
        const from: string = payload.from;
        const pc = peerConnectionsRef.current[from];
        if (pc && payload?.candidate) {
          pc.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(console.error);
        }
      } catch (err) {
        console.error('ice candidate error', err);
      }
    });

    socket.on('user-left', ({ userId }: { userId: string }) => {
      console.log('user-left', userId);
      const pc = peerConnectionsRef.current[userId];
      if (pc) {
        try { pc.close(); } catch (e) {}
        delete peerConnectionsRef.current[userId];
      }
      setRemoteStreams(prev => {
        const newStreams = { ...prev };
        delete newStreams[userId];
        return newStreams;
      });
    });

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('existing-users');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, [socket]);

  // Ensure a peer connection exists for a remote user
  const ensurePeerConnection = async (peerId: string) => {
    let pc = peerConnectionsRef.current[peerId];
    if (pc) return pc;

    pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

    pc.onicecandidate = (e) => {
      if (e.candidate && socket) {
        socket.emit('ice-candidate', { candidate: e.candidate, target: peerId, from: socketId });
      }
    };

    pc.ontrack = (ev) => {
      console.log('pc.ontrack from', peerId, ev.streams[0]);
      if (ev.streams && ev.streams[0]) {
        setRemoteStreams(prev => ({
          ...prev,
          [peerId]: ev.streams[0]
        }));
      }
    };

    // Add local tracks if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => pc!.addTrack(t, localStreamRef.current!));
    }

    peerConnectionsRef.current[peerId] = pc;
    return pc;
  };

  const createOfferForUser = async (peerId: string) => {
    try {
      if (!socket) {
        console.error('Cannot create offer: socket not initialized');
        return;
      }
      
      if (!socketId) {
        console.error('Cannot create offer: socketId not available');
        return;
      }

      // Avoid glare: use a deterministic rule so only one side creates the offer for a pair.
      if (socketId > peerId) {
        console.log(`Skipping createOffer: our ID (${socketId}) > peer ID (${peerId})`);
        return;
      }

      console.log(`Creating offer: our ID (${socketId}) < peer ID (${peerId})`);
      
      if (!localStreamRef.current) {
        console.log('Getting local media stream...');
        localStreamRef.current = await startMedia();
      }

      const pc = await ensurePeerConnection(peerId);
      console.log('Created/retrieved peer connection for:', peerId);

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await pc.setLocalDescription(offer);
      console.log('Local description set, sending offer to:', peerId);
      
      socket.emit('offer', { 
        offer, 
        target: peerId, 
        from: socketId 
      });
      
      console.log('Offer sent to peer:', peerId);
    } catch (err) {
      console.error('Error in createOfferForUser:', err);
    }
  };

  const startMedia = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert('getUserMedia not supported in this browser');
        return null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.play().catch(() => {});
      }
      return stream;
    } catch (err: any) {
      console.error('Error accessing camera/microphone', err);
      if (err?.name === 'NotAllowedError') {
        alert('Camera/microphone access denied. Please allow permissions and try again.');
      } else if (err?.name === 'NotReadableError') {
        alert('Could not access camera/microphone. It may be in use by another application.');
      } else {
        alert('Error accessing camera/microphone: ' + (err?.message || err));
      }
      return null;
    }
  };

  // (createPeerConnection removed) We now create per-peer connections via ensurePeerConnection

  const joinRoom = async () => {
    if (!roomId.trim()) {
      alert('Enter a room id');
      return;
    }

  const stream = await startMedia();
  if (!stream || !socket) return;

  // Save local stream for future peer connections
  localStreamRef.current = stream;

  // Notify server that we joined; server should emit 'existing-users' with other peer ids
  socket.emit('join-room', roomId);
  setIsInRoom(true);
  };

  const leaveRoom = () => {
    try {
      // Close all peer connections
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        try { pc.close(); } catch (e) {}
      });
      peerConnectionsRef.current = {};
      setIsInRoom(false);

      // Stop and clear local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

      if (socket) socket.emit('leave-room', roomId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="vc-root">
      <div className="vc-controls">
        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Room ID"
          aria-label="Room ID"
        />
        {!isInRoom ? (
          <button onClick={joinRoom} className="vc-join">Join</button>
        ) : (
          <button onClick={leaveRoom} className="vc-leave">Leave</button>
        )}
      </div>

      <div className="vc-video-grid">
        <div className="vc-video">
          <video id="localVideo" ref={localVideoRef} playsInline autoPlay muted />
          <div className="vc-label">You</div>
        </div>
        <div className="vc-video">
          <video id="remoteVideo" ref={remoteVideoRef} playsInline autoPlay />
          <div className="vc-label">Remote</div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
