import OpenAI from "openai";
import type {
  RepoInfo,
  Language,
  Contributor,
  CommitInfo,
  RepoExtras,
  HealthScore,
  AIScoreResult,
} from "@/types";

type ProviderConfig = {
  apiKeyEnv: string;
  defaultModel: string;
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
};

const DEFAULT_TIMEOUT = 30000;

const PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    apiKeyEnv: "OPENAI_API_KEY",
    defaultModel: "gpt-4o-mini",
  },
  anthropic: {
    apiKeyEnv: "ANTHROPIC_API_KEY",
    defaultModel: "claude-sonnet-4-20250514",
    baseURL: "https://api.anthropic.com/v1",
    headers: { "anthropic-version": "2023-06-01" },
  },
  deepseek: {
    apiKeyEnv: "DEEPSEEK_API_KEY",
    defaultModel: "deepseek-chat",
    baseURL: "https://api.deepseek.com",
  },
  qwen: {
    apiKeyEnv: "QWEN_API_KEY",
    defaultModel: "qwen-plus",
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  },
  glm: {
    apiKeyEnv: "GLM_API_KEY",
    defaultModel: "glm-4-flash",
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
  },
  moonshot: {
    apiKeyEnv: "MOONSHOT_API_KEY",
    defaultModel: "moonshot-v1-8k",
    baseURL: "https://api.moonshot.cn/v1",
  },
  minimax: {
    apiKeyEnv: "MINIMAX_API_KEY",
    defaultModel: "MiniMax-Text-01",
    baseURL: "https://api.minimax.chat/v1",
  },
};

function maskApiKey(key: string): string {
  if (!key || key.length <= 4) return "****";
  return key.slice(0, 4) + "****";
}

function getProvider(): {
  config: ProviderConfig;
  apiKey: string;
  provider: string;
  resolvedBaseURL: string | undefined;
  resolvedTimeout: number;
} | null {
  const providerName = (process.env.AI_PROVIDER || "openai").toLowerCase();
  const config = PROVIDERS[providerName];

  if (!config) {
    console.error(`[AI] Unknown provider: ${providerName}, available: ${Object.keys(PROVIDERS).join(", ")}`);
    return null;
  }

  const apiKey = process.env[config.apiKeyEnv];
  if (!apiKey) {
    console.error(`[AI] API key not configured for provider "${providerName}", env: ${config.apiKeyEnv}`);
    return null;
  }

  const customBaseURL = process.env.AI_BASE_URL;
  const resolvedBaseURL = customBaseURL || config.baseURL;

  const customTimeout = process.env.AI_TIMEOUT_MS;
  const resolvedTimeout = customTimeout ? parseInt(customTimeout, 10) : (config.timeout || DEFAULT_TIMEOUT);

  console.log(
    `[AI] provider: ${providerName}, model: ${process.env.AI_MODEL || config.defaultModel}, ` +
    `baseURL: ${resolvedBaseURL || "default"}, timeout: ${resolvedTimeout}ms, key: ${maskApiKey(apiKey)}`,
  );

  return { config, apiKey, provider: providerName, resolvedBaseURL, resolvedTimeout };
}

const SYSTEM_PROMPT = `你是一位资深的 GitHub 项目评审专家，擅长对开源仓库进行全面、客观的综合评估。

你将收到一个 GitHub 仓库的详细数据，包括：
- 仓库基本信息（名称、描述、星标数、Fork 数、许可证等）
- 编程语言分布
- 贡献者信息
- 最近提交记录
- 仓库附加指标（README、CI、贡献指南、许可证文件等）
- 基础健康度评分

请基于以上数据，从以下 6 个维度对仓库进行深入评估，每个维度 0-20 分（总计 100 分）：

1. **代码活跃度**（activity）：评估项目的开发活跃程度，包括提交频率、最近推送时间、贡献者数量和活跃度。
2. **社区健康度**（community）：评估社区参与度，包括星标数、Fork 数、Watch 数、Issue 数量、贡献者多样性。
3. **文档完善度**（documentation）：评估文档质量，包括 README 是否存在及长度、是否有贡献指南、许可证文件。
4. **工程规范度**（engineering）：评估工程化水平，包括是否配置 CI/CD、许可证合规性、代码管理规范。
5. **技术生态度**（ecosystem）：评估技术生态健康，包括编程语言多样性、Topic 标签丰富度、是否归档或禁用。
6. **维护可持续性**（sustainability）：综合评估项目的长期维护前景，包括贡献者分布、提交稳定性、仓库状态。

请严格以 JSON 格式返回评估结果，格式如下：
{
  "total_score": <0-100 的总分>,
  "summary": "<一段话的综合评价摘要，100-200字>",
  "dimensions": [
    {
      "name": "<维度英文名>",
      "score": <0-20 的分数>,
      "comment": "<该维度的详细评价，50-100字>"
    }
  ],
  "suggestions": [
    "<改进建议1>",
    "<改进建议2>",
    "<改进建议3>"
  ]
}

要求：
- 评分必须客观公正，基于数据事实
- dimensions 数组必须包含全部 6 个维度，按上述顺序排列
- suggestions 数组提供 3-5 条具体可行的改进建议
- summary 要涵盖项目的主要优缺点
- 严格返回合法 JSON，不要包含任何额外文本或 markdown 格式`;

function validateResult(parsed: unknown): parsed is AIScoreResult {
  if (!parsed || typeof parsed !== "object") return false;
  const p = parsed as Record<string, unknown>;

  if (typeof p.total_score !== "number" || p.total_score < 0 || p.total_score > 100) return false;
  if (typeof p.summary !== "string") return false;
  if (!Array.isArray(p.dimensions) || !Array.isArray(p.suggestions)) return false;

  for (const dim of p.dimensions) {
    const d = dim as Record<string, unknown>;
    if (typeof d.name !== "string" || typeof d.score !== "number" || typeof d.comment !== "string") {
      return false;
    }
  }

  for (const sug of p.suggestions) {
    if (typeof sug !== "string") return false;
  }

  return true;
}

function isAnthropicAPI(baseURL: string | undefined): boolean {
  if (!baseURL) return false;
  return baseURL.toLowerCase().includes("anthropic");
}

async function callAnthropicAPI(
  baseURL: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userInput: string,
  timeout: number,
): Promise<string | null> {
  const cleanBaseURL = baseURL.replace(/[,，\s]+$/, "");
  const path = cleanBaseURL.endsWith("/v1") ? "/messages" : "/v1/messages";
  const url = `${cleanBaseURL}${path}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userInput }],
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[AI] Anthropic API error: ${response.status} ${response.statusText}`, body.slice(0, 200));
      return null;
    }

    const data = await response.json();

    if (data.success === false || data.code >= 400) {
      console.error(`[AI] Anthropic API returned error: code=${data.code}, msg=${data.msg}`);
      return null;
    }

    console.log("[AI] Anthropic raw response keys:", Object.keys(data).join(", "));
    console.log("[AI] Anthropic response sample:", JSON.stringify(data).slice(0, 500));

    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      console.error("[AI] Anthropic API: empty content in response");
      return null;
    }

    const textBlock = data.content.find(
      (block: Record<string, unknown>) => block.type === "text",
    );

    if (!textBlock || typeof textBlock.text !== "string") {
      console.error("[AI] Anthropic API: no text block found in response");
      return null;
    }

    return textBlock.text;
  } finally {
    clearTimeout(timer);
  }
}

export async function generateAIScore(params: {
  repoInfo: RepoInfo;
  languages: Language[];
  contributors: Contributor[];
  recentCommits: CommitInfo[];
  extras: RepoExtras;
  healthScores: HealthScore[];
}): Promise<AIScoreResult | null> {
  const providerInfo = getProvider();
  if (!providerInfo) return null;

  const { config, apiKey, resolvedBaseURL, resolvedTimeout } = providerInfo;
  const model = process.env.AI_MODEL || config.defaultModel;

  const userInput = JSON.stringify(
    {
      repo_info: params.repoInfo,
      languages: params.languages,
      contributors: params.contributors,
      recent_commits: params.recentCommits,
      extras: params.extras,
      health_scores: params.healthScores,
    },
    null,
    2,
  );

  try {
    let content: string | null = null;

    if (isAnthropicAPI(resolvedBaseURL)) {
      content = await callAnthropicAPI(
        resolvedBaseURL!,
        apiKey,
        model,
        SYSTEM_PROMPT,
        userInput,
        resolvedTimeout,
      );
    } else {
      const clientOptions: ConstructorParameters<typeof OpenAI>[0] = {
        apiKey,
        timeout: resolvedTimeout,
      };

      if (resolvedBaseURL) {
        clientOptions.baseURL = resolvedBaseURL;
      }

      if (config.headers) {
        clientOptions.defaultHeaders = config.headers;
      }

      const client = new OpenAI(clientOptions);

      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userInput },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      content = response.choices[0]?.message?.content ?? null;
    }

    if (!content) {
      console.error("[AI] Empty response from model");
      return null;
    }

    const parsed = JSON.parse(content);
    if (!validateResult(parsed)) {
      console.error("[AI] Invalid response structure");
      return null;
    }

    return parsed;
  } catch (error) {
    const maskedKey = maskApiKey(apiKey);
    console.error(
      `[AI] Call failed, provider: ${providerInfo.provider}, model: ${model}, ` +
      `baseURL: ${resolvedBaseURL || "default"}, timeout: ${resolvedTimeout}ms, key: ${maskedKey}`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

export { maskApiKey, PROVIDERS };
