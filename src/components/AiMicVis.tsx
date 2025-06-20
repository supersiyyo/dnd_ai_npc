'use client';

import React, { useEffect, useRef } from 'react';

export interface TopMicSemiCircleVisualizerProps {
  /**
   * MediaStream (e.g. AI voice stream) to visualize
   */
  stream: MediaStream;
}

/**
 * Top audio-reactive semicircle that uses a provided MediaStream (AI input).
 */
const TopMicSemiCircleVisualizer: React.FC<TopMicSemiCircleVisualizerProps> = ({ stream }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!stream) return;
    let animationId: number;

    // Set up Web Audio API on provided stream
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    audioCtxRef.current = audioCtx;
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    const animate = () => {
      if (!analyserRef.current || !dataArrayRef.current || !pathRef.current) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
      const avg = sum / dataArrayRef.current.length;
      const normalized = avg / 255;

      // Pulse arc radius
      const minRy = 50;
      const maxRy = 90;
      const ry = minRy + (maxRy - minRy) * normalized;
      const rx = 50;
      const d = `M0,0 A${rx},${ry} 0 0,1 100,0 L100,0 L0,0 Z`;
      pathRef.current.setAttribute('d', d);

      // Shift hue from orange to deep red
      const hue = 30 - normalized * 10;
      pathRef.current.setAttribute('fill', `hsl(${hue},100%,50%)`);

      // Glow via drop-shadow
      const glowSize = 15 + normalized * 50;
      pathRef.current.style.filter = `drop-shadow(0 0 ${glowSize}px rgba(249,115,22,0.9))`;
      pathRef.current.style.transition = 'fill 0.1s linear, filter 0.1s linear';

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [stream]);

  return (
    <svg
      className="fixed inset-x-0 top-0 w-full h-[30vh] max-h-[60vh] pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        d="M0,0 A50,60 0 0,1 100,0 L100,0 L0,0 Z"
        fill="hsl(30,100%,50%)"
      />
    </svg>
  );
};

export default TopMicSemiCircleVisualizer;