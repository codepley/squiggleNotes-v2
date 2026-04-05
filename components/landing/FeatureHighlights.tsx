'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FeatureProps {
  headline: string;
  copy: string;
  badge: string;
  reversed?: boolean;
  visual: React.ReactNode;
}

function FeatureRow({ headline, copy, badge, reversed = false, visual }: FeatureProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center", reversed && "lg:grid-cols-2")}>
      <motion.div
        initial={{ opacity: 0, x: reversed ? 30 : -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn("order-2", reversed ? "lg:order-1" : "lg:order-1")}
      >
        <div className="inline-block px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-[11px] font-medium tracking-wide text-[#F0EDE6]/60 uppercase mb-6">
          {badge}
        </div>
        <h3 className="text-3xl md:text-4xl font-normal text-[#F0EDE6] mb-6 leading-tight">
          {headline}
        </h3>
        <p className="text-lg text-[#F0EDE6]/50 leading-relaxed">
          {copy}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className={cn("order-1 relative aspect-square rounded-3xl overflow-hidden glass border border-white/[0.08]", reversed ? "lg:order-2" : "lg:order-2")}
      >
        {visual}
      </motion.div>
    </div>
  );
}

export function FeatureHighlights() {
  return (
    <section className="py-32 bg-[#0E0E0F]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-4xl md:text-5xl font-normal text-[#F0EDE6]"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            Built on how memory <i className="text-[#F5A623]">actually</i> works.
          </motion.h2>
        </div>

        <div className="space-y-32">
          <FeatureRow
            badge="01. Context Capture"
            headline="Hear what you meant, not just what you wrote."
            copy="Record your lecture alongside your notes. Tap any sketch, equation, or keyword to instantly jump back to exactly what the professor was saying when you wrote it."
            reversed={false}
            visual={
              <div className="absolute inset-0 bg-[#161618] flex items-center justify-center grain">
                <div className="relative w-3/4 aspect-[4/3] rounded-xl border border-white/[0.06] bg-[#FAFAF7] shadow-2xl p-6">
                   <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
                     <path d="M10 50 Q 25 20 50 50 T 90 50" fill="none" stroke="#1C1C1E" strokeWidth="2" strokeLinecap="round" />
                   </svg>
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.8 }}
                     whileInView={{ opacity: 1, scale: 1 }}
                     viewport={{ once: false }}
                     transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                     className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center shadow-lg"
                   >
                     <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                   </motion.div>
                </div>
              </div>
            }
          />

          <FeatureRow
            badge="02. Neuro-Timed Revision"
            headline="Forget forgetting."
            copy="Based on the Ebbinghaus forgetting curve, SquiggleNotes auto-schedules your revision at Day 1, Day 2, Day 4, and Day 7 — exactly when the memory starts to fade."
            reversed={true}
            visual={
              <div className="absolute inset-0 bg-[#161618] flex items-center justify-center grain">
                <svg viewBox="0 0 200 100" className="w-full h-auto px-8">
                  <path d="M 10 90 Q 50 80 190 20" fill="none" stroke="rgba(245, 166, 35, 0.2)" strokeWidth="2" strokeDasharray="4 4" />
                  <motion.path 
                    d="M 10 20 Q 30 50 40 90 L 40 20 Q 80 40 100 90 L 100 20 Q 140 30 190 90" 
                    fill="none" 
                    stroke="#F0EDE6" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                  <circle cx="10" cy="20" r="4" fill="#F5A623" />
                  <circle cx="40" cy="20" r="4" fill="#F5A623" />
                  <circle cx="100" cy="20" r="4" fill="#F5A623" />
                </svg>
              </div>
            }
          />

          <FeatureRow
            badge="03. Active Recall Engine"
            headline="Reading notes is passive. This isn't."
            copy="SquiggleNotes uses AI to automatically generate flashcards, quizzes, and fill-in-the-blank exercises directly from your own handwritten notes and text blocks."
            reversed={false}
            visual={
              <div className="absolute inset-0 bg-[#161618] flex items-center justify-center perspective-[1000px] grain">
                <motion.div 
                  initial={{ rotateY: 0 }}
                  whileInView={{ rotateY: 180 }}
                  viewport={{ once: false }}
                  transition={{ delay: 1, duration: 1, ease: "easeInOut" }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative w-48 h-64 mx-auto"
                >
                  {/* Front */}
                  <div className="absolute inset-0 bg-[#1A1A1C] border border-[#F5A623]/30 rounded-xl flex items-center justify-center p-6 shadow-2xl backface-hidden" style={{ backfaceVisibility: "hidden" }}>
                    <p className="text-center font-medium text-[#F0EDE6]" style={{ fontFamily: 'var(--font-handwriting), cursive', fontSize: '1.5rem' }}>What is the powerhouse of the cell?</p>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 bg-[#30D158]/10 border border-[#30D158]/30 rounded-xl flex flex-col items-center justify-center p-6 shadow-2xl backface-hidden" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                    <p className="text-center font-bold text-[#30D158] text-xl mb-4">Mitochondria</p>
                    <div className="flex gap-2 w-full mt-auto">
                      <div className="flex-1 h-2 bg-white/[0.1] rounded-full" />
                      <div className="flex-1 h-2 bg-white/[0.1] rounded-full" />
                      <div className="flex-1 h-2 bg-[#30D158] rounded-full" />
                    </div>
                  </div>
                </motion.div>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}
