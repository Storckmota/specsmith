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
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Test Matrix</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{tests.length} test cases across {categories.length} categories</p>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 px-6 py-3.5 border-b border-zinc-800/60">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs px-3 py-1 rounded-full border transition-colors font-medium ${
            filter === "all"
              ? "bg-zinc-700 border-zinc-600 text-zinc-200"
              : "bg-zinc-800/60 border-zinc-700/60 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
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
                filter === cat ? cfg.className : "bg-zinc-800/60 border-zinc-700/60 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
              }`}
            >
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Test list */}
      <div className="px-6 py-4 space-y-2">
        {filtered.map((test) => {
          const catCfg = categoryConfig[test.category];
          const priCfg = priorityConfig[test.priority];
          const isExpanded = expanded === test.id;
          return (
            <div
              key={test.id}
              className="border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : test.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/30 transition-colors"
              >
                <span className="text-xs font-mono text-zinc-600 flex-shrink-0 w-14 text-right">{test.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${catCfg.className}`}>
                  {catCfg.label}
                </span>
                <span className="text-sm text-zinc-200 flex-1 min-w-0 truncate">{test.title}</span>
                <span className={`text-xs flex-shrink-0 ${priCfg.className}`}>
                  {test.priority}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-zinc-600 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-zinc-800">
                  <div className="space-y-2.5 pt-3">
                    {[
                      { label: "Given", value: test.given },
                      { label: "When", value: test.when },
                      { label: "Then", value: test.then },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex gap-3">
                        <span className="text-xs font-semibold text-zinc-500 w-10 flex-shrink-0 mt-0.5">{label}</span>
                        <span className="text-sm text-zinc-300 leading-relaxed">{value}</span>
                      </div>
                    ))}
                  </div>
                  {test.linkedRiskIds.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t border-zinc-800/60">
                      <span className="text-xs text-zinc-600">Linked risks:</span>
                      {test.linkedRiskIds.map((id) => (
                        <span key={id} className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono border border-zinc-700">
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
