# AI Provider Configuration Guide / AI 提供商配置说明

Repo Launch Kit uses OpenAI-compatible Chat Completions by default.

Repo Launch Kit 默认使用兼容 OpenAI 的 Chat Completions 接口。

## Default Request Path / 默认请求路径

```text
{Base URL}/chat/completions
```

Only enter the base URL in the app. Do not add `/chat/completions` yourself.

在工具里只填写 Base URL，不要自己加 `/chat/completions`。

## Fields / 字段

```text
API Key: your provider key
Base URL: provider base URL
Model: model name
Endpoint Mode: chat.completions
```

## OpenAI Example / OpenAI 示例

```text
Base URL: https://api.openai.com/v1
Model: gpt-4o-mini
Endpoint Mode: chat.completions
```

## OpenAI-Compatible Provider Example / 兼容接口示例

```text
Base URL: https://your-provider.example.com/v1
Model: your-model-name
Endpoint Mode: chat.completions
```

## Local Model Service Example / 本地模型服务示例

```text
Base URL: http://127.0.0.1:11434/v1
Model: your-local-model
Endpoint Mode: chat.completions
```

## Security Notes / 安全说明

- Do not paste your API key into public chats.
- Do not commit `.env`.
- Do not upload screenshots that show your API key.
- Do not include API keys in exported launch packages.

- 不要把 API Key 发到公开聊天里。
- 不要提交 `.env`。
- 不要上传显示 API Key 的截图。
- 不要把 API Key 放进导出的发布包。

## Troubleshooting / 排错

### Key Error / Key 错误

The provider rejects the API key. Create a new key or check whether the key has expired.

提供商拒绝 API Key。请重新生成 Key，或检查 Key 是否过期。

### Base URL Error / Base URL 错误

Make sure the Base URL is reachable and does not include `/chat/completions`.

确认 Base URL 可以访问，并且不要包含 `/chat/completions`。

### Model Not Found / 模型不存在

Check the exact model name in your provider dashboard.

到提供商后台确认准确模型名。

### Incompatible Output / 接口不兼容

Some providers say they are OpenAI-compatible but return a different response shape. Try another endpoint, another model, or another provider.

有些提供商声称兼容 OpenAI，但返回格式不同。可以换 endpoint、换模型或换提供商。

