import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const natureAndWildlife = [
  {
    title: "Sinharaja Rainforest",
    distance: "12 km away",
    description: "UNESCO World Heritage Site with rich biodiversity, lush trails, and exotic wildlife.",
    image: "https://placehold.co/600x400.png",
    hint: "rainforest canopy",
  },
  {
    title: "Bopath Ella Falls",
    distance: "8 km away",
    description: "Iconic waterfall famed for its shape, surrounded by lush forest and local eateries.",
    image: "https://placehold.co/600x400.png",
    hint: "waterfall jungle",
  },
  {
    title: "Udawalawe National Park",
    distance: "40 km away",
    description: "Elephant watching, jeep safaris, and diverse fauna in a vast, scenic landscape.",
    image: "https://placehold.co/600x400.png",
    hint: "elephants safari",
  },
  {
    title: "Kalthota Doowili Ella",
    distance: "27 km away",
    description: "Secluded waterfall, pristine waters and a tranquil atmosphere for nature lovers.",
    image: "https://placehold.co/600x400.png",
    hint: "waterfall rocks",
  },
];

const LocationCard = ({ location }: { location: typeof natureAndWildlife[0] }) => (
  <Card className="bg-transparent border-0 shadow-none flex flex-col">
    <div className="overflow-hidden rounded-lg">
      <Image
        src={location.image}
        alt={location.title}
        data-ai-hint={location.hint}
        width={600}
        height={400}
        className="object-cover w-full h-auto transition-transform duration-300 hover:scale-105"
      />
    </div>
    <CardContent className="p-4 flex flex-col flex-grow bg-transparent text-left">
      <h3 className="text-xl font-headline font-bold text-primary">{location.title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-2">{location.distance}</p>
      <p className="text-sm text-muted-foreground flex-grow">{location.description}</p>
    </CardContent>
  </Card>
);

export function ExploreRatnapuraContent() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <Tabs defaultValue="nature" className="w-full">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 bg-transparent p-0">
            <TabsTrigger value="nature" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2">Nature & Wildlife</TabsTrigger>
            <TabsTrigger value="agriculture" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2">Agricultural & Energy</TabsTrigger>
            <TabsTrigger value="cultural" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2">Cultural & Religious</TabsTrigger>
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
