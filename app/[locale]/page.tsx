import { createClient } from '@/lib/supabase/server';
import RealtimeFeed from "@/components/RealtimeFeed";
import { getTranslations } from 'next-intl/server';
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations('HomePage');
  const tFooter = await getTranslations('Footer');

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-purple-500/30">
      <HeroSection user={user} />

      <HowItWorks />

      {/* Feed Section */}
      <section className="flex-1 p-6 md:p-12 lg:p-20 max-w-[1600px] mx-auto w-full z-10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('latestProjects')}</h2>
            <p className="text-gray-700 dark:text-gray-400 font-medium">{t('discoverSubTitle')}</p>
          </div>
        </div>
        <RealtimeFeed />
      </section>

      {/* Simple Footer */}
      <footer className="py-8 text-center text-gray-600 dark:text-gray-500 text-sm border-t border-gray-200 dark:border-white/5">
        <p>{tFooter('copyright')}</p>
        <p className="mt-2">{tFooter('designedBy')}</p>
      </footer>
    </div>
  );
}
