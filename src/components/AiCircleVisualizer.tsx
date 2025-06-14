'use client';

import { useEffect, useRef } from "react";

interface AiCircleVisualizerProps {
  /** The AI’s audio MediaStream (e.g. from ontrack) */
  stream: MediaStream;
  /** Size of the canvas in px (square) */
  size?: number;
}

export default function AiCircleVisualizer({
  stream,
  size = 200,
}: AiCircleVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!stream) return;

    let animationId: number;

    const setup = async () => {
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const bufferLen = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLen);

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      dataRef.current = dataArray;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;

      const draw = () => {
        if (!analyserRef.current || !dataRef.current) return;
        analyserRef.current.getByteFrequencyData(dataRef.current);
        // compute average volume
        const sum = dataRef.current.reduce((acc, v) => acc + v, 0);
        const avg = sum / bufferLen;

        // clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw circle
        const radius = 20 + avg * 0.6; 
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(50, 150, 255, 0.5)`;  // cool blue glow
        ctx.fill();

        animationId = requestAnimationFrame(draw);
      };

      draw();
    };

    setup();

    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close();
      cancelAnimationFrame(animationId);
    };
  }, [stream]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="bg-transparent"
    />
  );
}
