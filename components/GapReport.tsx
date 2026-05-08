"use client";

import type { CoverageResult } from "@/lib/schemas/analysis";

interface Props {
  coverage: CoverageResult;
}

export default function GapReport({ coverage }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Gap Report</h2>
          <p className="mt-0.5 text-xs text-slate-500">What the Smith noticed after coverage review.</p>
        </div>
        <span className="rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1 text-xs font-medium text-slate-500">
          {coverage.gaps.length} gap{coverage.gaps.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="px-6 py-5">
        {coverage.gaps.length === 0 ? (
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-5 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/40">
              <svg className="h-5 w-5 text-emerald-300" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm font-medium text-emerald-300">No coverage gaps detected</p>
            <p className="mt-1 text-xs text-slate-500">All identified risks have linked test cases.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {coverage.gaps.map((gap, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3"
              >
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-300" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L14 13H2L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M8 7v3M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <p className="text-sm leading-relaxed text-amber-100">{gap}</p>
              </div>
            ))}
          </div>
        )}

        {coverage.plannerRevised && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-400/30 bg-slate-950/60 px-4 py-3">
            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-300" viewBox="0 0 16 16" fill="none">
              <path
                d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.8 0 3.4.87 4.4 2.2M13.5 2.5v2.5H11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-xs leading-relaxed text-amber-200">
              <span className="font-medium">QA Reviewer triggered a revision pass.</span>{" "}
              Test Planner and Test Writer re-ran to address high-severity gaps. Remaining gaps require manual attention.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
