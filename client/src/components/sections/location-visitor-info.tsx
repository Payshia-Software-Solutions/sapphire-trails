import { Card, CardContent } from "@/components/ui/card";
import { Clock, CalendarDays, Ticket, Users } from 'lucide-react';
import { type LucideIcon } from "lucide-react";

interface Info {
  icon: string;
  title: string;
  line1: string;
  line2: string;
}

interface LocationVisitorInfoProps {
  visitorInfo: Info[];
}

const iconMap: { [key: string]: LucideIcon } = {
  Clock,
  CalendarDays,
  Ticket,
  Users,
};

export function LocationVisitorInfo({ visitorInfo }: LocationVisitorInfoProps) {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-3xl font-headline font-bold text-center mb-12 text-primary sm:text-4xl">
                    Visitor Information
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                    {visitorInfo.map((info, index) => {
                        const Icon = iconMap[info.icon];
                        return (
                            <Card key={index} className="bg-card border-stone-800/50 flex flex-col w-full rounded-xl overflow-hidden shadow-lg text-center p-6 items-center">
                                {Icon && <Icon className="h-8 w-8 text-primary mb-3" />}
                                <CardContent className="p-0">
                                    <h3 className="text-lg font-bold font-headline text-foreground">{info.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-2">{info.line1}</p>
                                    <p className="text-sm text-muted-foreground">{info.line2}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}