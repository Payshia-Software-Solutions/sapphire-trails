'use client';

const GemIcon = () => (
    <svg 
        width="80" 
        height="80" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="animate-gem-pulse"
    >
        <path 
            d="M6 4H18L22 10L12 21L2 10L6 4Z" 
            stroke="hsl(var(--primary))" 
            strokeWidth="1.5" 
            strokeLinejoin="round"
        />
        <path 
            d="M2 10L12 21L22 10" 
            stroke="hsl(var(--primary))" 
            strokeWidth="1.5" 
            strokeLinejoin="round"
        />
        <path 
            d="M12 21L8 10H16L12 21Z" 
            stroke="hsl(var(--primary))" 
            strokeWidth="1.5" 
            strokeLinejoin="round"
        />
        <path 
            d="M6 4L12 10L18 4" 
            stroke="hsl(var(--primary))" 
            strokeWidth="1.5" 
            strokeLinejoin="round"
        />
    </svg>
);


export function PreLoader() {
  return (
    <div className="relative flex items-center justify-center">
        <GemIcon />
        <div className="absolute h-32 w-32 rounded-full border-2 border-primary/30 animate-ping" />
    </div>
  );
}
