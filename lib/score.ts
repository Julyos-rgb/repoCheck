import type {
  HealthScore,
  RepoInfo,
  Language,
  Contributor,
  RepoExtras,
  CommitActivity,
} from "@/types";

type ScoreParams = {
  repoInfo: RepoInfo;
  languages: Language[];
  contributors: Contributor[];
  extras: RepoExtras;
  commitActivity: CommitActivity[];
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function daysSince(dateStr: string): number {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return (now - then) / (1000 * 60 * 60 * 24);
}

function scoreActivity(
  repoInfo: RepoInfo,
  commitActivity: CommitActivity[],
): HealthScore {
  const days = daysSince(repoInfo.pushed_at);
  let pushScore: number;
  if (days <= 7) pushScore = 50;
  else if (days <= 30) pushScore = 40;
  else if (days <= 90) pushScore = 25;
  else if (days <= 180) pushScore = 10;
  else pushScore = 5;

  const activeDays = commitActivity.filter((d) => d.count > 0).length;
  const totalDays = commitActivity.length || 1;
  const activityRatio = activeDays / totalDays;
  const commitScore = Math.round(activityRatio * 50);

  const total = clamp(Math.round(pushScore + commitScore), 0, 100);

  let description: string;
  if (days <= 7) {
    description = `该仓库非常活跃，最近一周内有代码推送，近 30 天有 ${activeDays} 天存在提交`;
  } else if (days <= 30) {
    description = `该仓库较为活跃，最近推送距今约 ${Math.round(days)} 天，近 30 天有 ${activeDays} 天存在提交`;
  } else if (days <= 90) {
    description = `该仓库活跃度一般，最近推送距今约 ${Math.round(days)} 天，近 30 天有 ${activeDays} 天存在提交`;
  } else {
    description = `该仓库活跃度较低，最近推送距今超过 ${Math.round(days)} 天，近 30 天仅有 ${activeDays} 天存在提交`;
  }

  return {
    dimension: "activity",
    label: "代码活跃度",
    score: total,
    description,
  };
}

function scoreCommunity(repoInfo: RepoInfo): HealthScore {
  const stars = repoInfo.stargazers_count;
  const forks = repoInfo.forks_count;
  const watchers = repoInfo.watchers_count;

  const starScore = clamp(
    (Math.log10(stars + 1) / Math.log10(10001)) * 50,
    0,
    50,
  );
  const forkScore = clamp(
    (Math.log10(forks + 1) / Math.log10(1001)) * 30,
    0,
    30,
  );
  const watcherScore = clamp(
    (Math.log10(watchers + 1) / Math.log10(501)) * 20,
    0,
    20,
  );

  const total = Math.round(starScore + forkScore + watcherScore);

  let description: string;
  if (total >= 80) {
    description = `该仓库社区非常活跃，拥有 ${stars.toLocaleString()} Stars、${forks.toLocaleString()} Forks 和 ${watchers.toLocaleString()} Watchers`;
  } else if (total >= 50) {
    description = `该仓库社区活跃度较高，拥有 ${stars.toLocaleString()} Stars、${forks.toLocaleString()} Forks`;
  } else if (total >= 25) {
    description = `该仓库社区活跃度一般，拥有 ${stars.toLocaleString()} Stars、${forks.toLocaleString()} Forks`;
  } else {
    description = `该仓库社区活跃度较低，仅有 ${stars.toLocaleString()} Stars、${forks.toLocaleString()} Forks，建议提升项目曝光度`;
  }

  return {
    dimension: "community",
    label: "社区健康度",
    score: total,
    description,
  };
}

function scoreDocumentation(
  extras: RepoExtras,
  repoInfo: RepoInfo,
): HealthScore {
  let score = 0;
  const details: string[] = [];

  if (extras.hasReadme) {
    score += 25;
    details.push("包含 README 文档");
  } else {
    details.push("缺少 README 文档");
  }

  if (repoInfo.description && repoInfo.description.trim().length > 0) {
    score += 15;
    details.push("有仓库描述信息");
  } else {
    details.push("缺少仓库描述");
  }

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

  return {
    dimension: "documentation",
    label: "文档完善度",
    score,
    description,
  };
}

function scoreEngineering(
  repoInfo: RepoInfo,
  languages: Language[],
  extras: RepoExtras,
): HealthScore {
  let score = 0;
  const details: string[] = [];

  if (extras.hasCI) {
    score += 30;
    details.push("配置了 CI/CD");
  } else {
    details.push("未配置 CI/CD");
  }

  if (
    repoInfo.license &&
    repoInfo.license.spdx_id &&
    repoInfo.license.spdx_id !== "NOASSERTION"
  ) {
    score += 25;
    details.push(`使用 ${repoInfo.license.spdx_id} 开源协议`);
  } else {
    details.push("缺少明确的开源协议");
  }

  const topicScore = clamp(repoInfo.topics.length * 3, 0, 20);
  score += topicScore;
  if (repoInfo.topics.length > 0) {
    details.push(`标注了 ${repoInfo.topics.length} 个主题标签`);
  }

  const totalSize = languages.reduce((sum, l) => sum + l.size, 0);
  if (totalSize > 5000) {
    score += 25;
  } else if (totalSize > 500) {
    score += 15;
  } else {
    score += 5;
  }

  score = Math.round(clamp(score, 0, 100));

  const description =
    score >= 80
      ? `该仓库工程化水平很高，${details.join("、")}`
      : score >= 50
        ? `该仓库工程化水平中等，${details.join("、")}`
        : `该仓库工程化水平有待提升，${details.join("、")}`;

  void languages;

  return {
    dimension: "engineering",
    label: "工程规范度",
    score,
    description,
  };
}

function scoreEcosystem(
  repoInfo: RepoInfo,
  languages: Language[],
): HealthScore {
  if (repoInfo.archived) {
    return {
      dimension: "ecosystem",
      label: "技术生态度",
      score: 0,
      description: "该仓库已归档，技术生态评分为 0",
    };
  }

  const repoInfoAny = repoInfo as Record<string, unknown>;
  if (repoInfoAny.disabled === true) {
    return {
      dimension: "ecosystem",
      label: "技术生态度",
      score: 0,
      description: "该仓库已被禁用，技术生态评分为 0",
    };
  }

  const langCount = languages.length;
  let diversityScore: number;
  if (langCount >= 2 && langCount <= 5) {
    diversityScore = 40;
  } else if (langCount === 1) {
    diversityScore = 20;
  } else {
    diversityScore = 25;
  }

  const mainLang = languages.length > 0 ? languages[0] : null;
  let dominanceScore = 5;
  if (mainLang) {
    const ratio = mainLang.percentage;
    if (ratio < 60) dominanceScore = 30;
    else if (ratio < 80) dominanceScore = 20;
    else if (ratio < 95) dominanceScore = 10;
    else dominanceScore = 5;
  }

  const topicScore = clamp(repoInfo.topics.length * 5, 0, 30);

  const total = Math.round(
    clamp(diversityScore + dominanceScore + topicScore, 0, 100),
  );

  const details: string[] = [];
  details.push(
    langCount >= 2 && langCount <= 5
      ? `语言组成合理（${langCount} 种语言）`
      : langCount === 1
        ? "使用单一语言开发"
        : `语言种类较多（${langCount} 种）`,
  );
  if (mainLang) {
    details.push(`主语言 ${mainLang.name} 占比 ${mainLang.percentage.toFixed(1)}%`);
  }
  if (repoInfo.topics.length > 0) {
    details.push(`标注了 ${repoInfo.topics.length} 个主题标签`);
  }

  const description =
    total >= 80
      ? `该仓库技术生态良好，${details.join("、")}`
      : total >= 50
        ? `该仓库技术生态中等，${details.join("、")}`
        : `该仓库技术生态有待改善，${details.join("、")}`;

  return {
    dimension: "ecosystem",
    label: "技术生态度",
    score: total,
    description,
  };
}

function scoreSustainability(
  repoInfo: RepoInfo,
  contributors: Contributor[],
): HealthScore {
  const issues = repoInfo.open_issues_count;
  const stars = repoInfo.stargazers_count;

  let issueScore: number;
  if (stars > 0) {
    const ratio = issues / stars;
    if (ratio < 0.01) issueScore = 40;
    else if (ratio < 0.05) issueScore = 30;
    else if (ratio < 0.1) issueScore = 20;
    else if (ratio < 0.2) issueScore = 10;
    else issueScore = 5;
  } else {
    if (issues <= 5) issueScore = 40;
    else if (issues <= 20) issueScore = 30;
    else if (issues <= 50) issueScore = 20;
    else if (issues <= 150) issueScore = 10;
    else issueScore = 5;
  }

  const count = contributors.length;
  let countScore: number;
  if (count > 50) countScore = 30;
  else if (count > 20) countScore = 25;
  else if (count > 10) countScore = 20;
  else if (count > 5) countScore = 15;
  else if (count > 2) countScore = 10;
  else countScore = 5;

  let distributionScore = 5;
  if (contributors.length >= 2) {
    const totalContributions = contributors.reduce(
      (s, c) => s + c.contributions,
      0,
    );
    if (totalContributions > 0) {
      const topRatio = contributors[0].contributions / totalContributions;
      if (topRatio < 0.3) distributionScore = 30;
      else if (topRatio < 0.5) distributionScore = 20;
      else if (topRatio < 0.7) distributionScore = 10;
      else distributionScore = 5;
    }
  }

  const total = Math.round(
    clamp(issueScore + countScore + distributionScore, 0, 100),
  );

  const details: string[] = [];
  if (stars > 0) {
    const ratio = (issues / stars).toFixed(3);
    details.push(`Issue/Star 比率为 ${ratio}`);
  } else {
    details.push(`有 ${issues} 个未解决 Issue`);
  }
  details.push(`共 ${count} 位贡献者`);
  if (contributors.length >= 2) {
    const totalContributions = contributors.reduce(
      (s, c) => s + c.contributions,
      0,
    );
    if (totalContributions > 0) {
      const topRatio = (
        (contributors[0].contributions / totalContributions) *
        100
      ).toFixed(1);
      details.push(`TOP1 贡献者占比 ${topRatio}%`);
    }
  }

  const description =
    total >= 80
      ? `该仓库维护可持续性很好，${details.join("、")}`
      : total >= 50
        ? `该仓库维护可持续性中等，${details.join("、")}`
        : `该仓库维护可持续性有待提升，${details.join("、")}`;

  return {
    dimension: "sustainability",
    label: "维护可持续性",
    score: total,
    description,
  };
}

export function calculateHealthScore(params: ScoreParams): HealthScore[] {
  const { repoInfo, languages, contributors, extras, commitActivity } = params;

  return [
    scoreActivity(repoInfo, commitActivity),
    scoreCommunity(repoInfo),
    scoreDocumentation(extras, repoInfo),
    scoreEngineering(repoInfo, languages, extras),
    scoreEcosystem(repoInfo, languages),
    scoreSustainability(repoInfo, contributors),
  ];
}

export function calculateTotalScore(scores: HealthScore[]): number {
  if (scores.length === 0) return 0;
  const total = scores.reduce((sum, s) => sum + s.score, 0);
  return Math.round(total / scores.length);
}
