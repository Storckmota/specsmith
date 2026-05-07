"use client";

import type { CoverageResult } from "@/lib/schemas/analysis";

interface Props {
  coverage: CoverageResult;
}

export default function CoverageScore({ coverage }: Props) {
  const score = coverage.score;

  const getScoreColor = (s: number) => {
    if (s >= 80) return { text: "text-emerald-400", ring: "stroke-emerald-500" };
    if (s >= 60) return { text: "text-yellow-400", ring: "stroke-yellow-500" };
    return { text: "text-red-400", ring: "stroke-red-500" };
  };

  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">QA Coverage Score</h2>
        {coverage.plannerRevised && (
          <span className="text-xs px-2 py-1 rounded-full bg-amber-950 border border-amber-800 text-amber-300">
            Revised by QA Reviewer
          </span>
        )}
      </div>

      <div className="flex items-center gap-8">
        {/* Circular score */}
        <div className="relative flex-shrink-0">
          <svg width="100" height="100" className="rotate-[-90deg]">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className={`transition-all duration-1000 ${colors.ring}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
            <span className="text-xs text-zinc-600">/100</span>
          </div>
        </div>

        {/* Summary */}
        <div className="flex-1">
          <p className="text-sm text-zinc-300 mb-2">{coverage.summary}</p>
          <p className="text-xs text-zinc-500 italic">{coverage.reviewerFeedback}</p>
        </div>
      </div>
    </div>
  );
}
