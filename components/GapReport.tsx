"use client";

import type { CoverageResult } from "@/lib/schemas/analysis";

interface Props {
  coverage: CoverageResult;
}

export default function GapReport({ coverage }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Coverage Gap Report</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Areas requiring additional test coverage</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500 font-medium">
          {coverage.gaps.length} gap{coverage.gaps.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="px-6 py-5">
        {coverage.gaps.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm text-emerald-400 font-medium">No coverage gaps detected</p>
            <p className="text-xs text-zinc-600 mt-1">All identified risks have linked test cases.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {coverage.gaps.map((gap, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L14 13H2L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M8 7v3M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p className="text-sm text-zinc-300 leading-relaxed">{gap}</p>
              </div>
            ))}
          </div>
        )}

        {coverage.plannerRevised && (
          <div className="mt-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-950/30 border border-amber-800/40">
            <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
              <path
                d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.8 0 3.4.87 4.4 2.2M13.5 2.5v2.5H11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-xs text-amber-300 leading-relaxed">
              <span className="font-medium">QA Reviewer triggered a revision pass.</span>{" "}
              The Test Planner and Test Writer re-ran to address high-severity gaps. Remaining gaps above require manual attention.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
