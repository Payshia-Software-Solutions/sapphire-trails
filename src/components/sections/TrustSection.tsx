import { CheckCircle } from 'lucide-react';

const trustPoints = [
    { text: 'Government Licensed Mines' },
    { text: 'Certified Gemologists' },
    { text: 'Safety Equipment Provided' },
];

export function TrustSection() {
    return (
        <section className="w-full bg-background-alt py-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 text-center">
                    {trustPoints.map((point, index) => (
                        <div key={index} className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium text-muted-foreground">{point.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
