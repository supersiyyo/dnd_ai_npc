'use client';

import { useEffect, useRef } from "react";

export default function MicCircleVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    let animationId: number;

    const setupMic = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);

      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      audioContextRef.current = audioCtx;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      const render = () => {
        if (!ctx || !canvas || !analyserRef.current || !dataArrayRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const avg = dataArrayRef.current.reduce((sum, val) => sum + val, 0) / bufferLength;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const radius = 30 + avg * 0.5;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 100, 0, 0.6)`;
        ctx.fill();

        animationId = requestAnimationFrame(render);
      };

      render();
    };

    setupMic();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="bg-transparent"
    />
  );
}
