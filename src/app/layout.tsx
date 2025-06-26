import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { PreloaderProvider } from '@/components/shared/preloader-provider';

export const metadata: Metadata = {
  title: 'Sapphire Trails',
  description: "Sri Lanka's Only Luxury Gem Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=Montserrat:wght@700&family=Poppins:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
          <PreloaderProvider>
            {children}
          </PreloaderProvider>
          <Toaster />
      </body>
    </html>
  );
}
