# Buyer Start Here / 买家从这里开始

Thank you for getting Repo Launch Kit.

感谢你获取 Repo Launch Kit。

This is a local-first AI launch tool. It helps you turn a GitHub project or product idea into bilingual launch and sales materials.

这是一个本地优先的 AI 发布工具，可以把 GitHub 项目或产品想法生成中英文发布和售卖材料。

## What Is Included / 下载包包含

- Local web app source code / 本地网页工具源码
- Setup guide / 安装说明
- Example input and output / 示例输入和输出
- AI provider configuration guide / AI 提供商配置说明
- Launch checklist / 发布检查清单
- Platform copy templates / 平台主页文案模板

## What You Need / 你需要准备

- Node.js 20 or newer
- An AI provider API key
- A model that supports OpenAI-compatible Chat Completions

- Node.js 20 或更新版本
- 一个 AI 提供商 API Key
- 一个兼容 OpenAI Chat Completions 接口的模型

## Quick Start / 快速开始

```bash
npm install
cp .env.example .env
npm run build
npm start
```

Open:

```text
http://127.0.0.1:8787
```

If `cp` is not available on Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

## Provider Settings / 提供商设置

In the app, fill:

```text
API Key: your own key
Base URL: https://api.openai.com/v1 or your compatible provider URL
Model: your model name
Endpoint Mode: chat.completions
```

Your API key stays on your own machine. Do not share it with anyone.

你的 API Key 保存在你自己的电脑上，不要发给任何人。

## Common Problems / 常见问题

### Test connection fails / 测试连接失败

Check:

- API Key is correct
- Base URL does not include `/chat/completions`
- Model name is correct
- Provider supports Chat Completions

检查：

- API Key 是否正确
- Base URL 不要写到 `/chat/completions`
- Model 名称是否正确
- 提供商是否支持 Chat Completions

### Generation fails with JSON error / 生成时报 JSON 错误

Try again with a stronger or more instruction-following model. Some compatible providers return extra text around JSON.

换一个更稳定、更遵循指令的模型再试。有些兼容接口会在 JSON 外面额外输出文字。

## Support / 支持

Project page:

```text
https://github.com/shmily-BLJ/repo-launch-kit
```

