import path from "node:path";
import cors from "cors";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import { z } from "zod";
import { buildLaunchKitPrompt } from "../src/shared/prompt.js";
import {
  generateRequestSchema,
  launchKitSchema,
  normalizeBaseUrl,
  providerSchema,
  type ProviderSettings
} from "../src/shared/schema.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);
const distPath = path.resolve(process.cwd(), "dist");

app.use(cors({ origin: ["http://127.0.0.1:5173", "http://localhost:5173"] }));
app.use(express.json({ limit: "1mb" }));

function resolveProvider(provider: ProviderSettings): ProviderSettings {
  return {
    apiKey: provider.apiKey || process.env.OPENAI_API_KEY || "",
    baseUrl: provider.baseUrl || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    model: provider.model || process.env.OPENAI_MODEL || "",
    endpointMode: provider.endpointMode || "chat.completions"
  };
}

function jsonError(res: Response, status: number, code: string, message: string) {
  return res.status(status).json({ ok: false, code, message });
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const balanced = findBalancedJsonObject(candidate);
    if (balanced) return JSON.parse(balanced);

    const firstBrace = candidate.indexOf("{");
    const lastBrace = candidate.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
    }

    throw new SyntaxError("No parseable JSON object found in model output.");
  }
}

async function callChatCompletions(provider: ProviderSettings, prompt: string, maxTokens = 6000) {
  const resolved = resolveProvider(provider);

  if (!resolved.apiKey) {
    throw new ProviderError("missing_key", "API Key is missing. Add it in the app or in .env.", 400);
  }
  if (!resolved.model) {
    throw new ProviderError("missing_model", "Model is required.", 400);
  }

  const url = `${normalizeBaseUrl(resolved.baseUrl)}/chat/completions`;
  let upstream: globalThis.Response;

  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resolved.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: resolved.model,
        messages: [
          {
            role: "system",
            content:
              "You generate practical launch assets. Return valid JSON when requested. Never include secrets."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        max_tokens: maxTokens
      })
    });
  } catch {
    throw new ProviderError(
      "base_url_unreachable",
      "Base URL could not be reached. Check the address and local network access.",
      502
    );
  }

  if (!upstream.ok) {
    throw await mapProviderError(upstream);
  }

  const data = (await upstream.json()) as ChatCompletionsResponse;
  const content = extractChatContent(data);
  if (typeof content !== "string" || !content.trim()) {
    throw new ProviderError(
      "incompatible_response",
      "The provider responded, but no readable text was found in content, reasoning_content, or final_text_preview.",
      502
    );
  }

  return content;
}

async function mapProviderError(response: globalThis.Response) {
  let detail = "";
  try {
    const body = (await response.json()) as { error?: { message?: unknown } };
    detail = typeof body.error?.message === "string" ? body.error.message : "";
  } catch {
    detail = "";
  }

  if (response.status === 401 || response.status === 403) {
    return new ProviderError("invalid_key", "API Key was rejected by the provider.", 401);
  }
  if (response.status === 404) {
    return new ProviderError(
      "not_found",
      "Base URL or model was not found. Check the provider address and model name.",
      404
    );
  }
  if (response.status === 400) {
    return new ProviderError(
      "bad_request",
      detail || "The provider rejected the request. Check model name and API compatibility.",
      400
    );
  }
  return new ProviderError(
    "provider_error",
    detail || `Provider returned HTTP ${response.status}.`,
    502
  );
}

class ProviderError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
  }
}

type ChatCompletionsResponse = {
  choices?: Array<{
    text?: unknown;
    message?: {
      content?: unknown;
      reasoning_content?: unknown;
      final_text_preview?: unknown;
      final_text?: unknown;
    };
  }>;
  output_text?: unknown;
};

function extractText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          const text = (part as { text?: unknown }).text;
          return typeof text === "string" ? text : "";
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

function extractChatContent(data: ChatCompletionsResponse): string {
  const choice = data.choices?.[0];
  return (
    extractText(choice?.message?.content) ||
    extractText(choice?.message?.final_text) ||
    extractText(choice?.message?.reasoning_content) ||
    extractText(choice?.message?.final_text_preview) ||
    extractText(choice?.text) ||
    extractText(data.output_text)
  );
}

function findBalancedJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }

  return null;
}

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    ok: true,
    env: {
      hasApiKey: Boolean(process.env.OPENAI_API_KEY),
      baseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL || ""
    }
  });
});

app.post("/api/test-connection", async (req: Request, res: Response) => {
  const parsed = providerSchema.safeParse(req.body);
  if (!parsed.success) {
    return jsonError(res, 400, "invalid_provider", z.prettifyError(parsed.error));
  }

  try {
    const content = await callChatCompletions(parsed.data, "Reply with OK only.", 16);
    return res.json({ ok: true, message: content.trim().slice(0, 80) || "OK" });
  } catch (error) {
    if (error instanceof ProviderError) {
      return jsonError(res, error.status, error.code, error.message);
    }
    return jsonError(res, 500, "unknown_error", "Unexpected connection test error.");
  }
});

app.post("/api/generate", async (req: Request, res: Response) => {
  const parsed = generateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return jsonError(res, 400, "invalid_input", z.prettifyError(parsed.error));
  }

  try {
    const content = await callChatCompletions(
      parsed.data.provider,
      buildLaunchKitPrompt(parsed.data.product)
    );
    const kit = launchKitSchema.parse(extractJson(content));
    return res.json({ ok: true, kit });
  } catch (error) {
    if (error instanceof ProviderError) {
      return jsonError(res, error.status, error.code, error.message);
    }
    if (error instanceof SyntaxError || error instanceof z.ZodError) {
      return jsonError(
        res,
        502,
        "invalid_model_json",
        "The model responded, but it did not return the expected launch-kit JSON."
      );
    }
    return jsonError(res, 500, "unknown_error", "Unexpected generation error.");
  }
});

app.use(express.static(distPath));
app.get(/.*/, (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, "index.html"));
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, "127.0.0.1", () => {
    console.log(`Repo Launch Kit server running at http://127.0.0.1:${port}`);
  });
}

export { app, callChatCompletions, extractChatContent, extractJson, ProviderError };
