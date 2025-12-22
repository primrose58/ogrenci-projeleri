import { createClient } from '@/lib/supabase/server';

// ... (imports)

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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
