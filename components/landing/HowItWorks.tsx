'use client';

import { motion, type Variants } from 'framer-motion';

export function HowItWorks() {
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.3 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section id="how-it-works" className="py-24 bg-[#161618] border-y border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 
            className="text-4xl md:text-5xl font-normal text-[#F0EDE6]"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            Capture. Understand. Recall.
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="relative grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[1px] bg-white/[0.08]" />
          
          <motion.div
            className="hidden md:block absolute top-[60px] left-[15%] h-[1px] bg-[#F5A623]"
            initial={{ width: "0%" }}
            whileInView={{ width: "70%" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
          />

          <motion.div variants={item} className="relative z-10">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-[#1A1A1C] border border-white/[0.08] flex items-center justify-center text-5xl text-[#F0EDE6]/30 shadow-xl" style={{ fontFamily: 'var(--font-display), serif' }}>
              1
            </div>
            <h3 className="text-xl font-medium text-[#F0EDE6] text-center mb-3">Capture</h3>
            <p className="text-[#F0EDE6]/50 text-center leading-relaxed">
              Write notes + record your lecture at the same time. Everything you write is synced to the audio.
            </p>
          </motion.div>

          <motion.div variants={item} className="relative z-10">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-[#1A1A1C] border border-[#F5A623]/30 flex items-center justify-center text-5xl text-[#F5A623] shadow-[0_0_30px_rgba(245,166,35,0.15)]" style={{ fontFamily: 'var(--font-display), serif' }}>
              2
            </div>
            <h3 className="text-xl font-medium text-[#F0EDE6] text-center mb-3">Understand</h3>
            <p className="text-[#F0EDE6]/50 text-center leading-relaxed">
              Context is preserved forever. Tap any note element to replay the exact explanation you heard at that moment.
            </p>
          </motion.div>

          <motion.div variants={item} className="relative z-10">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-[#1A1A1C] border border-white/[0.08] flex items-center justify-center text-5xl text-[#F0EDE6]/30 shadow-xl" style={{ fontFamily: 'var(--font-display), serif' }}>
              3
            </div>
            <h3 className="text-xl font-medium text-[#F0EDE6] text-center mb-3">Recall</h3>
            <p className="text-[#F0EDE6]/50 text-center leading-relaxed">
              SquiggleNotes automatically schedules neuro-timed revision sessions spaced specifically to counter the forgetting curve.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
