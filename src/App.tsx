import { useEffect, useMemo, useState, type FormEvent } from "react";
import JSZip from "jszip";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Download,
  FileDown,
  KeyRound,
  Loader2,
  PlugZap,
  Rocket,
  ShieldCheck,
  Sparkles,
  TestTube2
} from "lucide-react";
import { formatLaunchKitMarkdown } from "./shared/format";
import type { LaunchKit, ProductInput, ProviderSettings } from "./shared/schema";

type ApiState = "idle" | "loading" | "success" | "error";

const sampleProduct: ProductInput = {
  productName: "Repo Launch Kit",
  repoUrl: "https://github.com/you/repo-launch-kit",
  oneLiner: "Turn a repo into bilingual launch and sales assets.",
  targetUser: "Indie hackers, AI builders, and developers preparing a first paid launch.",
  problem: "Makers can build a useful repo but often get stuck writing launch copy, sales pages, and platform-specific posts.",
  features:
    "Bilingual launch copy, GitHub README draft, Product Hunt and Uneed posts, Gumroad page copy, Hugging Face demo blurb, exportable checklist.",
  pricing: "$9 early-bird, then $19",
  launchDate: "Next Friday",
  languageMode: "bilingual"
};

const initialProvider: ProviderSettings = {
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  model: "",
  endpointMode: "chat.completions"
};

const outputTabs = [
  { id: "overview", label: "总览" },
  { id: "github", label: "GitHub" },
  { id: "ph", label: "Product Hunt" },
  { id: "uneed", label: "Uneed" },
  { id: "gumroad", label: "Gumroad" },
  { id: "hf", label: "Hugging Face" },
  { id: "checklist", label: "清单" },
  { id: "outreach", label: "推广" }
] as const;

type OutputTab = (typeof outputTabs)[number]["id"];

function App() {
  const [provider, setProvider] = useState<ProviderSettings>(initialProvider);
  const [product, setProduct] = useState<ProductInput>(sampleProduct);
  const [kit, setKit] = useState<LaunchKit | null>(null);
  const [activeTab, setActiveTab] = useState<OutputTab>("overview");
  const [connectionState, setConnectionState] = useState<ApiState>("idle");
  const [generateState, setGenerateState] = useState<ApiState>("idle");
  const [message, setMessage] = useState("");
  const [health, setHealth] = useState<{ hasApiKey: boolean; baseUrl: string; model: string } | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setHealth(data.env);
          setProvider((current) => ({
            ...current,
            baseUrl: data.env.baseUrl || current.baseUrl,
            model: data.env.model || current.model
          }));
        }
      })
      .catch(() => undefined);
  }, []);

  const markdown = useMemo(() => (kit ? formatLaunchKitMarkdown(kit) : ""), [kit]);

  function updateProvider<K extends keyof ProviderSettings>(key: K, value: ProviderSettings[K]) {
    setProvider((current) => ({ ...current, [key]: value }));
  }

  function updateProduct<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setProduct((current) => ({ ...current, [key]: value }));
  }

  async function testConnection() {
    if (!provider.model.trim()) {
      setConnectionState("error");
      setMessage("请先填写 Model，例如 gpt-4o-mini、deepseek-chat。");
      return;
    }
    if (!provider.apiKey.trim() && !health?.hasApiKey) {
      setConnectionState("error");
      setMessage("请先填写 API Key，或者在本地 .env 里配置 OPENAI_API_KEY。");
      return;
    }

    setConnectionState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(provider)
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "连接失败");
      }
      setConnectionState("success");
      setMessage(`连接成功：${data.message}`);
    } catch (error) {
      setConnectionState("error");
      setMessage(error instanceof Error ? toFriendlyError(error.message) : "连接失败");
    }
  }

  async function generateLaunchKit(event: FormEvent) {
    event.preventDefault();
    setGenerateState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, product })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "生成失败");
      }
      setKit(data.kit);
      setActiveTab("overview");
      setGenerateState("success");
      setMessage("发布包已生成。");
    } catch (error) {
      setGenerateState("error");
      setMessage(error instanceof Error ? toFriendlyError(error.message) : "生成失败");
    }
  }

  async function copyMarkdown() {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    setMessage("已复制 Markdown。");
  }

  function downloadMarkdown() {
    if (!markdown) return;
    downloadBlob(`${slugify(kit?.meta.productName || "launch-kit")}.md`, markdown, "text/markdown;charset=utf-8");
  }

  async function downloadZip() {
    if (!kit) return;
    const zip = new JSZip();
    zip.file("launch-kit.md", markdown);
    zip.file("github-readme.md", kit.githubReadme);
    zip.file("product-hunt.md", formatProductHunt(kit));
    zip.file("uneed.md", formatUneed(kit));
    zip.file("gumroad.md", formatGumroad(kit));
    zip.file("hugging-face.md", formatHuggingFace(kit));
    zip.file("checklist.md", kit.checklist.map((item) => `- [ ] ${item}`).join("\n"));
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(`${slugify(kit.meta.productName)}-launch-kit.zip`, blob, "application/zip");
  }

  return (
    <div className="app-shell notranslate" translate="no">
      <header className="topbar">
        <div>
          <p className="eyebrow">LOCAL-FIRST LAUNCH WORKBENCH</p>
          <h1>Repo 发布工具包</h1>
        </div>
        <div className="status-strip">
          <span className={health?.hasApiKey ? "status-dot ok" : "status-dot"} />
          <span>{health?.hasApiKey ? ".env 已配置 Key" : "使用会话 Key 或 .env"}</span>
        </div>
      </header>

      <main className="workspace-grid">
        <form className="input-rail" onSubmit={generateLaunchKit}>
          <section className="panel provider-panel">
            <div className="panel-heading">
              <KeyRound aria-hidden="true" />
              <h2>AI 提供商</h2>
            </div>
            <label>
              API Key
              <input
                type="password"
                autoComplete="off"
                placeholder={health?.hasApiKey ? "留空则使用 .env" : "sk-..."}
                value={provider.apiKey}
                onChange={(event) => updateProvider("apiKey", event.target.value)}
              />
            </label>
            <label>
              Base URL
              <input
                value={provider.baseUrl}
                onChange={(event) => updateProvider("baseUrl", event.target.value)}
                placeholder="https://api.openai.com/v1"
              />
            </label>
            <div className="split-row">
              <label>
                Model
                <input
                  value={provider.model}
                  onChange={(event) => updateProvider("model", event.target.value)}
                  placeholder="gpt-4o-mini / deepseek-chat"
                />
              </label>
              <label>
                Endpoint
                <select
                  value={provider.endpointMode}
                  onChange={(event) => updateProvider("endpointMode", event.target.value as ProviderSettings["endpointMode"])}
                >
                  <option value="chat.completions">chat.completions</option>
                </select>
              </label>
            </div>
            <button className="secondary-action" type="button" onClick={testConnection} disabled={connectionState === "loading"}>
              {connectionState === "loading" ? <Loader2 className="spin" /> : <TestTube2 />}
              测试连接
            </button>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <Rocket aria-hidden="true" />
              <h2>产品信息</h2>
            </div>
            <label>
              产品名
              <input value={product.productName} onChange={(event) => updateProduct("productName", event.target.value)} />
            </label>
            <label>
              GitHub 仓库
              <input value={product.repoUrl} onChange={(event) => updateProduct("repoUrl", event.target.value)} />
            </label>
            <label>
              一句话介绍
              <input value={product.oneLiner} onChange={(event) => updateProduct("oneLiner", event.target.value)} />
            </label>
            <label>
              目标用户
              <input value={product.targetUser} onChange={(event) => updateProduct("targetUser", event.target.value)} />
            </label>
            <label>
              解决的问题
              <textarea value={product.problem} onChange={(event) => updateProduct("problem", event.target.value)} rows={3} />
            </label>
            <label>
              核心功能
              <textarea value={product.features} onChange={(event) => updateProduct("features", event.target.value)} rows={4} />
            </label>
            <div className="split-row">
              <label>
                价格
                <input value={product.pricing} onChange={(event) => updateProduct("pricing", event.target.value)} />
              </label>
              <label>
                发布日期
                <input value={product.launchDate} onChange={(event) => updateProduct("launchDate", event.target.value)} />
              </label>
            </div>
            <label>
              语言
              <select
                value={product.languageMode}
                onChange={(event) => updateProduct("languageMode", event.target.value as ProductInput["languageMode"])}
              >
                <option value="bilingual">中英双语</option>
                <option value="english">英文</option>
                <option value="chinese">中文</option>
              </select>
            </label>
            <button className="primary-action" type="submit" disabled={generateState === "loading"}>
              {generateState === "loading" ? <Loader2 className="spin" /> : <Sparkles />}
              生成发布包
            </button>
          </section>
        </form>

        <section className="output-stage">
          <div className="output-toolbar">
            <div className="tab-list" role="tablist" aria-label="输出内容">
              {outputTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={activeTab === tab.id ? "tab active" : "tab"}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="export-actions">
              <button type="button" onClick={copyMarkdown} disabled={!kit} title="复制 Markdown">
                <Clipboard />
              </button>
              <button type="button" onClick={downloadMarkdown} disabled={!kit} title="下载 Markdown">
                <FileDown />
              </button>
              <button type="button" onClick={downloadZip} disabled={!kit} title="下载 ZIP">
                <Download />
              </button>
            </div>
          </div>

          <div className="message-line" aria-live="polite">
            {message ? (
              <>
                {connectionState === "error" || generateState === "error" ? <AlertTriangle /> : <CheckCircle2 />}
                <span>{message}</span>
              </>
            ) : (
              <>
                <ShieldCheck />
                <span>密钥只用于本地请求，不写入导出文件。</span>
              </>
            )}
          </div>

          <article className="output-panel">
            {kit ? <OutputContent kit={kit} tab={activeTab} /> : <EmptyOutput />}
          </article>
        </section>
      </main>

      <a className="deerflow-signature" href="https://deerflow.tech" target="_blank" rel="noreferrer">
        Created By Deerflow
      </a>
    </div>
  );
}

function EmptyOutput() {
  return (
    <div className="empty-output">
      <PlugZap />
      <h2>等待生成</h2>
      <p>填写提供商和产品信息后，这里会出现可复制、可导出的发布材料。</p>
    </div>
  );
}

function OutputContent({ kit, tab }: { kit: LaunchKit; tab: OutputTab }) {
  if (tab === "overview") {
    return (
      <div className="output-copy">
        <h2>{kit.meta.productName}</h2>
        <p>{kit.meta.positioning}</p>
        <p>{kit.meta.audience}</p>
      </div>
    );
  }
  if (tab === "github") return <MarkdownBlock text={kit.githubReadme} />;
  if (tab === "ph") return <MarkdownBlock text={formatProductHunt(kit)} />;
  if (tab === "uneed") return <MarkdownBlock text={formatUneed(kit)} />;
  if (tab === "gumroad") return <MarkdownBlock text={formatGumroad(kit)} />;
  if (tab === "hf") return <MarkdownBlock text={formatHuggingFace(kit)} />;
  if (tab === "checklist") return <MarkdownBlock text={kit.checklist.map((item) => `- [ ] ${item}`).join("\n")} />;
  return (
    <MarkdownBlock
      text={[kit.outreach.email, "", ...kit.outreach.socialPosts.map((post, index) => `### Post ${index + 1}\n${post}`)].join("\n")}
    />
  );
}

function MarkdownBlock({ text }: { text: string }) {
  return <pre className="markdown-block">{text}</pre>;
}

function formatProductHunt(kit: LaunchKit) {
  return [
    `# ${kit.productHunt.name}`,
    "",
    `Tagline: ${kit.productHunt.tagline}`,
    "",
    kit.productHunt.description,
    "",
    "## Maker Comment",
    kit.productHunt.makerComment
  ].join("\n");
}

function formatUneed(kit: LaunchKit) {
  return [`# ${kit.uneed.title}`, "", kit.uneed.shortDescription, "", kit.uneed.launchPost].join("\n");
}

function formatGumroad(kit: LaunchKit) {
  return [
    `# ${kit.gumroad.title}`,
    "",
    kit.gumroad.subtitle,
    "",
    kit.gumroad.description,
    "",
    "## Included",
    ...kit.gumroad.includedFiles.map((item) => `- ${item}`),
    "",
    kit.gumroad.pricingNote
  ].join("\n");
}

function formatHuggingFace(kit: LaunchKit) {
  return [`# ${kit.huggingFace.spaceTitle}`, "", kit.huggingFace.shortIntro, "", kit.huggingFace.readmeBlurb].join("\n");
}

function downloadBlob(filename: string, content: string | Blob, type: string) {
  const blob = typeof content === "string" ? new Blob([content], { type }) : content;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "launch-kit";
}

function toFriendlyError(message: string) {
  if (/param(?:eter)?\s+incorrect/i.test(message) || /invalid\s+param/i.test(message)) {
    return "服务商返回 Param Incorrect：请求参数不对。优先检查 Base URL 是否是兼容 OpenAI 的 /v1 地址、Model 是否写对、这个模型是否支持 chat.completions。";
  }
  if (message.includes("API Key is missing") || message.includes("missing_key")) {
    return "缺少 API Key。请填写 API Key，或者在 .env 里配置 OPENAI_API_KEY。";
  }
  if (message.includes("Model is required")) {
    return "缺少模型名。请填写 Model，例如 gpt-4o-mini、deepseek-chat。";
  }
  if (message.includes("Base URL")) {
    return "Base URL 无法连接或不兼容，请检查接口地址是否以 /v1 结尾。";
  }
  if (message.includes("API Key was rejected")) {
    return "API Key 被服务商拒绝，请检查 Key 是否正确、是否有余额或权限。";
  }
  return message;
}

export default App;
