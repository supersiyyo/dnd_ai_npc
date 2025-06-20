// components/AudioRecorder.tsx
'use client';

import React, { useRef, useState } from 'react';
import { initRealtimeWebRTC } from '@/lib/webrtc';

export interface AudioRecorderProps {
  /**
   * Callback fired when AI MediaStream is available
   */
  onStream: (stream: MediaStream) => void;
}

/**
 * Connects to OpenAI voice via WebRTC and reports the AI audio stream
 * through the onStream callback.
 */
const AudioRecorder: React.FC<AudioRecorderProps> = ({ onStream }) => {
  const [connected, setConnected] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startRealtimeSession = async () => {
    setConnected(true);
    const { dc } = await initRealtimeWebRTC(
      // AI voice stream callback
      (stream) => {
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
        }
        onStream(stream);
      },
      // Data event callback (optional logging)
      (event) => {
        console.log('🧠 OpenAI event:', event);
      }
    );
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

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} autoPlay className="hidden" />
    </div>
  );
};

export default AudioRecorder;