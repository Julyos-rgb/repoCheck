"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBox() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const parseGitHubUrl = (input: string) => {
    const pattern = /(?:https?:\/\/)?github\.com\/([a-zA-Z0-9\-_.]+)\/([a-zA-Z0-9\-_.]+)/;
    const match = input.trim().match(pattern);
    if (!match) return null;
    return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = parseGitHubUrl(url);
    if (!result) {
      setError("请输入有效的 GitHub 仓库地址，格式如：https://github.com/owner/repo");
      return;
    }

    router.push(`/check/${result.owner}/${result.repo}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
            }}
            placeholder="https://github.com/owner/repo"
            className={`w-full px-5 py-4 rounded-xl bg-gray-900/80 border ${
              error ? "border-red-500" : "border-gray-700"
            } text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-base`}
          />
        </div>
        <button
          type="submit"
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:from-violet-500 hover:to-blue-500 transition-all shadow-lg shadow-violet-500/25 cursor-pointer whitespace-nowrap"
        >
          开始体检
        </button>
      </div>
      {error && (
        <p className="mt-3 text-red-400 text-sm flex items-center gap-2">
          <svg
            className="w-4 h-4 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </form>
  );
}
