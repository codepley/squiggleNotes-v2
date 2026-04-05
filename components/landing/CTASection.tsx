'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export function CTASection() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      router.push(`/signup?email=${encodeURIComponent(email)}`);
    } else {
      router.push('/signup');
    }
  };

  return (
    <section className="relative py-32 bg-[#0E0E0F] overflow-hidden grain">
      {/* Background Watermark */}
      <div 
        className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none overflow-hidden"
        style={{ fontFamily: 'var(--font-display), serif' }}
      >
        <span className="text-[20vw] italic whitespace-nowrap tracking-tighter mix-blend-overlay">
          Remember.
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-normal text-[#F0EDE6] mb-8"
            style={{ fontFamily: 'var(--font-display), serif' }}
          >
            Your notes are waiting to be remembered.
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch justify-center gap-3 max-w-xl mx-auto mb-6">
            <motion.input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              animate={{ 
                borderColor: isFocused ? 'rgba(245, 166, 35, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                backgroundColor: isFocused ? 'rgba(26, 26, 28, 0.9)' : 'rgba(22, 22, 24, 0.8)'
              }}
              className="flex-1 px-6 py-4 rounded-xl text-[#F0EDE6] placeholder-[#F0EDE6]/30 outline-none transition-all shadow-inner"
              required
            />
            <button
              type="submit"
              className="px-8 py-4 rounded-xl bg-[#F5A623] hover:bg-[#E0941B] text-[#1C1C1E] font-semibold tracking-wide transition-colors whitespace-nowrap shadow-lg flex items-center justify-center gap-2 group"
            >
              Start for Free
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </form>

          <p className="text-sm text-[#F0EDE6]/40">
            No credit card required. Works on web and tablet.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
