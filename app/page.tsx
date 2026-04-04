import { redirect } from 'next/navigation';

/**
 * Root page — redirects to /notes for authenticated users.
 * In production, this will be the landing page (see Section 11 of the plan).
 * For MVP, redirect directly to /notes.
 */
export default function RootPage() {
  redirect('/notes');
}
