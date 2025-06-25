'use client';

import { useState } from 'react';

export function ExploreMap() {
    const [isMapActive, setIsMapActive] = useState(false);

    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-headline font-bold tracking-tight text-primary sm:text-4xl">Explore Ratnapura on the Map</h2>
                </div>
                <div
                    className="relative max-w-6xl mx-auto rounded-lg overflow-hidden border border-border shadow-lg"
                    onClick={() => setIsMapActive(true)}
                >
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31707.49849544907!2d80.3411317420556!3d6.685382470766324!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae3beeb6356b695%3A0x3b137c569e5e45a0!2sRatnapura!5e0!3m2!1sen!2slk!4v1719398868846!5m2!1sen!2slk"
                        width="100%"
                        height="600"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full"
                    ></iframe>
                    {!isMapActive && (
                        <div className="absolute inset-0 bg-transparent cursor-pointer"></div>
                    )}
                </div>
            </div>
        </section>
    );
}
