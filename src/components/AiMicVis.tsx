// components/TopMicSemiCircleVisualizer.tsx
'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Enhanced audio-reactive top semicircle with bold presence:
 * - Increased height for more mass
 * - Stronger gradient and glow
 * - Thicker, more dynamic outline
 */
const TopMicSemiCircleVisualizer: React.FC = () => {
  const pathRef = useRef<SVGPathElement>(null);
  const outlineRef = useRef<SVGPathElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);
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
        if (!analyserRef.current || !dataArrayRef.current || !pathRef.current || !outlineRef.current) {
          animationId = requestAnimationFrame(animate);
          return;
        }

        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
        const avg = sum / dataArrayRef.current.length;
        const normalized = avg / 255;

        // Pulse arc radius
        const minRy = 45;
        const maxRy = 85;
        const ry = minRy + (maxRy - minRy) * normalized;
        const rx = 50;
        const d = `M0,0 A${rx},${ry} 0 0,1 100,0 L100,0 L0,0 Z`;
        pathRef.current.setAttribute('d', d);
        outlineRef.current.setAttribute('d', d);

        // Update gradient stops
        const gradient = gradientRef.current;
        if (gradient) {
          const stops = gradient.children;
          (stops[0] as SVGStopElement).setAttribute('stop-color', `hsl(${20 + normalized * 30},100%,80%)`);
          (stops[1] as SVGStopElement).setAttribute('stop-color', `hsl(${20 + normalized * 30},100%,40%)`);
        }

        // Glow filter intensity
        const glow = 15 + normalized * 50;
        pathRef.current.style.filter = `url(#glow) drop-shadow(0 0 ${glow}px rgba(249,115,22,0.9))`;

        // Outline stroke reacts strongly
        const strokeWidth = 2 + normalized * 6;
        outlineRef.current.style.strokeWidth = `${strokeWidth}px`;
        outlineRef.current.style.strokeOpacity = `${0.5 + normalized * 0.5}`;

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
      className="fixed inset-x-0 top-0 w-full h-[30vh] max-h-[60vh] pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="arcGradient" ref={gradientRef} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(30,100%,80%)" />
          <stop offset="100%" stopColor="hsl(30,100%,40%)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Bold gradient-filled arc with strong glow */}
      <path
        ref={pathRef}
        d="M0,0 A50,60 0 0,1 100,0 L100,0 L0,0 Z"
        fill="url(#arcGradient)"
        style={{ filter: 'url(#glow) drop-shadow(0 0 15px rgba(249,115,22,0.8))' }}
      />
      {/* Prominent outline arc */}
      <path
        ref={outlineRef}
        d="M0,0 A50,100 0 0,1 100,0 L100,0 L0,0 Z"
        fill="none"
        stroke="white"
        strokeOpacity={0.5}
        strokeWidth={2}
      />
    </svg>
  );
};

export default TopMicSemiCircleVisualizer;
