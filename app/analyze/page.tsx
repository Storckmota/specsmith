"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult } from "@/lib/schemas/analysis";
import AgentProgress from "@/components/AgentProgress";
import RiskRegistry from "@/components/RiskRegistry";
import TestMatrix from "@/components/TestMatrix";
import TestFileOutput from "@/components/TestFileOutput";
import CoverageScore from "@/components/CoverageScore";
import GapReport from "@/components/GapReport";

export default function AnalyzePage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("specsmith-result");
    if (!stored) {
      router.push("/");
      return;
    }
    try {
      setResult(JSON.parse(stored));
    } catch {
      router.push("/");
    }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-violet-500 animate-spin" />
          <p className="text-zinc-500 text-sm">Loading analysis…</p>
        </div>
      </div>
    );
  }

  const criticalCount = result.riskRegistry.filter((r) => r.severity === "CRITICAL").length;
  const highCount = result.riskRegistry.filter((r) => r.severity === "HIGH").length;
  const mediumCount = result.riskRegistry.filter((r) => r.severity === "MEDIUM").length;

  const frameworkLabel: Record<string, string> = {
    playwright: "Playwright",
    jest: "Jest",
    pytest: "Pytest",
  };

  const inputTypeLabel: Record<string, string> = {
    plain_spec: "Plain Spec",
    prd: "PRD",
    openapi: "OpenAPI",
    github_issue: "GitHub Issue",
  };

  const scoreColor =
    result.coverage.score >= 80
      ? "text-emerald-400"
      : result.coverage.score >= 60
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-800/80 px-6 py-4 sticky top-0 bg-zinc-950/95 backdrop-blur z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 group"
          >
            <span className="text-lg font-bold text-zinc-100 tracking-tight">SpecSmith</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-900/60 border border-violet-700/50 text-violet-300 font-medium">BETA</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-600 hidden sm:block">
              {result.riskRegistry.length} risks · {result.testMatrix.length} tests · score {result.coverage.score}/100
            </span>
            <button
              onClick={() => router.push("/")}
              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-700"
            >
              ← New Analysis
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-5">

        {/* Summary Card */}
        <div className="bg-zinc-900 border border-zinc-700/70 rounded-2xl overflow-hidden">
          {/* Title row */}
          <div className="px-6 pt-5 pb-4 border-b border-zinc-800">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-zinc-100 leading-tight">{result.summary.title}</h1>
                <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{result.summary.detectedScope}</p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-medium">
                  {inputTypeLabel[result.summary.inputType] ?? result.summary.inputType}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 font-medium">
                  {frameworkLabel[result.testFile?.framework ?? ""] ?? result.testFile?.framework}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700 font-mono">
                  {result.providerMode}
                </span>
                {result.coverage.plannerRevised && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 font-medium">
                    QA revision triggered
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-zinc-800">
            <StatCell label="CRITICAL" value={criticalCount} valueClass="text-red-400" />
            <StatCell label="HIGH" value={highCount} valueClass="text-orange-400" />
            <StatCell label="MEDIUM" value={mediumCount} valueClass="text-yellow-400" />
            <StatCell label="TOTAL RISKS" value={result.riskRegistry.length} valueClass="text-zinc-300" />
            <StatCell label="TESTS" value={result.testMatrix.length} valueClass="text-violet-400" />
            <StatCell label="SCORE" value={`${result.coverage.score}/100`} valueClass={scoreColor} />
          </div>
        </div>

        {/* Agent Pipeline */}
        <AgentProgress timeline={result.agentTimeline} providerMode={result.providerMode} />

        {/* Coverage Score */}
        <CoverageScore coverage={result.coverage} />

        {/* Risk Registry */}
        <RiskRegistry risks={result.riskRegistry} />

        {/* Test Matrix */}
        <TestMatrix tests={result.testMatrix} />

        {/* Test File */}
        <TestFileOutput testFile={result.testFile} />

        {/* Gap Report */}
        <GapReport coverage={result.coverage} />

        {/* Footer */}
        <div className="text-center text-xs text-zinc-700 pb-6">
          SpecSmith · AMD Developer Hackathon · PopLabs
        </div>
      </main>
    </div>
  );
}

function StatCell({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string | number;
  valueClass: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-4 px-3 text-center">
      <div className={`text-2xl font-bold tabular-nums ${valueClass}`}>{value}</div>
      <div className="text-xs text-zinc-600 font-medium tracking-wide mt-0.5">{label}</div>
    </div>
  );
}
