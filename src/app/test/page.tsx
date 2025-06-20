'use client';

import React, { useState } from 'react';
import AudioRecorder from '@/components/AudioRecorder';
import AiMicVis from '@/components/AiMicVis';
import UserMicVis from '@/components/UserMicVis';

export default function TestPage() {
  const [aiStream, setAiStream] = useState<MediaStream | null>(null);

  return (
    <main className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">🎧 AudioRecorder Test</h1>

      {/* AI-driven top visualizer */}
      {aiStream && <AiMicVis stream={aiStream} />}

      {/* Connect to AI voice & surface the stream */}
      <AudioRecorder onStream={setAiStream} />

      {/* User microphone bottom visualizer */}
      <UserMicVis />
    </main>
  );
}
