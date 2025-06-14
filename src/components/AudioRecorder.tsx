'use client';

import { useRef, useState } from "react";
import { initRealtimeWebRTC } from "@/lib/webrtc";

export default function AudioRecorder() {
  const [connected, setConnected] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startRealtimeSession = async () => {
    setConnected(true);
    const { dc } = await initRealtimeWebRTC(
      // Called when OpenAI returns a voice stream
      (stream) => {
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
        }
      },

      // Called when OpenAI sends a data event (e.g., transcriptions, status)
      (event) => {
        console.log("🧠 OpenAI event:", event);
      }
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={startRealtimeSession}
        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        disabled={connected}
      >
        {connected ? "✅ Connected to OpenAI" : "🎤 Start AI Voice Session"}
      </button>

      {/* Voice output */}
      <audio ref={audioRef} autoPlay />
    </div>
  );
}
