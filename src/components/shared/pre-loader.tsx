'use client';

const GemIcon = () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary animate-gem-pulse"
    >
      <path
        d="M12 2L4.69259 8.24009C4.25268 8.60155 4 9.15548 4 9.73991V14.2601C4 14.8445 4.25268 15.3985 4.69259 15.7599L12 22L19.3074 15.7599C19.7473 15.3985 20 14.8445 20 14.2601V9.73991C20 9.15548 19.7473 8.60155 19.3074 8.24009L12 2Z"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="0.5"
      />
      <path d="M4 9.5L12 15L20 9.5" stroke="hsl(var(--primary-foreground))" strokeOpacity="0.5" strokeWidth="0.5" />
      <path d="M12 22V15" stroke="hsl(var(--primary-foreground))" strokeOpacity="0.5" strokeWidth="0.5" />
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
