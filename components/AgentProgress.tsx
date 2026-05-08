"use client";

import type { AnalysisResult } from "@/lib/schemas/analysis";

type TimelineEntry = AnalysisResult["agentTimeline"][number];

interface Props {
  timeline: TimelineEntry[];
  providerMode: string;
}

const statusConfig = {
  pending: {
    dot: "bg-slate-700",
    ring: "border-slate-700",
    label: "pending",
    text: "text-slate-600",
  },
  running: {
    dot: "bg-emerald-400 animate-pulse",
    ring: "border-emerald-400/60 shadow-[0_0_18px_rgba(52,211,153,0.35)]",
    label: "running",
    text: "text-emerald-300",
  },
  complete: {
    dot: "bg-emerald-400",
    ring: "border-emerald-400/50",
    label: "complete",
    text: "text-emerald-300",
  },
  revision: {
    dot: "bg-amber-400 animate-pulse",
    ring: "border-amber-400/60 shadow-[0_0_18px_rgba(245,158,11,0.35)]",
    label: "revision",
    text: "text-amber-300",
  },
};

const agentNumber: Record<string, number> = {
  "Spec Parser": 1,
  "Risk Mapper": 2,
  "Test Planner": 3,
  "Test Writer": 4,
  "QA Reviewer": 5,
};

export default function AgentProgress({ timeline, providerMode }: Props) {
  const hasRevision = timeline.some((entry) => entry.status === "revision");

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Agent Timeline</h2>
          <p className="mt-0.5 text-xs text-slate-500">Parser to reviewer, with visible re-forge loop when coverage fails.</p>
        </div>
        <span className="rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1 font-mono text-xs text-slate-500">
          {providerMode}
        </span>
      </div>

      <div className="relative p-5">
        <div className="absolute left-8 right-8 top-12 hidden h-px bg-gradient-to-r from-emerald-400/10 via-emerald-400/45 to-emerald-400/10 md:block" />
        {hasRevision && (
          <div className="absolute right-[10%] top-[78px] hidden rounded-full border border-amber-400/40 px-3 py-1 text-[11px] font-medium text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.12)] md:block">
            Reviewer to Planner re-forge
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-5">
          {timeline.map((entry, i) => {
            const cfg = statusConfig[entry.status];
            const num = agentNumber[entry.agent] ?? i + 1;
            return (
              <div key={`${entry.agent}-${i}`} className="relative rounded-xl border border-white/10 bg-slate-950/55 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full border bg-slate-950 ${cfg.ring}`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                  </div>
                  <span className="font-mono text-xs text-slate-700">0{num}</span>
                </div>
                <div className="text-sm font-semibold text-slate-100">{entry.agent}</div>
                <div className={`mt-1 text-xs font-medium ${cfg.text}`}>{cfg.label}</div>
                {entry.message && <p className="mt-3 text-xs leading-5 text-slate-500">{entry.message}</p>}
              </div>
            );
          })}
        </div>

        {hasRevision && (
          <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-xs leading-6 text-amber-200">
            Revision triggered: the QA Reviewer found uncovered high-severity risk and sent the plan back through Test Planner and Test Writer for one targeted pass.
          </div>
        )}
      </div>
    </div>
  );
}
