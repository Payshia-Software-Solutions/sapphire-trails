import { Users, Award, ShieldCheck, Gem } from 'lucide-react';
import { ScrollAnimate } from '@/components/shared/scroll-animate';

const stats = [
  {
    icon: Users,
    value: "5,000+",
    label: "Happy Guests"
  },
  {
    icon: Award,
    value: "27+",
    label: "Years of Hospitality Excellence"
  },
  {
    icon: ShieldCheck,
    value: "100%",
    label: "Safety Record"
  },
  {
    icon: Gem,
    value: "50+",
    label: "Active Mine Pits Accessed"
  }
];

export function StatsSection() {
  return (
    <section className="w-full py-12 md:py-24 bg-background">
      <ScrollAnimate>
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <Icon className="h-10 w-10 text-primary" />
                  <p className="text-4xl font-bold font-headline text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground px-2">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollAnimate>
    </section>
  );
}
