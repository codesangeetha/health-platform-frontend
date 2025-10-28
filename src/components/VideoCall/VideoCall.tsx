import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_SERVER_URL } from '@/config/constants';
import './video-call.styles.css';

export const VideoCall: React.FC = () => {
  const [socket, setSocket] = useState<any>(null);
  const [roomId, setRoomId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const s = io(SOCKET_SERVER_URL);
    s.on('connect', () => console.log('socket connected', s.id));
    setSocket(s);
    return () => {
      try {
        s.disconnect();
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('offer', async (payload: any) => {
      try {
        const pc = peerConnectionRef.current;
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { answer, target: payload.from });
      } catch (err) {
        console.error('handle offer error', err);
      }
    });

    socket.on('answer', async (payload: any) => {
      try {
        const pc = peerConnectionRef.current;
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
      } catch (err) {
        console.error('handle answer error', err);
      }
    });

    socket.on('ice-candidate', (payload: any) => {
      try {
        const pc = peerConnectionRef.current;
        if (pc && payload?.candidate) {
          pc.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(console.error);
        }
      } catch (err) {
        console.error('ice candidate error', err);
      }
    });

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, [socket]);

  const startMedia = async () => {
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
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (e) => {
      if (e.candidate && socket) {
        socket.emit('ice-candidate', { candidate: e.candidate });
      }
    };

    pc.ontrack = (ev) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = ev.streams[0];
        remoteVideoRef.current.play().catch(() => {});
      }
    };

    return pc;
  };

  const joinRoom = async () => {
    if (!roomId.trim()) {
      alert('Enter a room id');
      return;
    }

    const stream = await startMedia();
    if (!stream || !socket) return;

    const pc = createPeerConnection();
    peerConnectionRef.current = pc;

    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    // create offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('join-room', roomId);
    socket.emit('offer', { offer, roomId });
    setIsInRoom(true);
  };

  const leaveRoom = () => {
    try {
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      setIsInRoom(false);
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((t) => t.stop());
        localVideoRef.current.srcObject = null;
      }
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
