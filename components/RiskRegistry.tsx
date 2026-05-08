"use client";

import type { RiskItem } from "@/lib/schemas/analysis";

interface Props {
  risks: RiskItem[];
}

const severityConfig = {
  CRITICAL: {
    className: "text-rose-200 border-rose-400/60 shadow-[0_0_14px_rgba(244,63,94,0.18)]",
    dotClass: "bg-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.75)]",
  },
  HIGH: {
    className: "text-amber-200 border-amber-400/60 shadow-[0_0_14px_rgba(245,158,11,0.16)]",
    dotClass: "bg-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.7)]",
  },
  MEDIUM: {
    className: "text-yellow-200 border-yellow-400/45",
    dotClass: "bg-yellow-400",
  },
  LOW: {
    className: "text-slate-400 border-slate-600",
    dotClass: "bg-slate-500",
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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Risk Registry</h2>
          <p className="mt-0.5 text-xs text-slate-500">{risks.length} risks identified and ranked by severity</p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          {counts.CRITICAL > 0 && (
            <span className="rounded-full border border-rose-400/50 px-2 py-0.5 text-xs font-medium text-rose-200">
              {counts.CRITICAL} critical
            </span>
          )}
          {counts.HIGH > 0 && (
            <span className="rounded-full border border-amber-400/50 px-2 py-0.5 text-xs font-medium text-amber-200">
              {counts.HIGH} high
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 px-6 py-5">
        {sorted.map((risk) => {
          const cfg = severityConfig[risk.severity];
          return (
            <div
              key={risk.id}
              className="rounded-xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-emerald-400/25"
            >
              <div className="mb-2.5 flex items-start gap-3">
                <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${cfg.dotClass}`} />
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-slate-600">{risk.id}</span>
                    <span className={`rounded-full border bg-transparent px-2 py-0.5 text-xs font-semibold ${cfg.className}`}>
                      {risk.severity}
                    </span>
                    <span className="text-sm font-semibold text-slate-100">{risk.title}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-400">{risk.description}</p>
                </div>
              </div>

              <div className="ml-4 flex flex-wrap gap-x-6 gap-y-1 text-xs">
                <span className="text-slate-600">
                  <span className="text-slate-500">Source: </span>{risk.sourceRef}
                </span>
                {risk.linkedTestIds.length > 0 ? (
                  <span className="text-slate-600">
                    <span className="text-slate-500">Tests: </span>
                    {risk.linkedTestIds.join(", ")}
                  </span>
                ) : (
                  <span className="font-medium text-amber-300">No linked tests</span>
                )}
              </div>

              {risk.whyItMatters && (
                <p className="ml-4 mt-2 text-xs italic leading-relaxed text-slate-600">{risk.whyItMatters}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
