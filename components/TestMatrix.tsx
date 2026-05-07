"use client";

import { useState } from "react";
import type { TestCase, TestCategory } from "@/lib/schemas/analysis";

interface Props {
  tests: TestCase[];
}

const categoryConfig: Record<TestCategory, { label: string; className: string }> = {
  happy_path: { label: "Happy Path", className: "bg-emerald-950 text-emerald-300 border-emerald-800" },
  edge_case: { label: "Edge Case", className: "bg-blue-950 text-blue-300 border-blue-800" },
  negative_case: { label: "Negative", className: "bg-orange-950 text-orange-300 border-orange-800" },
  regression: { label: "Regression", className: "bg-purple-950 text-purple-300 border-purple-800" },
  api_validation: { label: "API Validation", className: "bg-cyan-950 text-cyan-300 border-cyan-800" },
  abuse_case: { label: "Abuse Case", className: "bg-red-950 text-red-300 border-red-800" },
};

const priorityConfig = {
  HIGH: "text-red-400",
  MEDIUM: "text-yellow-400",
  LOW: "text-zinc-500",
};

export default function TestMatrix({ tests }: Props) {
  const [filter, setFilter] = useState<TestCategory | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const categories = [...new Set(tests.map((t) => t.category))];
  const filtered = filter === "all" ? tests : tests.filter((t) => t.category === filter);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Test Matrix</h2>
        <span className="text-xs text-zinc-500">{tests.length} test cases</span>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            filter === "all"
              ? "bg-zinc-700 border-zinc-600 text-zinc-200"
              : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300"
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
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                filter === cat ? cfg.className : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Test list */}
      <div className="space-y-2">
        {filtered.map((test) => {
          const cfg = categoryConfig[test.category];
          const isExpanded = expanded === test.id;
          return (
            <div
              key={test.id}
              className="border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : test.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <span className="text-xs font-mono text-zinc-600">{test.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.className}`}>
                  {cfg.label}
                </span>
                <span className="text-sm text-zinc-200 flex-1 min-w-0 truncate">{test.title}</span>
                <span className={`text-xs font-medium flex-shrink-0 ${priorityConfig[test.priority]}`}>
                  {test.priority}
                </span>
                <span className="text-zinc-600 text-xs">{isExpanded ? "▲" : "▼"}</span>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2 border-t border-zinc-800">
                  <div className="grid grid-cols-1 gap-2 pt-3">
                    {[
                      { label: "Given", value: test.given },
                      { label: "When", value: test.when },
                      { label: "Then", value: test.then },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex gap-3">
                        <span className="text-xs font-medium text-zinc-500 w-10 flex-shrink-0 mt-0.5">{label}</span>
                        <span className="text-sm text-zinc-300">{value}</span>
                      </div>
                    ))}
                  </div>
                  {test.linkedRiskIds.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {test.linkedRiskIds.map((id) => (
                        <span key={id} className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono">
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
