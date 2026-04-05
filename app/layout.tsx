import type { Metadata } from 'next';
import { DM_Sans, Instrument_Serif, Caveat } from 'next/font/google';
import { AuthProvider } from '@/components/providers/AuthProvider';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SquiggleNotes – Notes that remember. So you don\'t have to.',
  description:
    'SquiggleNotes applies cognitive science principles — spaced repetition, active recall, and context preservation — to help students retain and recall what they learn.',
  keywords: ['notes app', 'spaced repetition', 'active recall', 'UPSC', 'NEET', 'CAT', 'study app'],
  openGraph: {
    title: 'SquiggleNotes',
    description: 'Notes that remember. So you don\'t have to.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${instrumentSerif.variable} ${caveat.variable}`}
    >
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
