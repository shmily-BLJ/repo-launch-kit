import type { ProductInput } from "./schema.js";

export function buildLaunchKitPrompt(product: ProductInput): string {
  const languageInstruction =
    product.languageMode === "bilingual"
      ? "Write every major section in English first, then Chinese. Keep both languages practical and launch-ready."
      : product.languageMode === "chinese"
        ? "Write the output in clear Simplified Chinese."
        : "Write the output in concise launch-ready English.";

  return [
    "You are a senior indie product launch strategist.",
    "Create a complete launch and sales kit for a local-first developer product.",
    languageInstruction,
    "Return only valid JSON. Do not wrap it in Markdown fences.",
    "The JSON shape must be:",
    JSON.stringify(
      {
        meta: {
          productName: "string",
          positioning: "string",
          audience: "string"
        },
        githubReadme: "string",
        productHunt: {
          name: "string",
          tagline: "string",
          description: "string",
          makerComment: "string"
        },
        uneed: {
          title: "string",
          shortDescription: "string",
          launchPost: "string"
        },
        gumroad: {
          title: "string",
          subtitle: "string",
          description: "string",
          includedFiles: ["string"],
          pricingNote: "string"
        },
        huggingFace: {
          spaceTitle: "string",
          shortIntro: "string",
          readmeBlurb: "string"
        },
        checklist: ["string"],
        outreach: {
          email: "string",
          socialPosts: ["string"]
        }
      },
      null,
      2
    ),
    "Product input:",
    JSON.stringify(product, null, 2),
    "Constraints:",
    "- Product Hunt copy must present a live digital product, not a course, template store, or generic service.",
    "- Gumroad copy must make the paid download concrete.",
    "- Checklist must include GitHub, Hugging Face, Uneed, Product Hunt, Gumroad, and security/privacy checks.",
    "- Avoid hype. Write like a practical maker who wants the first paying customer."
  ].join("\n\n");
}
