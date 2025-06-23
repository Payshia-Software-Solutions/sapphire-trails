import * as React from 'react';

const tableData = [
    { feature: 'Activities', dayTour: 'Gem market visit, traditional and modern gem cutting methods, gem museum, Gem showcase', deluxeTour: 'Includes everything from Gem explorer tour, plus deluxe accommodation, full board meals, and a Tea Factory tour.' },
    { feature: 'Inclusions', dayTour: 'Lunch, Safety gear, Guide', deluxeTour: 'Refreshments, Entry fees, Guide' },
    { feature: 'Price', dayTour: '$135', deluxeTour: '$215' },
    { feature: 'Duration', dayTour: '6 hours', deluxeTour: '6 hours + Stay' },
];

export function ComparisonTable() {
    return (
        <section className="w-full pb-12 md:pb-24 lg:pb-32 bg-background-alt">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-lg overflow-hidden border border-border text-sm">
                        <div className="p-4 bg-card font-headline text-primary hidden md:block">Feature</div>
                        <div className="p-4 bg-card font-headline text-primary text-center md:text-left">Gem Explore Day Tour</div>
                        <div className="p-4 bg-card font-headline text-primary text-center md:text-left">Sapphire Trails Deluxe</div>

                        {tableData.map((row) => (
                            <React.Fragment key={row.feature}>
                                <div className="p-4 bg-background font-semibold text-foreground hidden md:block">{row.feature}</div>
                                <div className="p-4 bg-background text-muted-foreground">
                                    <strong className="text-foreground font-medium md:hidden mb-2 block">{row.feature}</strong>
                                    {row.dayTour}
                                </div>
                                <div className="p-4 bg-background text-muted-foreground">
                                     <strong className="text-foreground font-medium md:hidden mb-2 block">{row.feature}</strong>
                                    {row.deluxeTour}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
