'use client';

import React, { useRef, useState } from 'react';
import { initRealtimeWebRTC } from '@/lib/webrtc';

export interface AudioRecorderProps {

  onStream: (stream: MediaStream) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onStream }) => {
  const [connected, setConnected] = useState(false);
  const [session, setSession] = useState<{ pc: RTCPeerConnection; dc: RTCDataChannel; } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startRealtimeSession = async () => {
    setConnected(true);
    const { pc, dc } = await initRealtimeWebRTC(
      (stream) => {
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
        }
        onStream(stream);
      },
      (event) => {
        console.log('🧠 OpenAI event:', event);
      }
    );
    setSession({ pc, dc });
  };

  const endRealtimeSession = () => {
    if (session) {
      session.pc.close();
      setSession(null);
      setConnected(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={startRealtimeSession}
        disabled={connected}
        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
      >
        {connected ? '✅ Connected to OpenAI' : '🎤 Start AI Voice Session'}
      </button>
      <button
        onClick={endRealtimeSession}
        disabled={!connected}
        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
      >
        End AI Voice Session
      </button>

      <audio ref={audioRef} autoPlay className="hidden" />
    </div>
  );
};

export default AudioRecorder;
