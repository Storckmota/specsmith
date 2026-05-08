"use client";

import type { CoverageResult } from "@/lib/schemas/analysis";

interface Props {
  coverage: CoverageResult;
}

export default function CoverageScore({ coverage }: Props) {
  const score = coverage.score;

  const getColors = (s: number) => {
    if (s >= 80) return { text: "text-emerald-300", ring: "stroke-emerald-400", glow: "shadow-emerald-500/20", label: "Operational" };
    if (s >= 60) return { text: "text-amber-300", ring: "stroke-amber-400", glow: "shadow-amber-500/20", label: "Needs review" };
    return { text: "text-rose-300", ring: "stroke-rose-400", glow: "shadow-rose-500/20", label: "Coverage risk" };
  };

  const colors = getColors(score);
  const circumference = 2 * Math.PI * 44;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-md shadow-2xl ${colors.glow}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Coverage Score</h2>
          <p className="mt-0.5 text-xs text-slate-500">Completeness across the generated risk registry.</p>
        </div>
        {coverage.plannerRevised && (
          <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
            Re-forged
          </span>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <svg width="112" height="112" className="-rotate-90">
              <circle cx="56" cy="56" r="44" fill="none" stroke="rgba(148,163,184,0.14)" strokeWidth="8" />
              <circle
                cx="56"
                cy="56"
                r="44"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className={`transition-all duration-700 ${colors.ring}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-semibold tabular-nums ${colors.text}`}>{score}</span>
              <span className="text-xs font-medium text-slate-600">/100</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className={`text-sm font-semibold ${colors.text}`}>{colors.label}</div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{coverage.summary}</p>
            {coverage.reviewerFeedback && (
              <p className="mt-3 border-l border-white/10 pl-3 text-xs italic leading-5 text-slate-500">
                {coverage.reviewerFeedback}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
