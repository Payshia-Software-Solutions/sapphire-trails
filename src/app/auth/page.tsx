import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AuthForm } from '@/components/auth/auth-form';

export default function AuthPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background-alt py-12 md:py-24 lg:py-32">
        <AuthForm />
      </main>
      <Footer />
    </div>
  );
}
