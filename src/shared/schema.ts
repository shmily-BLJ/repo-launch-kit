import { z } from "zod";

export const endpointModeSchema = z.enum(["chat.completions"]);

export const providerSchema = z.object({
  apiKey: z.string().trim().optional().default(""),
  baseUrl: z.string().trim().url().default("https://api.openai.com/v1"),
  model: z.string().trim().min(1, "Model is required"),
  endpointMode: endpointModeSchema.default("chat.completions")
});

export const productInputSchema = z.object({
  productName: z.string().trim().min(1).max(80),
  repoUrl: z.string().trim().url().optional().or(z.literal("")),
  oneLiner: z.string().trim().min(8).max(180),
  targetUser: z.string().trim().min(2).max(140),
  problem: z.string().trim().min(8).max(500),
  features: z.string().trim().min(8).max(800),
  pricing: z.string().trim().min(1).max(120),
  launchDate: z.string().trim().min(1).max(40),
  languageMode: z.enum(["bilingual", "english", "chinese"]).default("bilingual")
});

export const generateRequestSchema = z.object({
  provider: providerSchema,
  product: productInputSchema
});

export const launchKitSchema = z.object({
  meta: z.object({
    productName: z.string(),
    positioning: z.string(),
    audience: z.string()
  }),
  githubReadme: z.string(),
  productHunt: z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    makerComment: z.string()
  }),
  uneed: z.object({
    title: z.string(),
    shortDescription: z.string(),
    launchPost: z.string()
  }),
  gumroad: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    includedFiles: z.array(z.string()).min(1),
    pricingNote: z.string()
  }),
  huggingFace: z.object({
    spaceTitle: z.string(),
    shortIntro: z.string(),
    readmeBlurb: z.string()
  }),
  checklist: z.array(z.string()).min(5),
  outreach: z.object({
    email: z.string(),
    socialPosts: z.array(z.string()).min(2)
  })
});

export type ProviderSettings = z.infer<typeof providerSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
export type GenerateRequest = z.infer<typeof generateRequestSchema>;
export type LaunchKit = z.infer<typeof launchKitSchema>;

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, "");
}
