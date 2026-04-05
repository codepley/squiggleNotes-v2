import { LibrarySidebar } from '@/components/library/LibrarySidebar';

export const metadata = { title: 'Library – SquiggleNotes' };

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-[#0E0E0F]">
            {/* Library sidebar */}
            <aside className="w-56 flex-shrink-0 border-r border-white/[0.06] bg-[#161618]">
                <LibrarySidebar />
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-auto">{children}</main>
        </div>
    );
}
