import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

export const bookingFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  tourType: z.enum(['gem-explorer-day-tour', 'sapphire-trails-deluxe'], {
    required_error: "You need to select a tour type.",
  }),
  guests: z.coerce.number().int().min(1, { message: "Please enter at least 1 guest." }),
  date: z.date({
    required_error: "A date for your tour is required.",
  }),
  message: z.string().optional(),
});
