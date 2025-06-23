import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqData = [
    {
        question: "What should I bring for the mine tour?",
        answer: "We recommend comfortable clothing, closed-toe shoes, sunscreen, a hat, and a reusable water bottle. Safety gear such as helmets will be provided. Don't forget your camera to capture the moments!"
    },
    {
        question: "Is the tour suitable for children?",
        answer: "Yes, our tours are family-friendly. However, due to the nature of the gem mines, there may be some areas with restricted access for young children. Please contact us for specific details and to discuss arrangements for your family."
    }
]

export function Faq() {
    return (
        <section className="w-full pb-12 md:pb-24 lg:pb-32 bg-background-alt">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-headline font-bold text-center mb-8 text-primary">Frequently Asked Question (FAQ)</h2>
                    <Accordion type="single" collapsible className="w-full">
                        {faqData.map((item, index) => (
                             <AccordionItem key={index} value={`item-${index}`} className="border-b-white/10">
                                <AccordionTrigger className="text-lg hover:no-underline text-left">{item.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground pt-2">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    )
}
