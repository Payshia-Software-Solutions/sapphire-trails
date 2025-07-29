

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
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  tourType: z.coerce.number({
    required_error: "You need to select a tour type.",
  }),
  adults: z.coerce.number().int().min(1, { message: "At least one adult is required." }),
  children: z.coerce.number().int().min(0, { message: "Children must be 0 or more."}),
  date: z.date({
    required_error: "A date for your tour is required.",
  }),
  message: z.string().optional(),
}).refine(data => data.adults + data.children > 0, {
  message: "There must be at least one participant.",
  path: ["adults"],
});


const iconEnum = z.enum(['Leaf', 'Mountain', 'Bird', 'Home', 'Clock', 'CalendarDays', 'Ticket', 'Users', 'AlertTriangle', 'Gem', 'Waves', 'Landmark', 'Camera', 'Tent', 'Thermometer', 'MapPin', 'Award', 'Utensils', 'Star', 'Package', 'Coffee', 'BedDouble']);

// Schema for both Add and Edit
export const locationFormSchema = z.object({
  // Basic info
  title: z.string().min(3, "Title must be at least 3 characters."),
  slug: z.string().min(3, "Slug is required and must be unique (e.g., location-name).").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  category: z.enum(['nature', 'agriculture', 'cultural'], {
    required_error: "You need to select a location category.",
  }),
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
  cardImageHint: z.string().min(2, "A card image hint is required."),
  heroImage: z.string().min(1, "A hero image is required."),
  introImageUrl: z.string().min(1, "An intro image is required."),

  // Gallery (dynamic length)
  galleryImages: z.array(z.object({
    id: z.number().optional(), // Include id for existing images
    src: z.string().min(1, "An image is required."),
    alt: z.string().min(3, "Alt text is required."),
    hint: z.string().min(2, "Hint is required."),
    file: z.instanceof(File).optional(),
    isNew: z.boolean().optional(),
  })).min(1, "Please provide at least 1 gallery image."),

  // Highlights (dynamic length)
  highlights: z.array(z.object({
    icon: iconEnum,
    title: z.string().min(3, "Highlight title is required."),
    description: z.string().min(10, "Highlight description is required."),
  })).min(1, "Please provide at least 1 highlight."),

  // Visitor Info (dynamic length)
  visitorInfo: z.array(z.object({
    icon: iconEnum,
    title: z.string().min(3, "Visitor info title is required."),
    line1: z.string().min(3, "Line 1 is required."),
    line2: z.string().min(3, "Line 2 is required."),
  })).min(1, "Please provide at least 1 visitor info item."),

  // Map & Nearby
  mapEmbedUrl: z.string().url("Please enter a valid map embed URL."),
  nearbyAttractions: z.array(z.object({
      icon: iconEnum,
      name: z.string().min(3, "Attraction name is required."),
      distance: z.string().min(2, "Distance is required."),
  })).min(1, "Please provide at least 1 nearby attraction."),
});


// Admin Schemas
export const adminCreationSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export const userEditSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().optional(),
  type: z.enum(['client', 'admin'], { required_error: 'User type is required.' }),
  password: z.string().min(6, { message: 'New password must be at least 6 characters.' }).optional().or(z.literal('')),
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

export const galleryImageSchema = z.object({
    id: z.number().optional(),
    src: z.string().min(1, "An image is required."),
    alt: z.string().min(3, "Alt text is required."),
    hint: z.string().min(2, "Hint is required."),
    file: z.instanceof(File).optional(),
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

  experienceGallery: z.array(galleryImageSchema).min(1, "At least one gallery image is required.").max(8, "You can upload a maximum of 8 gallery images."),
  
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
  general: z.object({
    whatsappNumber: z.string().min(10, "Please enter a valid phone number with country code.").regex(/^\d+$/, "Phone number can only contain digits."),
  }),
});
