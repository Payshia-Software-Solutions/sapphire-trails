"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TaglineGenerator } from '@/components/shared/tagline-generator';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah L.",
    title: "Marketing Director",
    image: "https://placehold.co/100x100.png",
    imageHint: "woman portrait",
    quote: "Landing Spark transformed our campaign strategy. The ability to quickly generate and test landing pages is a game-changer. Our conversion rates have doubled!"
  },
  {
    name: "Mike T.",
    title: "Startup Founder",
    image: "https://placehold.co/100x100.png",
    imageHint: "man portrait",
    quote: "As a non-technical founder, I was struggling with website development. Landing Spark made it incredibly simple to create a professional-looking site in just an afternoon."
  },
  {
    name: "Jessica P.",
    title: "Freelance Designer",
    image: "https://placehold.co/100x100.png",
    imageHint: "person smiling",
    quote: "The AI suggestions are surprisingly creative and helpful. It's like having a brainstorming partner on demand. I'm building better pages for my clients, faster."
  },
];

export function TestimonialsSection() {
  const [headline, setHeadline] = useState("Trusted by Innovators Worldwide");
  const sectionDescription = "A testimonials section for 'Landing Spark'. It should convey trust, satisfaction, and success stories from users. The tone should be credible and reassuring.";

  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">{headline}</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear what our customers have to say about their success with Landing Spark.
            </p>
          </div>
          <TaglineGenerator 
            sectionDescription={sectionDescription}
            onTaglineSelect={setHeadline}
            currentTagline={headline}
          />
        </div>
        <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-1 md:gap-12 lg:max-w-5xl lg:grid-cols-3 mt-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card shadow-lg">
              <CardHeader className="p-6">
                <Quote className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-muted-foreground italic">&quot;{testimonial.quote}&quot;</p>
                <div className="mt-4 flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.image} alt={testimonial.name} data-ai-hint={testimonial.imageHint} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
