'use client';

/**
 * WaveformVisualizer — live amplitude bars using Web Audio AnalyserNode.
 * Shows real-time audio levels during recording.
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface WaveformVisualizerProps {
  stream: MediaStream | null;
  isActive: boolean;
  barCount?: number;
}

export function WaveformVisualizer({ stream, isActive, barCount = 24 }: WaveformVisualizerProps) {
  const barsRef = useRef<number[]>(new Array(barCount).fill(4));
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    if (!stream || !isActive) {
      barsRef.current = new Array(barCount).fill(4);
      updateBars();
      return;
    }

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.7;
    source.connect(analyser);

    analyserRef.current = analyser;
    const bufferLength = analyser.frequencyBinCount;
    dataArrayRef.current = new Uint8Array(bufferLength) as Uint8Array<ArrayBuffer>;

    const animate = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      const step = Math.max(1, Math.floor(bufferLength / barCount));
      const newBars: number[] = [];

      for (let i = 0; i < barCount; i++) {
        const idx = Math.min(i * step, bufferLength - 1);
        const value = dataArrayRef.current[idx];
        const height = Math.max(4, (value / 255) * 32);
        newBars.push(height);
      }

      barsRef.current = newBars;
      updateBars();
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      source.disconnect();
      audioCtx.close();
      analyserRef.current = null;
    };
  }, [stream, isActive, barCount]);

  const updateBars = () => {
    const container = containerRef.current;
    if (!container) return;
    const barElements = container.querySelectorAll<HTMLDivElement>('[data-bar]');
    barElements.forEach((el, i) => {
      el.style.height = `${barsRef.current[i] ?? 4}px`;
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-[2px] h-8"
    >
      {Array.from({ length: barCount }, (_, i) => (
        <div
          key={i}
          data-bar
          className="w-[3px] rounded-full transition-all duration-75"
          style={{
            height: '4px',
            backgroundColor: isActive
              ? `hsl(${30 + i * 2}, 90%, ${55 + (i % 3) * 5}%)`
              : 'rgba(240, 237, 230, 0.1)',
          }}
        />
      ))}
    </div>
  );
}
