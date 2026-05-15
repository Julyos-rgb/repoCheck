import type {
  HealthScore,
  RepoInfo,
  Language,
  Contributor,
  RepoExtras,
} from "@/types";

type ScoreParams = {
  repoInfo: RepoInfo;
  languages: Language[];
  contributors: Contributor[];
  extras: RepoExtras;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function daysSince(dateStr: string): number {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return (now - then) / (1000 * 60 * 60 * 24);
}

function scoreCommunity(repoInfo: RepoInfo): HealthScore {
  const stars = repoInfo.stargazers_count;
  const forks = repoInfo.forks_count;
  const watchers = repoInfo.watchers_count;

  const starScore = clamp(
    (Math.log10(stars + 1) / Math.log10(10001)) * 55,
    0,
    55,
  );
  const forkScore = clamp(
    (Math.log10(forks + 1) / Math.log10(1001)) * 30,
    0,
    30,
  );
  const watcherScore = clamp(
    (Math.log10(watchers + 1) / Math.log10(501)) * 15,
    0,
    15,
  );

  const total = Math.round(starScore + forkScore + watcherScore);

  let description: string;
  if (total >= 80) {
    description = `该仓库社区活跃度很高，拥有 ${stars.toLocaleString()} Stars、${forks.toLocaleString()} Forks 和 ${watchers.toLocaleString()} Watchers`;
  } else if (total >= 50) {
    description = `该仓库社区活跃度较高，拥有 ${stars.toLocaleString()} Stars、${forks.toLocaleString()} Forks`;
  } else if (total >= 25) {
    description = `该仓库社区活跃度一般，拥有 ${stars.toLocaleString()} Stars、${forks.toLocaleString()} Forks`;
  } else {
    description = `该仓库社区活跃度较低，仅有 ${stars.toLocaleString()} Stars、${forks.toLocaleString()} Forks，建议提升项目曝光度`;
  }

  return {
    dimension: "community",
    label: "社区活跃度",
    score: total,
    description,
  };
}

function scoreMaintenance(repoInfo: RepoInfo): HealthScore {
  const days = daysSince(repoInfo.pushed_at);
  let score: number;
  let description: string;

  if (days <= 7) {
    score = 100;
    description = "该仓库维护状态极佳，最近一周内有代码提交";
  } else if (days <= 30) {
    score = 80;
    description = `该仓库维护状态良好，最近一次提交距今约 ${Math.round(days)} 天`;
  } else if (days <= 90) {
    score = 60;
    description = `该仓库维护状态一般，最近一次提交距今约 ${Math.round(days)} 天`;
  } else if (days <= 180) {
    score = 30;
    description = `该仓库维护状态较差，最近一次提交距今约 ${Math.round(days)} 天，可能已进入低活跃期`;
  } else {
    score = 10;
    description = `该仓库已长期未更新，最近一次提交距今超过 ${Math.round(days)} 天，存在维护风险`;
  }

  return { dimension: "maintenance", label: "维护状态", score, description };
}

function scoreDocumentation(
  extras: RepoExtras,
  repoInfo: RepoInfo,
): HealthScore {
  let score = 0;
  const details: string[] = [];

  if (extras.hasReadme) {
    score += 40;
    details.push("包含 README 文档");
  } else {
    details.push("缺少 README 文档");
  }

  score += 25;
  details.push("有仓库描述信息");

  if (extras.hasContributing) {
    score += 20;
    details.push("提供了 CONTRIBUTING 贡献指南");
  }

  if (extras.hasLicense) {
    score += 15;
    details.push("包含 LICENSE 文件");
  }

  score = Math.round(clamp(score, 0, 100));

  const description =
    score >= 80
      ? `该仓库文档完善度很高，${details.join("、")}`
      : score >= 50
        ? `该仓库文档完善度中等，${details.join("、")}`
        : `该仓库文档不够完善，${details.join("、")}，建议补充相关文档`;

  void repoInfo;

  return {
    dimension: "documentation",
    label: "文档完善度",
    score,
    description,
  };
}

function scoreCodeQuality(
  repoInfo: RepoInfo,
  languages: Language[],
  extras: RepoExtras,
): HealthScore {
  let score = 0;
  const details: string[] = [];

  if (extras.hasCI) {
    score += 20;
    details.push("配置了 CI/CD");
  } else {
    details.push("未配置 CI/CD");
  }

  if (
    repoInfo.license &&
    repoInfo.license.spdx_id &&
    repoInfo.license.spdx_id !== "NOASSERTION"
  ) {
    score += 20;
    details.push(`使用 ${repoInfo.license.spdx_id} 开源协议`);
  } else {
    details.push("缺少明确的开源协议");
  }

  const langCount = languages.length;
  if (langCount >= 2 && langCount <= 6) {
    score += 20;
    details.push(`语言组成合理（${langCount} 种语言）`);
  } else if (langCount === 1) {
    score += 10;
    details.push("使用单一语言开发");
  } else {
    score += 5;
    details.push(`语言种类过多（${langCount} 种），可能增加维护成本`);
  }

  const topicScore = clamp(repoInfo.topics.length * 4, 0, 20);
  score += topicScore;
  if (repoInfo.topics.length > 0) {
    details.push(`标注了 ${repoInfo.topics.length} 个主题标签`);
  }

  const totalSize = languages.reduce((sum, l) => sum + l.size, 0);
  if (totalSize > 10000) {
    score += 20;
  } else if (totalSize > 1000) {
    score += 10;
  }

  score = Math.round(clamp(score, 0, 100));

  const description =
    score >= 80
      ? `该仓库代码质量指标良好，${details.join("、")}`
      : score >= 50
        ? `该仓库代码质量指标中等，${details.join("、")}`
        : `该仓库代码质量指标有待提升，${details.join("、")}`;

  return {
    dimension: "code_quality",
    label: "代码质量",
    score,
    description,
  };
}

function scoreIssueResponse(repoInfo: RepoInfo): HealthScore {
  const issues = repoInfo.open_issues_count;

  let score: number;
  let description: string;

  if (issues <= 5) {
    score = 100;
    description = `该仓库 Issue 响应率极高，仅有 ${issues} 个未解决 Issue`;
  } else if (issues <= 20) {
    score = 85;
    description = `该仓库 Issue 响应率良好，有 ${issues} 个未解决 Issue`;
  } else if (issues <= 50) {
    score = 70;
    description = `该仓库有 ${issues} 个未解决 Issue，响应率尚可`;
  } else if (issues <= 150) {
    score = 50;
    description = `该仓库有 ${issues} 个未解决 Issue，响应率一般，可能存在积压`;
  } else if (issues <= 500) {
    score = 30;
    description = `该仓库有 ${issues} 个未解决 Issue，积压较多，响应率较低`;
  } else {
    score = 15;
    description = `该仓库有 ${issues} 个未解决 Issue，严重积压，建议及时处理`;
  }

  return {
    dimension: "issue_response",
    label: "Issue 响应率",
    score,
    description,
  };
}

function scoreContributorDiversity(contributors: Contributor[]): HealthScore {
  const count = contributors.length;

  let countScore: number;
  if (count > 50) countScore = 100;
  else if (count > 20) countScore = 80;
  else if (count > 10) countScore = 60;
  else if (count > 5) countScore = 40;
  else if (count > 2) countScore = 20;
  else countScore = 10;

  let distributionScore = 0;
  if (contributors.length >= 2) {
    const totalContributions = contributors.reduce(
      (s, c) => s + c.contributions,
      0,
    );
    if (totalContributions > 0) {
      const topContributions = contributors[0].contributions;
      const topRatio = topContributions / totalContributions;
      if (topRatio < 0.3) distributionScore = 30;
      else if (topRatio < 0.5) distributionScore = 20;
      else if (topRatio < 0.7) distributionScore = 10;
      else distributionScore = 0;
    }
  }

  const score = Math.round(
    clamp(countScore * 0.7 + distributionScore * 0.3, 0, 100),
  );

  const description =
    score >= 80
      ? `该仓库贡献者多样性很好，共有 ${count} 位贡献者，社区参与度高`
      : score >= 50
        ? `该仓库贡献者多样性中等，共有 ${count} 位贡献者`
        : `该仓库贡献者较少，仅有 ${count} 位贡献者，建议鼓励更多开发者参与`;

  return {
    dimension: "contributor_diversity",
    label: "贡献者多样性",
    score,
    description,
  };
}

export function calculateHealthScore(params: ScoreParams): HealthScore[] {
  const { repoInfo, languages, contributors, extras } = params;

  return [
    scoreCommunity(repoInfo),
    scoreMaintenance(repoInfo),
    scoreDocumentation(extras, repoInfo),
    scoreCodeQuality(repoInfo, languages, extras),
    scoreIssueResponse(repoInfo),
    scoreContributorDiversity(contributors),
  ];
}
