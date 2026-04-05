import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { FeatureHighlights } from '@/components/landing/FeatureHighlights';
import { ScienceCallout } from '@/components/landing/ScienceCallout';
import { WhoItsFor } from '@/components/landing/WhoItsFor';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0E0E0F]">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <FeatureHighlights />
        <ScienceCallout />
        <WhoItsFor />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
