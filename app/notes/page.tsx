/**
 * /notes — Note list home.
 * Shows empty state when no note is selected.
 * Will be populated by the sidebar in step 3.2.
 */
export default function NotesPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center text-[#F0EDE6]/40">
        <p className="text-lg">Select a note or create a new one</p>
        <p className="mt-1 text-sm">Your notes will appear in the sidebar</p>
      </div>
    </div>
  );
}
