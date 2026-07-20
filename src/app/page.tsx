import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Faq,
  Features,
  Hero,
  InvestSection,
  Partners,
  Requirements,
  Stats,
} from "@/components/sections/home-sections";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <Stats />
        <InvestSection />
        <Requirements />
        <Partners />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
