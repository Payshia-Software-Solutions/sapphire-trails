import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AuthForm } from '@/components/auth/auth-form';
import { LoaderCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign In | Sapphire Trails VIP Guest Portal',
  description:
    'Sign in or create your Sapphire Trails account to manage Ratnapura gem mine expeditions, view digital invoices, and join our referral agent program.',
};

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="relative flex-1 overflow-hidden bg-background-alt py-10 sm:py-14 md:py-20 flex items-center">
        {/* Subtle luxury ambient backdrop */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-80 w-[720px] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-72 w-96 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <AuthForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
