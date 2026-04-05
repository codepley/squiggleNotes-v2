'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 80);
  });

  return (
    <motion.header
      className={cn(
        "fixed top-0 inset-x-0 z-[100] transition-colors duration-300",
        scrolled ? "bg-[#0E0E0F]/80 backdrop-blur-xl border-b border-white/[0.06]" : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-3xl font-bold flex items-center gap-1 group"
          style={{ fontFamily: 'var(--font-caveat), cursive' }}
        >
          <span className="text-[#F0EDE6] group-hover:opacity-80 transition-opacity">Squiggle</span>
          <span className="text-[#F5A623]">Notes</span>
        </Link>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-[#F0EDE6]/80 hover:text-[#F0EDE6] transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-[#F5A623] hover:bg-[#E0941B] text-[#1C1C1E] px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Get Started <span className="opacity-60 ml-1">→</span>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
