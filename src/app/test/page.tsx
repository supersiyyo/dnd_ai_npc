import AudioRecorder from "@/components/AudioRecorder";

export default function TestPage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">🎧 AudioRecorder Test</h1>
      <p className="text-gray-400 mb-4">
        Click the button below and check the console to see if audio chunks are being logged.
      </p>
      <AudioRecorder />
    </main>
  );
}
