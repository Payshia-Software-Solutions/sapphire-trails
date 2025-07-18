
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
  tourType: z.coerce.number({
    required_error: "You need to select a tour type.",
  }),
  guests: z.coerce.number().int().min(1, { message: "Please enter at least 1 guest." }),
  date: z.date({
    required_error: "A date for your tour is required.",
  }),
  message: z.string().optional(),
});


const iconEnum = z.enum(['Leaf', 'Mountain', 'Bird', 'Home', 'Clock', 'CalendarDays', 'Ticket', 'Users', 'AlertTriangle', 'Gem', 'Waves', 'Landmark', 'Camera', 'Tent', 'Thermometer', 'MapPin', 'Award', 'Utensils', 'Star', 'Package', 'Coffee', 'BedDouble']);

// Schema for both Add and Edit
export const locationFormSchema = z.object({
  // Basic info
  title: z.string().min(3, "Title must be at least 3 characters."),
  slug: z.string().min(3, "Slug is required and must be unique (e.g., location-name).").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  cardDescription: z.string().min(10, "Card description must be at least 10 characters."),
  distance: z.string().min(2, "Distance is required."),

  // Hero
  subtitle: z.string().min(3, "Subtitle is required."),
  heroImageHint: z.string().min(2, "Hero image hint is required."),

  // Intro
  introTitle: z.string().min(3, "Intro title is required."),
  introDescription: z.string().min(10, "Intro description is required."),
  introImageHint: z.string().min(2, "Intro image hint is required."),
  
  // These image fields are handled separately for add/edit but need to be in the schema for type consistency
  cardImage: z.string().min(1, "A card image is required."),
  heroImage: z.string().min(1, "A hero image is required."),
  introImageUrl: z.string().min(1, "An intro image is required."),

  // Gallery (4 images)
  galleryImages: z.array(z.object({
    src: z.string().min(1, "An image is required."),
    alt: z.string().min(3, "Alt text is required."),
    hint: z.string().min(2, "Hint is required."),
    // Added optional fields from server response to avoid type errors on `reset`
    image_url: z.string().optional(),
    alt_text: z.string().optional(),
  })).length(4, "Please provide exactly 4 gallery images."),

  // Highlights (4 items)
  highlights: z.array(z.object({
    icon: iconEnum,
    title: z.string().min(3, "Highlight title is required."),
    description: z.string().min(10, "Highlight description is required."),
  })).length(4, "Please provide exactly 4 highlights."),

  // Visitor Info (4 items)
  visitorInfo: z.array(z.object({
    icon: iconEnum,
    title: z.string().min(3, "Visitor info title is required."),
    line1: z.string().min(3, "Line 1 is required."),
    line2: z.string().min(3, "Line 2 is required."),
  })).length(4, "Please provide exactly 4 visitor info items."),

  // Map & Nearby
  mapEmbedUrl: z.string().url("Please enter a valid map embed URL."),
  nearbyAttractions: z.array(z.object({
      icon: iconEnum,
      name: z.string().min(3, "Attraction name is required."),
      distance: z.string().min(2, "Distance is required."),
  })).length(3, "Please provide exactly 3 nearby attractions."),
});


// Admin Schemas
export const adminCreationSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export const adminProfilePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required.' }),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});


// Tour Package Schema
export const tourHighlightSchema = z.object({
  icon: iconEnum,
  title: z.string().min(3, "Highlight title is required."),
  description: z.string().min(10, "Highlight description is required."),
});

export const itineraryItemSchema = z.object({
  time: z.string().min(1, "Time is required."),
  title: z.string().min(3, "Title is required."),
  description: z.string().min(10, "Description is required."),
});

export const packageFormSchema = z.object({
  // Homepage Card
  imageUrl: z.string().min(1, "An image is required for the homepage card."),
  imageAlt: z.string().min(3, "Image alt text is required."),
  imageHint: z.string().min(2, "Image hint is required."),
  homepageTitle: z.string().min(3, "Title is required for homepage card."),
  homepageDescription: z.string().min(10, "Description is required for homepage card."),
  
  // Tour Detail Page
  tourPageTitle: z.string().min(3, "A title for the tour page is required."),
  duration: z.string().min(3, "Duration is required."),
  price: z.string().min(1, "Price is required."),
  priceSuffix: z.string().min(3, "Price suffix is required (e.g., per person)."),
  heroImage: z.string().min(1, "A hero image for the tour page is required."),
  heroImageHint: z.string().min(2, "Hero image hint is required."),
  tourPageDescription: z.string().min(10, "A description for the tour page is required."),
  
  tourHighlights: z.array(tourHighlightSchema).length(3, "You must provide exactly 3 tour highlights."),
  
  inclusions: z.array(z.object({ text: z.string().min(3, 'Inclusion text is required.') })).min(1, "At least one inclusion is required."),

  itinerary: z.array(itineraryItemSchema).min(1, "At least one itinerary item is required."),
  
  bookingLink: z.string().min(1, "Booking link is required.").startsWith("/", { message: "Booking link must be a relative path starting with '/'." }),
});


// CMS Schema
export const cmsFormSchema = z.object({
  hero: z.object({
    headline: z.string().min(1, "Headline is required."),
    subheadline: z.string().min(1, "Sub-headline is required."),
    imageUrl: z.string().min(1, "An image is required."),
    imageAlt: z.string().min(1, "Image alt text is required."),
    imageHint: z.string().min(1, "Image hint is required."),
  }),
  discover: z.object({
    description: z.string().min(1, "Description is required."),
    images: z.array(z.object({
      src: z.string().min(1, "An image is required."),
      alt: z.string().min(1, "Alt text is required."),
      hint: z.string().min(1, "Image hint is required."),
    })).length(3, "You must provide exactly 3 images."),
  }),
  footer: z.object({
    facebookUrl: z.string().url("Please enter a valid URL for Facebook."),
    instagramUrl: z.string().url("Please enter a valid URL for Instagram."),
    youtubeUrl: z.string().url("Please enter a valid URL for YouTube."),
  }),
});
