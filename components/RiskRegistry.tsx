"use client";

import type { RiskItem } from "@/lib/schemas/analysis";

interface Props {
  risks: RiskItem[];
}

const severityConfig = {
  CRITICAL: {
    className: "bg-red-950/60 text-red-300 border-red-800/60",
    barClass: "bg-red-500",
    dotClass: "bg-red-400",
  },
  HIGH: {
    className: "bg-orange-950/60 text-orange-300 border-orange-800/60",
    barClass: "bg-orange-500",
    dotClass: "bg-orange-400",
  },
  MEDIUM: {
    className: "bg-yellow-950/60 text-yellow-300 border-yellow-800/60",
    barClass: "bg-yellow-500",
    dotClass: "bg-yellow-400",
  },
  LOW: {
    className: "bg-zinc-800/80 text-zinc-400 border-zinc-700",
    barClass: "bg-zinc-600",
    dotClass: "bg-zinc-500",
  },
};

export default function RiskRegistry({ risks }: Props) {
  const sorted = [...risks].sort((a, b) => {
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return order[a.severity] - order[b.severity];
  });

  const counts = {
    CRITICAL: risks.filter((r) => r.severity === "CRITICAL").length,
    HIGH: risks.filter((r) => r.severity === "HIGH").length,
    MEDIUM: risks.filter((r) => r.severity === "MEDIUM").length,
    LOW: risks.filter((r) => r.severity === "LOW").length,
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Risk Registry</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{risks.length} risks identified and ranked by severity</p>
        </div>
        <div className="flex items-center gap-2">
          {counts.CRITICAL > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800/50 text-red-300 font-medium">
              {counts.CRITICAL} critical
            </span>
          )}
          {counts.HIGH > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-950/60 border border-orange-800/50 text-orange-300 font-medium">
              {counts.HIGH} high
            </span>
          )}
        </div>
      </div>

      <div className="px-6 py-5 space-y-3">
        {sorted.map((risk) => {
          const cfg = severityConfig[risk.severity];
          return (
            <div
              key={risk.id}
              className="border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start gap-3 mb-2.5">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dotClass}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-mono text-zinc-600">{risk.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${cfg.className}`}>
                      {risk.severity}
                    </span>
                    <span className="text-sm font-semibold text-zinc-200">{risk.title}</span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{risk.description}</p>
                </div>
              </div>

              <div className="ml-4 flex flex-wrap gap-x-6 gap-y-1 text-xs">
                <span className="text-zinc-600">
                  <span className="text-zinc-500">Source: </span>{risk.sourceRef}
                </span>
                {risk.linkedTestIds.length > 0 ? (
                  <span className="text-zinc-600">
                    <span className="text-zinc-500">Tests: </span>
                    {risk.linkedTestIds.join(", ")}
                  </span>
                ) : (
                  <span className="text-amber-500/80 font-medium">No linked tests</span>
                )}
              </div>

              {risk.whyItMatters && (
                <p className="ml-4 text-xs text-zinc-600 mt-2 italic leading-relaxed">{risk.whyItMatters}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
