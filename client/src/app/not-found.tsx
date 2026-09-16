
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Gem } from 'lucide-react';
import { TrustSection } from '@/components/sections/TrustSection';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-background-alt text-center p-4">
        <div className="space-y-6">
            <Gem className="mx-auto h-16 w-16 text-primary/50" />
            <h1 className="text-6xl font-bold text-[#0B1E38] dark:text-blue-400">404</h1>
            <h2 className="text-3xl font-semibold text-foreground">Page Not Found</h2>
            <p className="text-muted-foreground max-w-md">
                Sorry, the page you are looking for does not exist or has been moved.
            </p>
            <Button asChild className="bg-[#0B1E38] hover:bg-[#071527] text-white rounded-full px-8 h-11 shadow-sm font-medium">
                <Link href="/">Return to Homepage</Link>
            </Button>
        </div>
      </main>
      <TrustSection />
      <Footer />
    </div>
  )
}
