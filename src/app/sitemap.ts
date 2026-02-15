
import { MetadataRoute } from 'next';

const BASE_URL = 'https://sapphiretrails.lk';
const API_BASE_URL = 'https://server-sapphiretrails.payshia.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes = [
        '/',
        '/about',
        '/tours',
        '/explore-ratnapura',
        '/articles',
        '/contact',
        '/booking',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as 'weekly',
        priority: route === '/' ? 1 : 0.8,
    }));

    try {
        const toursRes = await fetch(`${API_BASE_URL}/tours`);
        const tours: any[] = await toursRes.json();
        const tourRoutes = tours.map((tour) => ({
            url: `${BASE_URL}/tours/${tour.slug}`,
            lastModified: tour.updated_at ? new Date(tour.updated_at).toISOString() : new Date().toISOString(),
            changeFrequency: 'monthly' as 'monthly',
            priority: 0.6,
        }));

        const locationsRes = await fetch(`${API_BASE_URL}/locations`);
        const locations: any[] = await locationsRes.json();
        const locationRoutes = locations.map((location) => ({
            url: `${BASE_URL}/explore-ratnapura/${location.slug}`,
            lastModified: location.updated_at ? new Date(location.updated_at).toISOString() : new Date().toISOString(),
            changeFrequency: 'monthly' as 'monthly',
            priority: 0.6,
        }));
        
        return [...staticRoutes, ...tourRoutes, ...locationRoutes];

    } catch (error) {
        console.error("Failed to generate dynamic sitemap data:", error);
        return staticRoutes;
    }
}
