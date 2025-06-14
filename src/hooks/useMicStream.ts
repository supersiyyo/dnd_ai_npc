import { useRef, useEffect } from "react";

export function useMicStream(onAudioChunk: (chunk: Int16Array) => void) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => stopMic(); // Clean up on component unmount
  }, []);

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx({ sampleRate: 16000 });

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        const int16 = float32ToInt16(input);
        onAudioChunk(int16);
      };

      source.connect(processor);
      processor.connect(audioContext.destination); // Prevents garbage collection

      audioContextRef.current = audioContext;
      processorRef.current = processor;
      mediaStreamRef.current = stream;

      console.log("🎙️ Mic started");
    } catch (error) {
      console.error("Mic access error:", error);
    }
  };

  const stopMic = () => {
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());

    console.log("🛑 Mic stopped");
  };

  return { startMic, stopMic };
}

function float32ToInt16(buffer: Float32Array): Int16Array {
  const len = buffer.length;
  const int16 = new Int16Array(len);
  for (let i = 0; i < len; i++) {
    int16[i] = Math.max(-1, Math.min(1, buffer[i])) * 0x7FFF;
  }
  return int16;
}
