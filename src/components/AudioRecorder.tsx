'use client';

import { useRef, useState } from "react";
import { initRealtimeWebRTC } from "@/lib/webrtc";
import MicCircleVisualizer from "@/components/MicCircleVisualizer";
import AiCircleVisualizer from "@/components/AiCircleVisualizer";

export default function AudioRecorder() {
  const [connected, setConnected] = useState(false);
  const [aiStream, setAiStream] = useState<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startRealtimeSession = async () => {
    setConnected(true);

    const { dc } = await initRealtimeWebRTC(
      // AI voice stream
      (stream) => {
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
        }
        setAiStream(stream);
      },
      // Data events (we're just logging)
      (event) => {
        console.log("🧠 OpenAI event:", event);
      }
    );
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={startRealtimeSession}
        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
        disabled={connected}
      >
        {connected ? "✅ Connected to OpenAI" : "🎤 Start AI Voice Session"}
      </button>

      {/* hidden audio element for playback */}
      <audio ref={audioRef} autoPlay className="hidden" />

      {/* visualizers */}
      <div className="flex space-x-8">
        {/* Mic input visual */}
        <MicCircleVisualizer />

        {/* AI response visual */}
        {aiStream && (
          <AiCircleVisualizer stream={aiStream} size={200} />
        )}
      </div>
    </div>
  );
}
