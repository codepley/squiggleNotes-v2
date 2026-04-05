/**
 * /notes — Note list home (empty state when no note is selected).
 * Shows a welcoming empty state with quick-action prompts.
 */

export default function NotesPage() {
  return (
    <div className="flex h-full items-center justify-center bg-[#0E0E0F]">
      <div className="text-center max-w-md px-6">
        {/* Icon */}
        <div className="text-5xl mb-4">✏️</div>

        {/* Heading */}
        <h2
          className="text-2xl font-bold text-[#F0EDE6]/80 mb-2"
          style={{ fontFamily: 'var(--font-caveat), cursive' }}
        >
          Welcome to SquiggleNotes
        </h2>

        {/* Description */}
        <p className="text-sm text-[#F0EDE6]/30 mb-6 leading-relaxed">
          Select a note from the sidebar or create a new one to start taking notes.
          Your handwritten notes, typed content, and audio recordings will all live here.
        </p>

        {/* Feature hints */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
            <span className="text-lg block mb-1">🖊️</span>
            <p className="text-[10px] text-[#F0EDE6]/25">Draw &amp; Type</p>
          </div>
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
            <span className="text-lg block mb-1">🎙️</span>
            <p className="text-[10px] text-[#F0EDE6]/25">Record Audio</p>
          </div>
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
            <span className="text-lg block mb-1">🧠</span>
            <p className="text-[10px] text-[#F0EDE6]/25">AI Flashcards</p>
          </div>
        </div>

        <p className="text-xs text-[#F0EDE6]/15 mt-6">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[10px]">+ New Note</kbd> in the sidebar to begin
        </p>
      </div>
    </div>
  );
}
