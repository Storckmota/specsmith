"use client";

import type { RiskItem } from "@/lib/schemas/analysis";

interface Props {
  risks: RiskItem[];
}

const severityConfig = {
  CRITICAL: { label: "CRITICAL", className: "bg-red-950 text-red-300 border-red-800" },
  HIGH: { label: "HIGH", className: "bg-orange-950 text-orange-300 border-orange-800" },
  MEDIUM: { label: "MEDIUM", className: "bg-yellow-950 text-yellow-300 border-yellow-800" },
  LOW: { label: "LOW", className: "bg-zinc-800 text-zinc-400 border-zinc-700" },
};

export default function RiskRegistry({ risks }: Props) {
  const sorted = [...risks].sort((a, b) => {
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Risk Registry</h2>
        <span className="text-xs text-zinc-500">{risks.length} risks identified</span>
      </div>
      <div className="space-y-3">
        {sorted.map((risk) => {
          const cfg = severityConfig[risk.severity];
          return (
            <div key={risk.id} className="border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-zinc-500">{risk.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.className}`}>
                    {cfg.label}
                  </span>
                  <span className="text-sm font-medium text-zinc-200">{risk.title}</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-2">{risk.description}</p>
              <div className="flex flex-wrap gap-4 text-xs text-zinc-600">
                <span>
                  <span className="text-zinc-500">Source:</span> {risk.sourceRef}
                </span>
                {risk.linkedTestIds.length > 0 && (
                  <span>
                    <span className="text-zinc-500">Tests:</span>{" "}
                    {risk.linkedTestIds.join(", ")}
                  </span>
                )}
                {risk.linkedTestIds.length === 0 && (
                  <span className="text-amber-500">No linked tests</span>
                )}
              </div>
              <p className="text-xs text-zinc-600 mt-2 italic">{risk.whyItMatters}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
