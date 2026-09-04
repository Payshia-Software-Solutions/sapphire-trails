"use server";

import { generateTaglines } from "@/ai/flows/generate-taglines";

export async function generateTaglinesAction(sectionDescription: string) {
  try {
    const result = await generateTaglines({ sectionDescription });
    return { success: true, taglines: result.taglines };
  } catch (error) {
    console.error("Error generating taglines:", error);
    return { success: false, error: "Failed to generate taglines. Please try again." };
  }
}
