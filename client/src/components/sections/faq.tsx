import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqData = [
    {
        question: "What is the Sapphire Trails Sri Lankan Gem Mining Tour?",
        answer: "The Sapphire Trails Professional Gem Mining Tour offers an extraordinary journey into the heart of Sri Lanka's legendary gem industry in Ratnapura (Rathnapura), wrapped in the warmth of authentic Sri Lankan hospitality. This premium travel experience seamlessly blends active pit discovery with luxury service, offering exquisite dining, private transfers, and certified gemologist guidance."
    },
    {
        question: "Where do the gem mine tours take place?",
        answer: "Our tours are hosted in Ratnapura (also spelled Rathnapura), known globally as the 'City of Gems'. We visit active government-licensed mining shafts, riverside illam washing pits, and the vibrant morning street gem market in the Sabaragamuwa basin."
    },
    {
        question: "Do I need prior experience to participate in a gem mining tour?",
        answer: "No experience is required. Our gem tours are beginner-friendly and guided step-by-step by master miners and licensed gemologists who teach you how to identify, wash, and inspect rough Ceylon sapphires and minerals."
    },
    {
        question: "How long does a typical gem mine tour last?",
        answer: "Most full-day gem tours last between 6 to 8 hours. Customized multi-day Sri Lankan gem expeditions and proposal packages are also available upon request."
    },
    {
        question: "Who can participate in this tour?",
        answer: "Our gem tours are family-friendly and open to both international travelers and locals. Guests of all ages can enjoy the river washing and street gem market, while entering the underground mine shafts requires basic physical mobility."
    },
    {
        question: "How do I make a reservation?",
        answer: "You can reserve your tour directly on our official website at sapphiretrails.lk, contact our concierge hotline at +94 76 375 6688, or message us via WhatsApp for instant confirmation."
    },
]

export function Faq() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-wide text-center mb-10 text-foreground">
                        Frequently Asked Questions
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                        {faqData.map((item, index) => (
                             <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/80">
                                <AccordionTrigger className="text-base sm:text-lg font-serif font-medium hover:no-underline text-left text-foreground hover:text-primary transition-colors">
                                    {item.question}
                                </AccordionTrigger>
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
