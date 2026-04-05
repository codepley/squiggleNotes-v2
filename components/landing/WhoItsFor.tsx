'use client';

import { motion } from 'framer-motion';

export function WhoItsFor() {
  return (
    <section className="py-24 bg-[#0E0E0F]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-3xl md:text-5xl font-normal text-[#F0EDE6]"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            For students who <em className="italic text-[#F5A623]">can't afford</em> to forget.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="group relative p-8 rounded-3xl bg-[#161618] border border-white/[0.04] hover:border-[#F5A623]/50 transition-colors duration-500 overflow-hidden glass"
          >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F5A623]/0 to-[#F5A623]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <h3 className="text-xl font-semibold text-[#F0EDE6] mb-2 relative z-10">
              Competitive Exam Aspirants
            </h3>
            <p className="text-[#F5A623] font-medium text-sm tracking-widest uppercase mb-8 relative z-10">
              UPSC · SSC · CAT · NEET
            </p>
            
            <div className="relative z-10">
              <p className="text-2xl text-[#F0EDE6]/80 leading-snug italic" style={{ fontFamily: 'var(--font-display), serif' }}>
                &quot;Months of content. One brain. Zero margin for error.&quot;
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/[0.06] relative z-10">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-[#F0EDE6]/60">
                  <span className="text-[#F5A623]">✓</span> Master high-volume syllabi without drowning in old notes.
                </li>
                <li className="flex items-start gap-3 text-sm text-[#F0EDE6]/60">
                  <span className="text-[#F5A623]">✓</span> Stay on top of current affairs with automated active recall.
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative p-8 rounded-3xl bg-[#161618] border border-white/[0.04] hover:border-[#4F6EF7]/50 transition-colors duration-500 overflow-hidden glass"
          >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#4F6EF7]/0 to-[#4F6EF7]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <h3 className="text-xl font-semibold text-[#F0EDE6] mb-2 relative z-10">
              University Students
            </h3>
            <p className="text-[#4F6EF7] font-medium text-sm tracking-widest uppercase mb-8 relative z-10">
              Engineering · Medicine · Law · Sciences
            </p>
            
            <div className="relative z-10">
              <p className="text-2xl text-[#F0EDE6]/80 leading-snug italic" style={{ fontFamily: 'var(--font-display), serif' }}>
                &quot;Finally understand <span className="underline decoration-[#4F6EF7]/40 underline-offset-4">why</span> you wrote what you wrote.&quot;
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/[0.06] relative z-10">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-[#F0EDE6]/60">
                  <span className="text-[#4F6EF7]">✓</span> Untangle complex lectures by replaying the professor&apos;s audio context.
                </li>
                <li className="flex items-start gap-3 text-sm text-[#F0EDE6]/60">
                  <span className="text-[#4F6EF7]">✓</span> Convert dense textbooks and lectures into instant quizzes.
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
