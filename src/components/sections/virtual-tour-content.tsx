
import { CameraOff } from 'lucide-react';

export function VirtualTourContent() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto">
            <CameraOff className="h-24 w-24 text-primary/50" />
            <h2 className="text-4xl font-headline font-bold text-primary">Coming Soon</h2>
            <p className="text-muted-foreground md:text-xl">
                We are polishing the gems for our immersive 360-degree virtual tour. Check back soon to step inside a Sri Lankan gem mine from anywhere in the world.
            </p>
        </div>
      </div>
    </section>
  );
}
