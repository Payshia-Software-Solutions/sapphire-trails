import Image from 'next/image';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background-alt">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <Image src="/img/logo.png" alt="Sapphire Trails Logo" width={28} height={23} />
            <span className="font-serif text-xl tracking-[0.2em] text-primary">ADMIN PANEL</span>
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
