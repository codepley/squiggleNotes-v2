'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden grain">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#F5A623]/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl lg:text-[80px] font-normal leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            <span className="italic block mb-2 text-[#F0EDE6]/90">Notes that remember.</span>
            <span className="text-[#F0EDE6]">So you don&apos;t have to.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl text-[#F0EDE6]/60 leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            SquiggleNotes applies cognitive science to transform your lecture notes into a revision system that actually works.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#F5A623] hover:bg-[#E0941B] text-[#1C1C1E] font-semibold text-lg transition-colors shadow-[0_0_40px_-10px_rgba(245,166,35,0.4)]"
            >
              Get Started Free
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/[0.1] hover:bg-white/[0.04] text-[#F0EDE6] font-medium text-lg transition-colors flex items-center justify-center gap-2"
            >
              See How It Works
              <span className="opacity-50">↓</span>
            </a>
          </motion.div>
        </div>

        {/* Hero Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-4xl rounded-2xl border border-white/[0.08] bg-[#161618] shadow-2xl overflow-hidden glass aspect-video"
        >
          {/* Mockup Toolbar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 h-10 rounded-lg bg-black/40 backdrop-blur border border-white/[0.08] flex items-center px-2 gap-2 z-20">
            <div className="w-6 h-6 rounded bg-white/[0.1] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1C1C1E]" />
            </div>
            <div className="w-6 h-6 rounded hover:bg-white/[0.05] flex items-center justify-center text-[#F0EDE6]/40 cursor-text">
              T
            </div>
            <div className="w-[1px] h-4 bg-white/[0.1] mx-1" />
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#FF453A]/10 border border-[#FF453A]/20">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF453A] animate-pulse" />
              <span className="text-[10px] font-mono text-[#FF453A]">00:14</span>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="absolute inset-0 canvas-paper opacity-90" />

          {/* Animated Handwriting */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 450">
            {/* The word "Mitochondria" written out */}
            <motion.path
              d="M 200 200 C 210 180, 220 180, 230 200 C 240 220, 250 220, 260 200 C 270 180, 280 200, 280 220 L 290 200"
              fill="transparent"
              stroke="#1C1C1E"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1, ease: "easeOut" }}
            />
            {/* Second part of handwritten note */}
            <motion.path
              d="M 310 210 C 330 205, 350 205, 370 210"
              fill="transparent"
              stroke="#1C1C1E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 3, ease: "easeOut" }}
            />
          </svg>

          {/* Animated Text Block */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 3.5 }}
            className="absolute top-[230px] left-[200px] text-[#1C1C1E]/80 font-medium text-sm"
          >
            Powerhouse of the cell
          </motion.div>

          {/* Animated Highlight / Context Reveal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 4.5 }}
            className="absolute top-[170px] left-[180px] px-3 py-2 rounded-lg bg-[#161618] border border-white/[0.08] shadow-xl flex items-center gap-2"
          >
            <div className="w-5 h-5 rounded-full bg-[#4F6EF7]/20 flex items-center justify-center">
              <span className="text-[8px]">▶</span>
            </div>
            <div className="flex-1">
              <div className="w-24 h-1.5 rounded-full bg-white/[0.1] overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, delay: 5, ease: "linear" }}
                  className="h-full bg-[#4F6EF7]"
                />
              </div>
            </div>
          </motion.div>

          {/* Feature Badge Popups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            className="absolute bottom-8 right-8 px-4 py-2 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/20 shadow-lg"
          >
            <span className="text-[10px] uppercase tracking-wider text-[#F5A623] font-semibold">
              Context Captured
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
