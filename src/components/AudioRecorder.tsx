'use client';

import { useState } from "react";
import { useMicStream } from "@/hooks/useMicStream";

export default function AudioRecorder() {
  const [recording, setRecording] = useState(false);

  const { startMic, stopMic } = useMicStream((chunk) => {
    console.log("🎧 Audio chunk:", chunk);
    // 🔜 Later: send chunk to WebRTC/OpenAI here
  });

  const handleToggle = async () => {
    if (recording) {
      stopMic();
    } else {
      await startMic();
    }
    setRecording(!recording);
  };

  return (
    <button
      onClick={handleToggle}
      className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
    >
      {recording ? "🛑 Stop Recording" : "🎤 Start Recording"}
    </button>
  );
}
