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

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function generateAIScore(params: {
  repoInfo: RepoInfo;
  languages: Language[];
  contributors: Contributor[];
  recentCommits: CommitInfo[];
  extras: RepoExtras;
  healthScores: HealthScore[];
}): Promise<AIScoreResult | null> {
  try {
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
      2
    );

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userInput },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return null;
    }

    const parsed = JSON.parse(content);

    if (
      typeof parsed.total_score !== "number" ||
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.dimensions) ||
      !Array.isArray(parsed.suggestions)
    ) {
      return null;
    }

    if (parsed.total_score < 0 || parsed.total_score > 100) {
      return null;
    }

    for (const dim of parsed.dimensions) {
      if (
        typeof dim.name !== "string" ||
        typeof dim.score !== "number" ||
        typeof dim.comment !== "string"
      ) {
        return null;
      }
    }

    for (const sug of parsed.suggestions) {
      if (typeof sug !== "string") {
        return null;
      }
    }

    return {
      total_score: parsed.total_score,
      summary: parsed.summary,
      dimensions: parsed.dimensions,
      suggestions: parsed.suggestions,
    };
  } catch {
    return null;
  }
}
