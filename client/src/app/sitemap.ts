
import { MetadataRoute } from 'next';

const BASE_URL = 'https://sapphiretrails.lk';
import { API_BASE_URL } from '@/lib/utils';

export const revalidate = 86400;

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
        let tourRoutes: MetadataRoute.Sitemap = [];
        const toursRes = await fetch(`${API_BASE_URL}/tours`, { next: { revalidate: 86400 } });
        if (toursRes.ok) {
            const tours = await toursRes.json();
            if (Array.isArray(tours)) {
                tourRoutes = tours
                    .filter((tour: any) => Boolean(tour.slug))
                    .map((tour: any) => ({
                        url: `${BASE_URL}/tours/${tour.slug}`,
                        lastModified: tour.updated_at ? new Date(tour.updated_at).toISOString() : new Date().toISOString(),
                        changeFrequency: 'monthly' as 'monthly',
                        priority: 0.6,
                    }));
            }
        }

        let locationRoutes: MetadataRoute.Sitemap = [];
        const locationsRes = await fetch(`${API_BASE_URL}/locations/`, { next: { revalidate: 86400 } });
        if (locationsRes.ok) {
            const locations = await locationsRes.json();
            if (Array.isArray(locations)) {
                locationRoutes = locations
                    .filter((loc: any) => Boolean(loc.slug))
                    .map((location: any) => ({
                        url: `${BASE_URL}/explore-ratnapura/${location.slug}`,
                        lastModified: location.updated_at ? new Date(location.updated_at).toISOString() : new Date().toISOString(),
                        changeFrequency: 'monthly' as 'monthly',
                        priority: 0.6,
                    }));
            }
        }

        let articleRoutes: MetadataRoute.Sitemap = [];
        const articlesRes = await fetch(`${API_BASE_URL}/articles`, { next: { revalidate: 86400 } });
        if (articlesRes.ok) {
            const articles = await articlesRes.json();
            if (Array.isArray(articles)) {
                articleRoutes = articles
                    .filter((a: any) => Boolean(a.slug))
                    .map((a: any) => ({
                        url: `${BASE_URL}/articles/${a.slug}`,
                        lastModified: a.updated_at ? new Date(a.updated_at).toISOString() : new Date().toISOString(),
                        changeFrequency: 'weekly' as 'weekly',
                        priority: 0.7,
                    }));
            }
        }
        
        return [...staticRoutes, ...tourRoutes, ...locationRoutes, ...articleRoutes];

    } catch (error) {
        console.error("Failed to generate dynamic sitemap data:", error);
        return staticRoutes;
    }
}
