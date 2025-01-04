import { Navbar } from "@/components-landing/navbar";
import { HeroSection } from "@/components-landing/hero-section";
import { Features } from "@/components-landing/features";
import { HowItWorks } from "@/components-landing/how-it-works";
import { Footer } from "@/components-landing/footer";

const Page = () => {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <HeroSection />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  );
};

export default Page;
