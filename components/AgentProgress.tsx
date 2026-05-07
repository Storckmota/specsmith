"use client";

import type { AnalysisResult } from "@/lib/schemas/analysis";

type TimelineEntry = AnalysisResult["agentTimeline"][number];

interface Props {
  timeline: TimelineEntry[];
  providerMode: string;
}

const statusConfig = {
  pending: { icon: "○", color: "text-zinc-600", bg: "bg-zinc-800" },
  running: { icon: "●", color: "text-violet-400 animate-pulse", bg: "bg-violet-950" },
  complete: { icon: "✓", color: "text-emerald-400", bg: "bg-emerald-950" },
  revision: { icon: "↻", color: "text-amber-400", bg: "bg-amber-950" },
};

const agentEmoji: Record<string, string> = {
  "Spec Parser": "📄",
  "Risk Mapper": "⚠️",
  "Test Planner": "📋",
  "Test Writer": "✍️",
  "QA Reviewer": "🔍",
};

export default function AgentProgress({ timeline, providerMode }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Agent Pipeline</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
          Provider: {providerMode}
        </span>
      </div>
      <div className="space-y-2">
        {timeline.map((entry, i) => {
          const cfg = statusConfig[entry.status];
          return (
            <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-lg ${cfg.bg} border border-zinc-800`}>
              <span className={`text-sm font-mono mt-0.5 ${cfg.color}`}>{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{agentEmoji[entry.agent] || "•"}</span>
                  <span className="text-sm font-medium text-zinc-200">{entry.agent}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-mono uppercase ${cfg.color}`}>
                    {entry.status}
                  </span>
                </div>
                {entry.message && (
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{entry.message}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
