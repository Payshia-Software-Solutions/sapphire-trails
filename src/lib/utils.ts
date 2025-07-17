import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const IMAGE_BASE_URL = 'https://content-provider.payshia.com/sapphire-trail';

// Helper to construct full URL from a relative path
export const getFullImageUrl = (path: string | null | undefined) => {
    if (!path || path.startsWith('http') || path.startsWith('data:')) {
        return path || '';
    }
    const cleanBase = IMAGE_BASE_URL.replace(/\/$/, "");
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};
