/**
 * /revision/session/[sessionId] — active revision session for a specific note.
 * Loads the session's generated content and renders the revision feed.
 */

import { RevisionFeed } from '@/components/revision/RevisionFeed';

type PageProps = { params: Promise<{ sessionId: string }> };

export default async function RevisionSessionPage({ params }: PageProps) {
  const { sessionId } = await params;

  return (
    <div className="h-full">
      <RevisionFeed />
    </div>
  );
}
