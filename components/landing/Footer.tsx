import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0E0E0F] pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <Link
              href="/"
              className="text-2xl font-bold inline-block mb-4"
              style={{ fontFamily: 'var(--font-caveat), cursive' }}
            >
              <span className="text-[#F0EDE6]">Squiggle</span>
              <span className="text-[#F5A623]">Notes</span>
            </Link>
            <p className="text-sm text-[#F0EDE6]/40 max-w-xs leading-relaxed">
              Applying cognitive science to transform your lecture notes into a revision system that actually works.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F0EDE6] mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/notes" className="text-sm text-[#F0EDE6]/60 hover:text-[#F5A623] transition-colors">
                  Notes Canvas
                </Link>
              </li>
              <li>
                <Link href="/revision" className="text-sm text-[#F0EDE6]/60 hover:text-[#F5A623] transition-colors">
                  Daily Revision
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-[#F0EDE6]/60 hover:text-[#F5A623] transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F0EDE6] mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-[#F0EDE6]/60 hover:text-[#F5A623] transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#F0EDE6]/60 hover:text-[#F5A623] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#F0EDE6]/60 hover:text-[#F5A623] transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/[0.04]">
          <p className="text-xs text-[#F0EDE6]/30 mb-4 md:mb-0">
            © {new Date().getFullYear()} SquiggleNotes. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[#F0EDE6]/30 hover:text-[#F5A623] transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-[#F0EDE6]/30 hover:text-[#F5A623] transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
