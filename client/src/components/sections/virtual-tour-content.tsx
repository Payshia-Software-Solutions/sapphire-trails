
import { CameraOff } from 'lucide-react';

export function VirtualTourContent() {
  return (
    <section className="w-full py-16 md:py-28 bg-background-alt">
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-2xl mx-auto">
            <CameraOff className="h-16 w-16 text-[#0B1E38]/40 dark:text-blue-400/40" />
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1E38] dark:text-blue-400">Coming Soon</h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light">
                We are polishing the gems for our immersive 360-degree virtual tour. Check back soon to step inside a Sri Lankan gem mine from anywhere in the world.
            </p>
        </div>
      </div>
    </section>
  );
}
