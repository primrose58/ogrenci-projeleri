import { useTranslations } from 'next-intl';
import RealtimeFeed from "@/components/RealtimeFeed";
import { Link } from "@/i18n/routing";
import Button from "@/components/ui/Button";

export default function HomePage() {
  const t = useTranslations('HomePage');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex flex-col items-center justify-center text-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black z-0" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay"></div>

        <div className="relative z-10 max-w-4xl flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl font-light">
            {t('subTitle')}
          </p>
          <p className="text-gray-400 max-w-lg">{t('welcome')}</p>
          <div className="flex gap-4 mt-8">
            <Link href="/auth">
              <Button className="px-8 py-3 text-lg">{t('getStarted')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feed Section */}
      <section className="flex-1 p-6 md:p-12 lg:p-20 max-w-[1600px] mx-auto w-full z-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white tracking-tight">Latest Projects</h2>
          <div className="flex gap-2">
            {/* Placeholder for filters */}
          </div>
        </div>
        <RealtimeFeed />
      </section>
    </div>
  );
}
