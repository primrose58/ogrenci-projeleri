import { createClient } from '@/lib/supabase/server';
import RealtimeFeed from "@/components/RealtimeFeed";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-purple-500/30">
      <HeroSection user={user} />

      <HowItWorks />

      {/* Feed Section */}
      <section className="flex-1 p-6 md:p-12 lg:p-20 max-w-[1600px] mx-auto w-full z-10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Latest Projects</h2>
            <p className="text-gray-400">Discover what students are building right now.</p>
          </div>
        </div>
        <RealtimeFeed />
      </section>

      {/* Simple Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-white/5">
        <p>© 2024 Student Project Showcase. All rights reserved.</p>
        <p className="mt-2">Designed with ❤️ by AntiGravity</p>
      </footer>
    </div>
  );
}
