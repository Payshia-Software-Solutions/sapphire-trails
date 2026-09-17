
import { MetadataRoute } from 'next';
import { API_BASE_URL } from '@/lib/utils';

const BASE_URL = 'https://sapphiretrails.lk';
const STABLE_RELEASE_DATE = '2026-09-13T00:00:00.000Z';

export const revalidate = 3600; // 1-hour ISR cache

function parseValidDate(dateVal: any, fallback: string): string {
    if (!dateVal) return fallback;
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? fallback : d.toISOString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        let latestTourDate = STABLE_RELEASE_DATE;
        let latestLocationDate = STABLE_RELEASE_DATE;
        let latestArticleDate = STABLE_RELEASE_DATE;

        // 1. Dynamic Tours (High Priority commercial pages)
        let tourRoutes: MetadataRoute.Sitemap = [];
        try {
            const toursRes = await fetch(`${API_BASE_URL}/tours`, { next: { revalidate: 86400 } });
            if (toursRes.ok) {
                const tours = await toursRes.json();
                if (Array.isArray(tours)) {
                    tourRoutes = tours
                        .filter((tour: any) => Boolean(tour.slug))
                        .map((tour: any) => {
                            const lastmod = parseValidDate(tour.updated_at || tour.created_at, STABLE_RELEASE_DATE);
                            if (lastmod > latestTourDate) latestTourDate = lastmod;
                            return {
                                url: `${BASE_URL}/tours/${tour.slug}`,
                                lastModified: lastmod,
                                changeFrequency: 'weekly' as const,
                                priority: 0.9,
                            };
                        });
                }
            }
        } catch (err) {
            console.warn("Could not fetch tours for sitemap:", err);
        }

        // 2. Dynamic Locations (Explore Ratnapura local SEO)
        let locationRoutes: MetadataRoute.Sitemap = [];
        try {
            const locationsRes = await fetch(`${API_BASE_URL}/locations/`, { next: { revalidate: 86400 } });
            if (locationsRes.ok) {
                const locations = await locationsRes.json();
                if (Array.isArray(locations)) {
                    locationRoutes = locations
                        .filter((loc: any) => Boolean(loc.slug))
                        .map((location: any) => {
                            const lastmod = parseValidDate(location.updated_at || location.created_at, STABLE_RELEASE_DATE);
                            if (lastmod > latestLocationDate) latestLocationDate = lastmod;
                            return {
                                url: `${BASE_URL}/explore-ratnapura/${location.slug}`,
                                lastModified: lastmod,
                                changeFrequency: 'monthly' as const,
                                priority: 0.7,
                            };
                        });
                }
            }
        } catch (err) {
            console.warn("Could not fetch locations for sitemap:", err);
        }

        // 3. Articles (Content Marketing & Organic SEO)
        let articleRoutes: MetadataRoute.Sitemap = [];
        const seenSlugs = new Set<string>();

        try {
            const articlesRes = await fetch(`${API_BASE_URL}/articles`, { next: { revalidate: 3600 } });
            if (articlesRes.ok) {
                const articles = await articlesRes.json();
                if (Array.isArray(articles)) {
                    articles
                        .filter((a: any) => Boolean(a.slug))
                        .forEach((a: any) => {
                            seenSlugs.add(a.slug);
                            const lastmod = parseValidDate(a.updated_at || a.created_at, STABLE_RELEASE_DATE);
                            if (lastmod > latestArticleDate) latestArticleDate = lastmod;
                            articleRoutes.push({
                                url: `${BASE_URL}/articles/${a.slug}`,
                                lastModified: lastmod,
                                changeFrequency: 'weekly' as const,
                                priority: 0.8,
                            });
                        });
                }
            }
        } catch (err) {
            console.warn("Could not fetch remote articles for sitemap, falling back to local list:", err);
        }

        // Ensure built-in pillar articles are always present
        try {
            const { initialArticles } = await import('@/lib/articles-data');
            initialArticles.forEach((art) => {
                if (!seenSlugs.has(art.slug)) {
                    seenSlugs.add(art.slug);
                    articleRoutes.push({
                        url: `${BASE_URL}/articles/${art.slug}`,
                        lastModified: STABLE_RELEASE_DATE,
                        changeFrequency: 'weekly' as const,
                        priority: 0.8,
                    });
                }
            });
        } catch (err) {
            console.warn("Could not load initial articles:", err);
        }

        // 4. Static Core Routes with authentic lastmod
        const maxGlobalDate = [latestTourDate, latestArticleDate, latestLocationDate].sort().pop() || STABLE_RELEASE_DATE;

        const staticRoutes: MetadataRoute.Sitemap = [
            {
                url: `${BASE_URL}/`,
                lastModified: maxGlobalDate,
                changeFrequency: 'daily' as const,
                priority: 1.0,
            },
            {
                url: `${BASE_URL}/tours`,
                lastModified: latestTourDate,
                changeFrequency: 'daily' as const,
                priority: 0.9,
            },
            {
                url: `${BASE_URL}/custom-proposal-package`,
                lastModified: STABLE_RELEASE_DATE,
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            },
            {
                url: `${BASE_URL}/articles`,
                lastModified: latestArticleDate,
                changeFrequency: 'daily' as const,
                priority: 0.8,
            },
            {
                url: `${BASE_URL}/explore-ratnapura`,
                lastModified: latestLocationDate,
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            },
            {
                url: `${BASE_URL}/about`,
                lastModified: STABLE_RELEASE_DATE,
                changeFrequency: 'monthly' as const,
                priority: 0.7,
            },
            {
                url: `${BASE_URL}/virtual-tour`,
                lastModified: STABLE_RELEASE_DATE,
                changeFrequency: 'monthly' as const,
                priority: 0.7,
            },
            {
                url: `${BASE_URL}/booking`,
                lastModified: STABLE_RELEASE_DATE,
                changeFrequency: 'monthly' as const,
                priority: 0.6,
            },
            {
                url: `${BASE_URL}/contact`,
                lastModified: STABLE_RELEASE_DATE,
                changeFrequency: 'monthly' as const,
                priority: 0.6,
            },
        ];

        return [...staticRoutes, ...tourRoutes, ...locationRoutes, ...articleRoutes];

    } catch (error) {
        console.error("Failed to generate dynamic sitemap data:", error);
        return [
            {
                url: `${BASE_URL}/`,
                lastModified: STABLE_RELEASE_DATE,
                changeFrequency: 'daily' as const,
                priority: 1.0,
            },
            {
                url: `${BASE_URL}/tours`,
                lastModified: STABLE_RELEASE_DATE,
                changeFrequency: 'daily' as const,
                priority: 0.9,
            }
        ];
    }
}
