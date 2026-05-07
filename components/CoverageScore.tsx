"use client";

import type { CoverageResult } from "@/lib/schemas/analysis";

interface Props {
  coverage: CoverageResult;
}

export default function CoverageScore({ coverage }: Props) {
  const score = coverage.score;

  const getColors = (s: number) => {
    if (s >= 80) return { text: "text-emerald-400", ring: "stroke-emerald-500", bar: "bg-emerald-500", label: "Good" };
    if (s >= 60) return { text: "text-yellow-400", ring: "stroke-yellow-500", bar: "bg-yellow-500", label: "Fair" };
    return { text: "text-red-400", ring: "stroke-red-500", bar: "bg-red-500", label: "Needs work" };
  };

  const colors = getColors(score);
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">QA Coverage Score</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Completeness of test coverage across all identified risks</p>
        </div>
        {coverage.plannerRevised && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-300 font-medium">
            Revised by QA Reviewer
          </span>
        )}
      </div>

      <div className="px-6 py-5">
        <div className="flex items-center gap-8">
          {/* Circular score */}
          <div className="relative flex-shrink-0">
            <svg width="96" height="96" className="rotate-[-90deg]">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#27272a" strokeWidth="7" />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className={`transition-all duration-700 ${colors.ring}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold tabular-nums ${colors.text}`}>{score}</span>
              <span className="text-xs text-zinc-600 font-medium">/100</span>
            </div>
          </div>

          {/* Summary */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-semibold ${colors.text}`}>{colors.label}</span>
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-xs text-zinc-500 tabular-nums">{score}%</span>
            </div>
            <p className="text-sm text-zinc-300 mb-2 leading-relaxed">{coverage.summary}</p>
            {coverage.reviewerFeedback && (
              <p className="text-xs text-zinc-500 italic leading-relaxed">{coverage.reviewerFeedback}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
