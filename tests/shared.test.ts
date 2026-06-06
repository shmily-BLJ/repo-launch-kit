import { describe, expect, it } from "vitest";
import { formatLaunchKitMarkdown } from "../src/shared/format";
import { buildLaunchKitPrompt } from "../src/shared/prompt";
import { generateRequestSchema, launchKitSchema, normalizeBaseUrl } from "../src/shared/schema";

describe("shared launch-kit helpers", () => {
  it("normalizes OpenAI-compatible base URLs", () => {
    expect(normalizeBaseUrl("https://api.example.com/v1///")).toBe("https://api.example.com/v1");
  });

  it("requires a model but allows an empty session API key", () => {
    const result = generateRequestSchema.safeParse({
      provider: {
        apiKey: "",
        baseUrl: "https://api.openai.com/v1",
        model: "",
        endpointMode: "chat.completions"
      },
      product: {
        productName: "Demo",
        repoUrl: "",
        oneLiner: "A useful demo for launch teams.",
        targetUser: "Indie developers",
        problem: "Launch copy takes too long to prepare.",
        features: "README, platform posts, Gumroad copy, checklist.",
        pricing: "$9",
        launchDate: "Tomorrow",
        languageMode: "bilingual"
      }
    });

    expect(result.success).toBe(false);
  });

  it("builds a bilingual JSON-only prompt", () => {
    const prompt = buildLaunchKitPrompt({
      productName: "Demo",
      repoUrl: "",
      oneLiner: "A useful demo for launch teams.",
      targetUser: "Indie developers",
      problem: "Launch copy takes too long to prepare.",
      features: "README, platform posts, Gumroad copy, checklist.",
      pricing: "$9",
      launchDate: "Tomorrow",
      languageMode: "bilingual"
    });

    expect(prompt).toContain("Return only valid JSON");
    expect(prompt).toContain("English first, then Chinese");
    expect(prompt).not.toContain("API Key");
  });

  it("formats launch-kit markdown without secrets", () => {
    const kit = launchKitSchema.parse({
      meta: { productName: "Demo", positioning: "Fast launch assets", audience: "Indie devs" },
      githubReadme: "# Demo",
      productHunt: { name: "Demo", tagline: "Launch faster", description: "Useful tool", makerComment: "Built locally." },
      uneed: { title: "Demo", shortDescription: "Launch kit", launchPost: "Try it." },
      gumroad: {
        title: "Demo Kit",
        subtitle: "Launch assets",
        description: "Download the local tool.",
        includedFiles: ["Local app", "Checklist"],
        pricingNote: "$9 early-bird"
      },
      huggingFace: { spaceTitle: "Demo Space", shortIntro: "Preview", readmeBlurb: "Demo blurb" },
      checklist: ["Create GitHub repo", "Publish Gumroad page", "Launch on Uneed", "Launch on Product Hunt", "Check secrets"],
      outreach: { email: "Hello", socialPosts: ["Post 1", "Post 2"] }
    });

    const markdown = formatLaunchKitMarkdown(kit);
    expect(markdown).toContain("# Demo Launch Kit");
    expect(markdown).not.toMatch(/sk-[a-z0-9_-]+/i);
  });
});
