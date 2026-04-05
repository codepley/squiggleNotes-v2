'use client';

import { motion, type Variants } from 'framer-motion';

export function ProblemSection() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section className="py-24 bg-[#0E0E0F]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 
            className="text-3xl md:text-5xl font-normal text-[#F0EDE6]/90"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            You took notes. <span className="text-[#F5A623]">But do you remember what they meant?</span>
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={item} className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.04] grain">
            <h3 className="text-sm font-semibold text-[#F0EDE6] uppercase tracking-wider mb-4 border-b border-white/[0.06] pb-4">
              Context Fades
            </h3>
            <p className="text-[#F0EDE6]/60 leading-relaxed">
              You wrote it, but weeks later the explanation is gone. Looking at the keyword doesn&apos;t bring back the understanding.
            </p>
          </motion.div>

          <motion.div variants={item} className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.04] grain">
            <h3 className="text-sm font-semibold text-[#F0EDE6] uppercase tracking-wider mb-4 border-b border-white/[0.06] pb-4">
              Revision is Manual
            </h3>
            <p className="text-[#F0EDE6]/60 leading-relaxed">
              Highlighting and rereading don&apos;t build memory. Active recall is proven to work, but making flashcards takes hours you don&apos;t have.
            </p>
          </motion.div>

          <motion.div variants={item} className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.04] grain">
            <h3 className="text-sm font-semibold text-[#F0EDE6] uppercase tracking-wider mb-4 border-b border-white/[0.06] pb-4">
              You Forget Anyway
            </h3>
            <p className="text-[#F0EDE6]/60 leading-relaxed">
              Without timed recall, even good notes decay. You learn it today, but by the exam next month, it&apos;s 80% forgotten.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
