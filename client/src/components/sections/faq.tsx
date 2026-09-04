import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqData = [
    {
        question: "What is Sapphire Trail Professional Gem Mining Tour?",
        answer: "The Sapphire Trails Professional Gem Mining Tour offers an extraordinary journey into the heart of Sri Lanka's legendary gem industry, wrapped in the warmth of authentic Sri Lankan hospitality. This premium travel experience seamlessly blends discovery with indulgence, offering exquisite food and beverages, luxurious accommodations, and comfortable transportation."
    },
    {
        question: "Do I need experience to participate?",
        answer: "No experience is required. Our tours are beginner-friendly and guided by knowledgeable staff who will teach you how to identify and clean your finds."
    },
    {
        question: "How long does a tour last?",
        answer: "Most tours last between 06 to 08 hours. Private or extended experiences may be available upon request."
    },
    {
        question: "Who can participate in this tour?",
        answer: "Any local or foreign tourist can participate. However, only visitors in good physical condition can enter the mine."
    },
    {
        question: "How do I make a reservation?",
        answer: "You can make a reservation through our official website www.sapphiretrails.lk. You can also reserve your spot by contacting our Hotline at 0712357700 or 0716381000, or by sending an email to info@sapphiretrails.com."
    },
]

export function Faq() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
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
