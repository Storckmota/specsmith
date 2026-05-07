"use client";

import type { AnalysisResult } from "@/lib/schemas/analysis";

type TimelineEntry = AnalysisResult["agentTimeline"][number];

interface Props {
  timeline: TimelineEntry[];
  providerMode: string;
}

const statusConfig = {
  pending: {
    icon: (
      <span className="w-2 h-2 rounded-full bg-zinc-700 inline-block" />
    ),
    rowClass: "bg-zinc-900 border-zinc-800",
    labelClass: "text-zinc-600",
    label: "pending",
  },
  running: {
    icon: (
      <span className="w-2 h-2 rounded-full bg-violet-500 inline-block animate-pulse" />
    ),
    rowClass: "bg-violet-950/20 border-violet-800/40",
    labelClass: "text-violet-400",
    label: "running",
  },
  complete: {
    icon: (
      <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    rowClass: "bg-zinc-900 border-zinc-800",
    labelClass: "text-emerald-400",
    label: "complete",
  },
  revision: {
    icon: (
      <svg className="w-4 h-4 text-amber-400" viewBox="0 0 16 16" fill="none">
        <path
          d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.8 0 3.4.87 4.4 2.2M13.5 2.5v2.5H11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    rowClass: "bg-amber-950/20 border-amber-800/40",
    labelClass: "text-amber-400",
    label: "revision",
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
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Agent Pipeline</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Real-time execution trace</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-mono">
          {providerMode}
        </span>
      </div>

      <div className="divide-y divide-zinc-800/60">
        {timeline.map((entry, i) => {
          const cfg = statusConfig[entry.status];
          const num = agentNumber[entry.agent];
          return (
            <div
              key={i}
              className={`flex items-start gap-4 px-6 py-3.5 transition-colors ${cfg.rowClass}`}
            >
              {/* Step number */}
              <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono text-zinc-500">
                  {num ?? i + 1}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-sm font-semibold text-zinc-200">{entry.agent}</span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${
                      entry.status === "complete"
                        ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-400"
                        : entry.status === "revision"
                        ? "bg-amber-950/40 border-amber-800/40 text-amber-400"
                        : entry.status === "running"
                        ? "bg-violet-950/40 border-violet-800/40 text-violet-400"
                        : "bg-zinc-800 border-zinc-700 text-zinc-500"
                    }`}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </div>
                {entry.message && (
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{entry.message}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
