import AudioRecorder from "@/components/AudioRecorder";
import MicCircleVisualizer from "@/components/MicCircleVisualizer";

export default function TestPage() {
  return (
    <main className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">🎧 AudioRecorder Test</h1>
      <AudioRecorder />
    </main>
  );
}
