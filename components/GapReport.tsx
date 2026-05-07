"use client";

import type { CoverageResult } from "@/lib/schemas/analysis";

interface Props {
  coverage: CoverageResult;
}

export default function GapReport({ coverage }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Coverage Gap Report</h2>
        <span className="text-xs text-zinc-500">{coverage.gaps.length} gaps found</span>
      </div>

      {coverage.gaps.length === 0 ? (
        <div className="py-8 text-center">
          <div className="text-3xl mb-2">✓</div>
          <p className="text-sm text-emerald-400">No coverage gaps detected.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {coverage.gaps.map((gap, i) => (
            <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-amber-500 text-sm mt-0.5 flex-shrink-0">⚠</span>
              <p className="text-sm text-zinc-300">{gap}</p>
            </div>
          ))}
        </div>
      )}

      {coverage.plannerRevised && (
        <div className="mt-4 px-3 py-2.5 rounded-lg bg-amber-950 border border-amber-800">
          <p className="text-xs text-amber-300">
            The QA Reviewer triggered a revision pass. The Test Planner and Test Writer re-ran to address high-severity gaps.
            Remaining gaps above require manual attention.
          </p>
        </div>
      )}
    </div>
  );
}
