import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { natureAndWildlife } from "@/lib/locations-data";


const LocationCard = ({ location }: { location: typeof natureAndWildlife[0] }) => (
  <Link href={`/explore-ratnapura/${location.slug}`} className="group block h-full">
    <Card className="bg-transparent border-0 shadow-none flex flex-col h-full">
      <div className="overflow-hidden rounded-lg">
        <Image
          src={location.cardImage}
          alt={location.title}
          data-ai-hint={location.imageHint}
          width={600}
          height={400}
          className="object-cover w-full h-auto aspect-[3/2] transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <CardContent className="p-4 flex flex-col flex-grow bg-transparent text-left">
        <h3 className="text-xl font-headline font-bold text-primary">{location.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-2">{location.distance}</p>
        <p className="text-sm text-muted-foreground">{location.cardDescription}</p>
      </CardContent>
    </Card>
  </Link>
);

export function ExploreRatnapuraContent() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <Tabs defaultValue="nature" className="w-full">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 bg-transparent p-0">
            <TabsTrigger value="nature" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2">
              <span className="hidden sm:inline">Nature & Wildlife</span>
              <span className="sm:hidden">Nature</span>
            </TabsTrigger>
            <TabsTrigger value="agriculture" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2">
              <span className="hidden sm:inline">Agricultural & Energy</span>
              <span className="sm:hidden">Agriculture</span>
            </TabsTrigger>
            <TabsTrigger value="cultural" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2">
              <span className="hidden sm:inline">Cultural & Religious</span>
              <span className="sm:hidden">Cultural</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="nature" className="mt-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {natureAndWildlife.map((location) => (
                <LocationCard key={location.title} location={location} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="agriculture" className="mt-12 text-center py-16">
             <p className="text-muted-foreground">Content for Agricultural & Energy coming soon.</p>
          </TabsContent>
          <TabsContent value="cultural" className="mt-12 text-center py-16">
            <p className="text-muted-foreground">Content for Cultural & Religious coming soon.</p>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
