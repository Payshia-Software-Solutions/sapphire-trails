import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper to construct full URL from a relative path
export const getFullImageUrl = (path: string | null | undefined) => {
    if (!path || path.startsWith('http') || path.startsWith('data:')) {
        return path || '';
    }
    const cleanBase = IMAGE_BASE_URL ? IMAGE_BASE_URL.replace(/\/$/, "") : 'https://server-sapphiretrails.payshia.com';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};
