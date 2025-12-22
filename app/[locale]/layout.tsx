import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import "../globals.css";
import { createClient } from '@/lib/supabase/server';
import { Toaster } from 'sonner';
import AuthListener from "@/components/AuthListener";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Öğrenci Proje Ağı | Student Project Network",
  description: "Share your projects with the world.",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!['en', 'tr'].includes(locale)) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();

  // Fetch user session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <Navbar user={user} />
          <div className="flex-1">
            {children}
          </div>
          <Toaster position="top-center" richColors />
          <AuthListener />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
