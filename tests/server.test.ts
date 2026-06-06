import request from "supertest";
import { describe, expect, it } from "vitest";
import { app, extractChatContent, extractJson } from "../server/index";

describe("local API", () => {
  it("reads MiMo-style reasoning_content when content is empty", () => {
    const content = extractChatContent({
      choices: [
        {
          message: {
            content: null,
            reasoning_content: "{\"ok\":true}"
          }
        }
      ]
    });

    expect(content).toBe("{\"ok\":true}");
  });

  it("extracts JSON even when the model adds surrounding text", () => {
    const parsed = extractJson('Here is the JSON:\n{"meta":{"productName":"Demo"},"items":["a { brace }"]}\nDone.');

    expect(parsed).toEqual({
      meta: { productName: "Demo" },
      items: ["a { brace }"]
    });
  });

  it("reports provider health without exposing secrets", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(response.body.ok).toBe(true);
    expect(response.body.env).toHaveProperty("hasApiKey");
    expect(response.text).not.toMatch(/sk-[a-z0-9_-]+/i);
  });

  it("classifies a missing API key before calling upstream", async () => {
    const response = await request(app)
      .post("/api/test-connection")
      .send({
        apiKey: "",
        baseUrl: "https://api.openai.com/v1",
        model: "demo-model",
        endpointMode: "chat.completions"
      })
      .expect(400);

    expect(response.body.code).toBe("missing_key");
    expect(response.text).not.toMatch(/Bearer|Authorization/i);
  });

  it("validates product input before generation", async () => {
    const response = await request(app)
      .post("/api/generate")
      .send({
        provider: {
          apiKey: "",
          baseUrl: "https://api.openai.com/v1",
          model: "demo-model",
          endpointMode: "chat.completions"
        },
        product: {
          productName: "",
          oneLiner: "too short"
        }
      })
      .expect(400);

    expect(response.body.code).toBe("invalid_input");
  });
});
