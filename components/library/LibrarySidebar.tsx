'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { label: 'Documents', icon: '📄', view: 'documents' },
    { label: 'Favourites', icon: '⭐', view: 'favourites' },
    { label: 'Shared', icon: '👥', view: 'shared' },
    { label: 'Trash', icon: '🗑️', view: 'trash' },
];

export function LibrarySidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full flex-col py-5 px-3">
            {/* Header */}
            <div className="px-2 mb-6">
                <h2
                    className="text-lg font-semibold text-[#F0EDE6]/90"
                    style={{ fontFamily: 'var(--font-caveat), cursive' }}
                >
                    Library
                </h2>
                <p className="text-[11px] text-[#F0EDE6]/30 mt-0.5">All your notes, organised</p>
            </div>

            {/* Nav items */}
            <nav className="flex flex-col gap-0.5">
                {NAV_ITEMS.map((item) => {
                    const href = `/library/${item.view}`;
                    const isActive = pathname === href;

                    return (
                        <Link key={item.view} href={href}>
                            <motion.div
                                whileHover={{ scale: 1.01, x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer select-none',
                                    isActive
                                        ? 'bg-[#F5A623]/10 text-[#F5A623] font-medium'
                                        : 'text-[#F0EDE6]/50 hover:text-[#F0EDE6]/80 hover:bg-white/[0.04]',
                                )}
                            >
                                {/* Active indicator */}
                                <span
                                    className={cn(
                                        'w-1.5 h-1.5 rounded-full flex-shrink-0 transition-opacity',
                                        isActive ? 'bg-[#F5A623] opacity-100' : 'opacity-0',
                                    )}
                                />
                                <span className="text-base">{item.icon}</span>
                                <span>{item.label}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Divider */}
            <div className="mx-2 my-4 border-t border-white/[0.05]" />

            {/* Back to notes */}
            <Link href="/notes">
                <motion.div
                    whileHover={{ x: -2 }}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-[#4F6EF7]/60 hover:text-[#4F6EF7] transition-colors cursor-pointer"
                >
                    <span>←</span>
                    <span>Back to Notes</span>
                </motion.div>
            </Link>
        </div>
    );
}
