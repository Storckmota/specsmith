"use client";

import { useState } from "react";
import type { TestCase, TestCategory } from "@/lib/schemas/analysis";

interface Props {
  tests: TestCase[];
}

const categoryConfig: Record<TestCategory, { label: string; className: string; dotClass: string }> = {
  happy_path: {
    label: "Happy Path",
    className: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
    dotClass: "bg-emerald-500",
  },
  edge_case: {
    label: "Edge Case",
    className: "bg-blue-950/60 text-blue-300 border-blue-800/60",
    dotClass: "bg-blue-500",
  },
  negative_case: {
    label: "Negative",
    className: "bg-orange-950/60 text-orange-300 border-orange-800/60",
    dotClass: "bg-orange-500",
  },
  regression: {
    label: "Regression",
    className: "bg-purple-950/60 text-purple-300 border-purple-800/60",
    dotClass: "bg-purple-500",
  },
  api_validation: {
    label: "API Validation",
    className: "bg-cyan-950/60 text-cyan-300 border-cyan-800/60",
    dotClass: "bg-cyan-500",
  },
  abuse_case: {
    label: "Abuse Case",
    className: "bg-red-950/60 text-red-300 border-red-800/60",
    dotClass: "bg-red-500",
  },
};

const priorityConfig = {
  HIGH: { className: "text-red-400 font-semibold", dot: "bg-red-500" },
  MEDIUM: { className: "text-yellow-400 font-medium", dot: "bg-yellow-500" },
  LOW: { className: "text-zinc-500", dot: "bg-zinc-600" },
};

export default function TestMatrix({ tests }: Props) {
  const [filter, setFilter] = useState<TestCategory | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const categories = [...new Set(tests.map((t) => t.category))];
  const filtered = filter === "all" ? tests : tests.filter((t) => t.category === filter);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Test Matrix</h2>
          <p className="mt-0.5 text-xs text-slate-500">{tests.length} test cases across {categories.length} categories</p>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 px-6 py-3.5">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs px-3 py-1 rounded-full border transition-colors font-medium ${
            filter === "all"
              ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-200"
              : "border-white/10 bg-slate-950/50 text-slate-500 hover:border-emerald-400/30 hover:text-slate-300"
          }`}
        >
          All ({tests.length})
        </button>
        {categories.map((cat) => {
          const cfg = categoryConfig[cat];
          const count = tests.filter((t) => t.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors font-medium ${
                filter === cat ? cfg.className : "border-white/10 bg-slate-950/50 text-slate-500 hover:border-emerald-400/30 hover:text-slate-300"
              }`}
            >
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Test list */}
      <div className="space-y-2 px-6 py-4">
        {filtered.map((test) => {
          const catCfg = categoryConfig[test.category];
          const priCfg = priorityConfig[test.priority];
          const isExpanded = expanded === test.id;
          return (
            <div
              key={test.id}
              className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/50 transition hover:border-emerald-400/25"
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : test.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.035]"
              >
                <span className="w-14 flex-shrink-0 text-right font-mono text-xs text-slate-600">{test.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${catCfg.className}`}>
                  {catCfg.label}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{test.title}</span>
                <span className={`text-xs flex-shrink-0 ${priCfg.className}`}>
                  {test.priority}
                </span>
                <svg
                  className={`h-3.5 w-3.5 flex-shrink-0 text-slate-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isExpanded && (
                <div className="border-t border-white/10 px-4 pb-4">
                  <div className="space-y-2.5 pt-3">
                    {[
                      { label: "Given", value: test.given },
                      { label: "When", value: test.when },
                      { label: "Then", value: test.then },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex gap-3">
                        <span className="mt-0.5 w-10 flex-shrink-0 text-xs font-semibold text-slate-500">{label}</span>
                        <span className="text-sm leading-relaxed text-slate-300">{value}</span>
                      </div>
                    ))}
                  </div>
                  {test.linkedRiskIds.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                      <span className="text-xs text-slate-600">Linked risks:</span>
                      {test.linkedRiskIds.map((id) => (
                        <span key={id} className="rounded border border-white/10 bg-slate-900 px-2 py-0.5 font-mono text-xs text-slate-500">
                          {id}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
