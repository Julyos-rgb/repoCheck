# RepoCheck — GitHub 仓库体检工具

输入公开 GitHub 仓库 URL，自动分析项目健康度并以可视化图表展示关键指标，结合 AI 给出综合评分和改进建议。

## 功能特性

- **仓库搜索** — 输入 GitHub 仓库 URL，一键跳转分析
- **数据可视化** — 概览卡片、语言分布饼图、提交活跃度柱状图、贡献者排行、健康度雷达图
- **6 维度健康评分** — 社区活跃度、维护状态、文档完善度、代码质量、Issue 响应率、贡献者多样性
- **AI 智能评分** — 基于 OpenAI 提供综合评分、各维度评语和改进建议
- **响应式设计** — 支持桌面端和移动端浏览

## 技术栈

- **框架**: [Next.js 16](https://nextjs.org) (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **图表**: [Recharts](https://recharts.org)
- **AI**: [OpenAI API](https://openai.com) (gpt-4o-mini)
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
cp .env.local.example .env.local
# 编辑 .env.local 填入你的 OPENAI_API_KEY

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

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API Key，用于 AI 智能评分 | 否 |

> 不配置 `OPENAI_API_KEY` 时，基础的 GitHub 数据分析和可视化功能仍可正常使用，AI 评分部分会显示"AI 评分暂时不可用"。

## 开源协议

[MIT License](./LICENSE) © 2026 Julyos-rgb
