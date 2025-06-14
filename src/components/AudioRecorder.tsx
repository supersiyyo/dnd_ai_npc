'use client';

import { useRef, useState } from "react";
import { initRealtimeWebRTC } from "@/lib/webrtc";

export default function AudioRecorder() {
  const [connected, setConnected] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [eventLog, setEventLog] = useState<string[]>([]);

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
        setEventLog((prev) => [...prev, JSON.stringify(event)]);
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

      {/* Optional: Display AI response logs */}
      <div className="max-w-md mt-4 p-2 bg-zinc-800 text-white rounded text-sm overflow-y-auto h-48 w-full">
        <h3 className="font-bold mb-2">📡 AI Event Log</h3>
        <ul className="space-y-1 list-disc pl-4">
          {eventLog.map((msg, idx) => (
            <li key={idx} className="text-xs">{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
