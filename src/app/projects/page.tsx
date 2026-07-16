import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { InvestSection } from "@/components/sections/home-sections";

export default function ProjectsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <InvestSection />
      </main>
      <Footer />
    </div>
  );
}
