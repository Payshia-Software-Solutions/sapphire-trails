'use client';

const GemIcon = () => (
    <svg
      width="80"
      height="80"
      viewBox="-100 -100 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-gem-pulse"
    >
        <g>
            <path d="M 0 -80 L 80 0 L 0 80 L -80 0 Z" fill="#4dd0e1"/>
            <path d="M 0 -80 L -80 0 L -60 -10 L 0 -60 Z" fill="#26c6da"/>
            <path d="M 0 -80 L 80 0 L 60 -10 L 0 -60 Z" fill="#00bcd4"/>
            <path d="M 0 80 L -80 0 L -60 10 L 0 60 Z" fill="#00acc1"/>
            <path d="M 0 80 L 80 0 L 60 10 L 0 60 Z" fill="#0097a7"/>
            <path d="M 0 -60 L 60 -10 L 0 60 L -60 10 Z" fill="#80deea"/>
        </g>
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
