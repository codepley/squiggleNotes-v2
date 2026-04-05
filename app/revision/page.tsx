/**
 * /revision — Daily revision feed page.
 * Loads due sessions and renders the card-by-card review interface.
 */

import { RevisionFeed } from '@/components/revision/RevisionFeed';

export default function RevisionPage() {
  return (
    <div className="h-screen bg-[#0E0E0F]">
      <RevisionFeed />
    </div>
  );
}
