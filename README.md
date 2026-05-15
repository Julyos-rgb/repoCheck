# RepoCheck — GitHub 仓库体检工具

输入公开 GitHub 仓库 URL，自动分析项目健康度并以可视化图表展示关键指标，结合 AI 给出综合评分和改进建议。

## 功能特性

- **仓库搜索** — 输入 GitHub 仓库 URL，一键跳转分析
- **数据可视化** — 概览卡片、语言分布饼图、提交活跃度柱状图、贡献者排行、健康度雷达图
- **6 维度健康评分** — 社区活跃度、维护状态、文档完善度、代码质量、Issue 响应率、贡献者多样性
- **AI 智能评分** — 支持多种大模型（OpenAI、Anthropic Claude、DeepSeek、通义千问、智谱 GLM、Moonshot、MiniMax），提供综合评分、各维度评语和改进建议
- **响应式设计** — 支持桌面端和移动端浏览

## 技术栈

- **框架**: [Next.js 16](https://nextjs.org) (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **图表**: [Recharts](https://recharts.org)
- **AI**: OpenAI SDK（兼容多家大模型）
- **数据源**: GitHub REST API v3

## 快速开始

### 环境要求

- Node.js 18+
- npm

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/Julyos-rgb/repoCheck.git
cd repoCheck

# 安装依赖
npm install

# 配置环境变量（可选，不配置则 AI 评分功能不可用）
# 编辑 .env.local，设置 AI_PROVIDER 和对应的 API Key
# 示例：使用 DeepSeek
#   AI_PROVIDER=deepseek
#   DEEPSEEK_API_KEY=your_key_here

# 启动开发服务器
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

### 生产构建

```bash
npm run build
npm run start
```

## 环境变量

### 快速配置

```bash
# 复制示例文件并填入你的密钥
cp .env.example .env.local
```

### 环境文件说明

| 文件 | 用途 | 提交 Git |
|------|------|---------|
| `.env` | 公共默认值 | ✅ |
| `.env.development` | 开发环境配置 | ✅ |
| `.env.production` | 生产环境配置 | ✅ |
| `.env.example` | 配置示例 | ✅ |
| `.env.local` | 本地真实密钥（覆盖其他文件） | ❌ |

> Next.js 环境文件加载优先级：`.env.local` > `.env.development/.env.production` > `.env`

### 基础配置

| 变量名 | 说明 | 必填 | 默认值 |
|--------|------|------|--------|
| `GITHUB_TOKEN` | GitHub Personal Access Token（提升 API 速率限制） | 否 | 无（60 次/小时） |
| `AI_PROVIDER` | AI 提供商 | 否 | `openai` |
| `AI_MODEL` | 自定义模型名称（覆盖默认） | 否 | 各提供商默认模型 |
| `AI_BASE_URL` | 自定义 Base URL（覆盖提供商默认） | 否 | 各提供商默认地址 |
| `AI_TIMEOUT_MS` | API 超时时间（毫秒） | 否 | `30000`（30 秒） |

> **提示：** 配置 `GITHUB_TOKEN` 可将 GitHub API 速率限制从 60 次/小时提升至 5000 次/小时。在 [GitHub Settings → Tokens](https://github.com/settings/tokens) 创建即可，无需任何权限。

### 支持的 AI 提供商

| 提供商 | `AI_PROVIDER` 值 | API Key 环境变量 | 默认模型 |
|--------|-------------------|-----------------|---------|
| OpenAI | `openai` | `OPENAI_API_KEY` | `gpt-4o-mini` |
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` | `claude-sonnet-4-20250514` |
| DeepSeek | `deepseek` | `DEEPSEEK_API_KEY` | `deepseek-chat` |
| 通义千问 | `qwen` | `QWEN_API_KEY` | `qwen-plus` |
| 智谱 GLM | `glm` | `GLM_API_KEY` | `glm-4-flash` |
| Moonshot | `moonshot` | `MOONSHOT_API_KEY` | `moonshot-v1-8k` |
| MiniMax | `minimax` | `MINIMAX_API_KEY` | `MiniMax-Text-01` |

### 自定义接口示例

通过 `AI_BASE_URL` 可以接入各种兼容接口：

```env
# 使用智谱的 Anthropic 兼容接口
AI_PROVIDER=anthropic
AI_BASE_URL=https://open.bigmodel.cn/api/anthropic
ANTHROPIC_API_KEY=your_zhipu_api_key
AI_TIMEOUT_MS=3000000
```

> 只需配置 `AI_PROVIDER` 和对应提供商的 API Key 即可切换模型。不配置任何 Key 时，基础的 GitHub 数据分析和可视化功能仍可正常使用，AI 评分部分会显示"AI 评分暂时不可用"。

## 开源协议

[MIT License](./LICENSE) © 2026 Julyos-rgb
