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
                    {/* Desktop View */}
                    <div className="hidden md:grid grid-cols-3 gap-px bg-border rounded-lg overflow-hidden border border-border text-sm">
                        <div className="p-4 bg-card font-headline text-primary">Feature</div>
                        <div className="p-4 bg-card font-headline text-primary text-left">Gem Explore Day Tour</div>
                        <div className="p-4 bg-card font-headline text-primary text-left">Sapphire Trails Deluxe</div>

                        {tableData.map((row) => (
                            <React.Fragment key={row.feature}>
                                <div className="p-4 bg-background font-semibold text-foreground">{row.feature}</div>
                                <div className="p-4 bg-background text-muted-foreground">
                                    {row.dayTour}
                                </div>
                                <div className="p-4 bg-background text-muted-foreground">
                                    {row.deluxeTour}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-8">
                        <div className="border border-border rounded-lg overflow-hidden">
                            <div className="p-4 bg-card">
                                <h3 className="font-headline text-lg text-primary text-center">Gem Explore Day Tour</h3>
                            </div>
                            <div className="bg-background">
                                {tableData.map((row, index) => (
                                    <div key={`day-${row.feature}`} className={`p-4 space-y-1 ${index < tableData.length - 1 ? 'border-b border-border' : ''}`}>
                                        <p className="font-semibold text-foreground">{row.feature}</p>
                                        <p className="text-muted-foreground text-sm">{row.dayTour}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border border-border rounded-lg overflow-hidden">
                            <div className="p-4 bg-card">
                                <h3 className="font-headline text-lg text-primary text-center">Sapphire Trails Deluxe</h3>
                            </div>
                            <div className="bg-background">
                                {tableData.map((row, index) => (
                                    <div key={`deluxe-${row.feature}`} className={`p-4 space-y-1 ${index < tableData.length - 1 ? 'border-b border-border' : ''}`}>
                                        <p className="font-semibold text-foreground">{row.feature}</p>
                                        <p className="text-muted-foreground text-sm">{row.deluxeTour}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
