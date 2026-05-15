"use client";

import type { RepoInfo } from "@/types";

interface RepoHeaderProps {
  repoInfo: RepoInfo;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function RepoHeader({ repoInfo }: RepoHeaderProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <a
          href={repoInfo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 shrink-0 text-gray-400 transition-colors hover:text-white"
        >
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </a>
        <div className="min-w-0 flex-1">
          <a
            href={repoInfo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2"
          >
            <h1 className="truncate text-2xl font-bold tracking-tight text-gray-100 sm:text-3xl group-hover:text-blue-400 transition-colors">
              {repoInfo.full_name}
            </h1>
            <svg
              className="h-5 w-5 shrink-0 text-gray-500 transition-colors group-hover:text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </a>
          {repoInfo.description && (
            <p className="mt-2 text-sm leading-relaxed text-gray-400 sm:text-base">
              {repoInfo.description}
            </p>
          )}
        </div>
      </div>

      {repoInfo.topics.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {repoInfo.topics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.06] pt-4 text-xs text-gray-500 sm:text-sm">
        <span className="inline-flex items-center gap-1.5">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
          创建于 {formatDate(repoInfo.created_at)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          最近更新 {formatDate(repoInfo.updated_at)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m0 0l4.5 7.795"
            />
          </svg>
          {repoInfo.default_branch}
        </span>
        {repoInfo.license && (
          <span className="inline-flex items-center gap-1.5">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            {repoInfo.license.spdx_id !== "NOASSERTION"
              ? repoInfo.license.spdx_id
              : repoInfo.license.name}
          </span>
        )}
        {repoInfo.archived && (
          <span className="inline-flex items-center gap-1.5 text-yellow-500">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
            已归档
          </span>
        )}
      </div>
    </div>
  );
}
