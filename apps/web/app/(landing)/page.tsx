import { Navbar } from "@/components-landing/navbar";
import { HeroSection } from "@/components-landing/hero-section";
import { Features } from "@/components-landing/features";
import { HowItWorks } from "@/components-landing/how-it-works";
import { Footer } from "@/components-landing/footer";
import { auth } from "@clerk/nextjs/server";

const Page = async () => {
  const { userId: userAuthId } = await auth();

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar userAuthId={userAuthId} />
      <HeroSection />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  );
};

export default Page;
