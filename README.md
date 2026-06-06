# Repo Launch Kit

A local-first AI launch workbench that turns a GitHub repo or product idea into bilingual launch and sales copy.

Repo Launch Kit helps indie developers, AI tool builders, and first-time product sellers prepare the materials they need for GitHub, Product Hunt, Uneed, Gumroad, Hugging Face, email, and social posts.

## Download / Support

- GitHub repo: https://github.com/shmily-BLJ/repo-launch-kit
- Download package: coming soon.
- Support the project: coming soon.

## What It Generates

- GitHub README draft
- Product Hunt launch copy
- Uneed launch copy
- Gumroad product page copy
- Hugging Face demo description
- Launch checklist
- Outreach email
- Social media posts
- Markdown export
- ZIP export

## Why Local-First

Your API key stays on your own machine.

The app runs with a local Node API server. It does not upload your API key to a hosted service, does not store the key in browser localStorage, and does not include the key in exported files.

## AI Provider Support

Repo Launch Kit uses OpenAI-compatible Chat Completions by default:

```text
{Base URL}/chat/completions
```

You can use providers that support the OpenAI-style `/chat/completions` endpoint, such as OpenAI-compatible gateways, local model services, and other compatible API providers.

Provider fields:

```text
API Key
Base URL
Model
Endpoint Mode: chat.completions
```

Example:

```text
Base URL: https://api.openai.com/v1
Model: gpt-4o-mini
Endpoint Mode: chat.completions
```

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

For the built production version:

```bash
npm run build
npm start
```

Open:

```text
http://127.0.0.1:8787
```

## Configuration

You can configure the provider in either place:

- In `.env`, using `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `OPENAI_MODEL`.
- In the web app, for the current session.

Do not commit your real `.env` file.

## Example Product Input

```text
Product name: Repo Launch Kit
GitHub repo: https://github.com/shmily-BLJ/repo-launch-kit
One-liner: A local AI tool that turns a GitHub project into bilingual launch and sales copy.
Target users: Indie developers, AI tool builders, and first-time product sellers.
Price: 19 RMB / $9 early bird
Language: Bilingual
```

## Included Files

The downloadable package includes:

- Local app source code
- Setup guide
- Example input
- Example output
- Bilingual launch checklist
- AI provider configuration guide

## Tests

```bash
npm test
npm run build
```

## Roadmap

- Cleaner provider presets
- Better JSON repair for less strict models
- Product page templates for MBD, Afdian, Ko-fi, Gumroad, and Lemon Squeezy
- Generated cover images for launch platforms
- More export formats

## Chinese Summary

Repo Launch Kit / Repo 发布工具包是一个本地运行的 AI 发布工具。

它可以把一个 GitHub 项目或产品想法生成中英双语发布材料，包括 GitHub README、Product Hunt 文案、Uneed 文案、Gumroad 商品页、Hugging Face 简介、发布清单和推广文案。

适合：

- 独立开发者
- AI 工具制作者
- 第一次卖数字产品的人
- 想把 GitHub 项目包装成产品页的人

注意：

- 需要你自己准备兼容 OpenAI 接口的 API Key。
- 下载包不包含任何 API Key。
- 工具在本地运行。
