import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://server-sapphiretrails.payshia.com';
export const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_BASE_URL || 'https://content-provider.payshia.com/sapphire-trail';

// Helper to construct full URL from a relative path with smart CDN/local detection
export const getFullImageUrl = (path: string | null | undefined): string => {
  if (!path || path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path || '';
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If path is on content-provider FTP CDN
  if (cleanPath.startsWith('/location-images') || cleanPath.startsWith('/images') || cleanPath.startsWith('/tours')) {
    const cleanCdn = CDN_BASE_URL.replace(/\/$/, "");
    return `${cleanCdn}${cleanPath}`;
  }

  // Otherwise route through API Base URL
  const cleanBase = API_BASE_URL ? API_BASE_URL.replace(/\/$/, "") : 'https://server-sapphiretrails.payshia.com';
  return `${cleanBase}${cleanPath}`;
};