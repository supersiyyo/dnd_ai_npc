import { useRef, useEffect } from "react";

export function useMicStream(onAudioChunk: (chunk: Int16Array) => void) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => stopMic();
  }, []);

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioCtx({ sampleRate: 16000 });

      await audioContext.audioWorklet.addModule("/worklets/recorder-processor.js");

      const source = audioContext.createMediaStreamSource(stream);
      const recorderNode = new AudioWorkletNode(audioContext, "recorder-processor");

      recorderNode.port.onmessage = (event) => {
        const floatData = event.data as Float32Array;
        const int16 = float32ToInt16(floatData);
        onAudioChunk(int16);
      };

      source.connect(recorderNode).connect(audioContext.destination);

      audioContextRef.current = audioContext;
      workletNodeRef.current = recorderNode;
      mediaStreamRef.current = stream;

      console.log("🎙️ Mic with AudioWorklet started");
    } catch (err) {
      console.error("Error starting mic with worklet:", err);
    }
  };

  const stopMic = () => {
    workletNodeRef.current?.disconnect();
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
    int16[i] = Math.max(-1, Math.min(1, buffer[i])) * 0x7fff;
  }
  return int16;
}
