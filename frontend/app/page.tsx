import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/marketing/HeroSection";
import { MarketDiscoverySection } from "@/components/marketing/MarketDiscoverySection";
import { PaperTradingSection } from "@/components/marketing/PaperTradingSection";
import { PortfolioPreviewSection } from "@/components/marketing/PortfolioPreviewSection";
import { TradingBotSection } from "@/components/marketing/TradingBotSection";
import { AnalyticsSection } from "@/components/marketing/AnalyticsSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { SecuritySection } from "@/components/marketing/SecuritySection";
import { FAQSection } from "@/components/marketing/FAQSection";
import { FinalCTASection } from "@/components/marketing/FinalCTASection";
import { Footer } from "@/components/marketing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-white">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <MarketDiscoverySection />
        <PaperTradingSection />
        <PortfolioPreviewSection />
        <TradingBotSection />
        <AnalyticsSection />
        <HowItWorksSection />
        <SecuritySection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
