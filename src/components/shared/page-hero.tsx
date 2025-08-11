'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface Breadcrumb {
  label: string;
  href: string;
}

interface PageHeroProps {
  title: string;
  breadcrumbs: Breadcrumb[];
}

export function PageHero({ title, breadcrumbs }: PageHeroProps) {
  const pathname = usePathname();

  return (
    <section className="bg-background-alt py-12 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary">Home</Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4" />
              {pathname === crumb.href ? (
                <span className="text-foreground font-medium">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-primary">
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </div>
        <h1 className="text-4xl font-headline font-bold text-primary md:text-5xl">
          {title}
        </h1>
      </div>
    </section>
  );
}
