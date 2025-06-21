// components/MicSemiCircleVisualizer.tsx
'use client';

import React, { useEffect, useRef } from 'react';

const MicSemiCircleVisualizer: React.FC = () => {
  const pathRef = useRef<SVGPathElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    let animationId: number;

    const setupAudio = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
        const normalized = avg / 255; // 0 to 1

        // Pulse arc radius
        const minRy = 40;
        const maxRy = 70;
        const ry = minRy + (maxRy - minRy) * normalized;
        const rx = 40;
        const d = `M0,100 A${rx},${ry} 0 0,1 100,100 L100,100 L0,100 Z`;
        pathRef.current.setAttribute('d', d);

        // Shift hue based on amplitude
        const hue = 200 + normalized * 100; // from blue to cyan
        pathRef.current.setAttribute('fill', `hsl(${hue},100%,60%)`);

        // Glow effect via drop-shadow
        const glowSize = 10 + normalized * 40;
        pathRef.current.style.filter = `drop-shadow(0 0 ${glowSize}px rgba(59,130,246,0.7))`;
        pathRef.current.style.transition = 'fill 0.1s linear, filter 0.1s linear';

        animationId = requestAnimationFrame(animate);
      };

      animate();
    };

    setupAudio();

    return () => {
      cancelAnimationFrame(animationId);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <svg
      className="fixed inset-x-0 bottom-0 w-full h-[25vh] max-h-[50vh] pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        d="M0,100 A40,50 0 0,1 100,100 L100,100 L0,100 Z"
        fill="hsl(220,100%,60%)"
        style={{ filter: 'drop-shadow(0 0 10px rgba(59,130,246,0.5))' }}
      />
    </svg>
  );
};

export default MicSemiCircleVisualizer;
