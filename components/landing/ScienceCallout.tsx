'use client';

import { motion } from 'framer-motion';

export function ScienceCallout() {
  return (
    <section className="py-24 bg-[#161618] border-y border-white/[0.04]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xl md:text-2xl font-light text-[#F0EDE6]/60 leading-relaxed mb-6 italic" style={{ fontFamily: 'var(--font-display), serif' }}>
            &quot;Most apps store notes.
          </p>
          <p className="text-3xl md:text-5xl font-medium text-[#F0EDE6] mb-16">
            SquiggleNotes builds memory.&quot;
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex flex-col items-center px-6 py-4 rounded-2xl bg-[#0E0E0F] border border-[#F5A623]/20 shadow-lg"
          >
            <span className="text-sm font-semibold text-[#F0EDE6] tracking-wide mb-1">Spaced Repetition</span>
            <span className="text-[#F5A623] text-lg" style={{ fontFamily: 'var(--font-handwriting), cursive' }}>Ebbinghaus</span>
            <span className="text-xs text-[#F0EDE6]/30">Forgetting Curve</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center px-6 py-4 rounded-2xl bg-[#0E0E0F] border border-[#4F6EF7]/20 shadow-lg"
          >
            <span className="text-sm font-semibold text-[#F0EDE6] tracking-wide mb-1">Active Recall</span>
            <span className="text-[#4F6EF7] text-lg" style={{ fontFamily: 'var(--font-handwriting), cursive' }}>Roediger & Karpicke</span>
            <span className="text-xs text-[#F0EDE6]/30">Retrieval Practice</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col items-center px-6 py-4 rounded-2xl bg-[#0E0E0F] border border-[#30D158]/20 shadow-lg"
          >
            <span className="text-sm font-semibold text-[#F0EDE6] tracking-wide mb-1">Context Preservation</span>
            <span className="text-[#30D158] text-lg" style={{ fontFamily: 'var(--font-handwriting), cursive' }}>Encoding</span>
            <span className="text-xs text-[#F0EDE6]/30">Specificity Principle</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
