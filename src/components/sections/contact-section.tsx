"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { contactFormSchema } from "@/lib/schemas"
import { Card, CardContent } from "@/components/ui/card"

export function ContactSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  function onSubmit(data: z.infer<typeof contactFormSchema>) {
    console.log(data);
    setIsSubmitted(true);
    form.reset();
  }

  return (
    <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-background-alt">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">Get in Touch</h2>
          <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
            Have a question or want to book your tour? Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>
        <div className="mx-auto mt-12 max-w-xl">
          {isSubmitted ? (
             <div className="text-center rounded-lg border bg-card text-card-foreground shadow-sm p-12">
                <h3 className="text-2xl font-bold text-primary">Thank You!</h3>
                <p className="text-muted-foreground mt-4">Your message has been sent successfully. We will contact you shortly.</p>
             </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us how we can help"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Send Message</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
