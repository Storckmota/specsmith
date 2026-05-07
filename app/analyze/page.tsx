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
        <div className="text-zinc-500 text-sm">Loading analysis...</div>
      </div>
    );
  }

  const criticalCount = result.riskRegistry.filter((r) => r.severity === "CRITICAL").length;
  const highCount = result.riskRegistry.filter((r) => r.severity === "HIGH").length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4 sticky top-0 bg-zinc-950 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <span className="text-lg font-bold text-zinc-100">SpecSmith</span>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-600">
              {result.riskRegistry.length} risks · {result.testMatrix.length} tests
            </span>
            <button
              onClick={() => router.push("/")}
              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors"
            >
              ← New Analysis
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-zinc-100">{result.summary.title}</h1>
              <p className="text-sm text-zinc-400 mt-1">{result.summary.detectedScope}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {result.summary.inputType.replace("_", " ")}
                </span>
                {result.coverage.plannerRevised && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                    QA revision triggered
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
                <div className="text-xs text-zinc-600">CRITICAL</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">{highCount}</div>
                <div className="text-xs text-zinc-600">HIGH</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-violet-400">{result.testMatrix.length}</div>
                <div className="text-xs text-zinc-600">TESTS</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">{result.coverage.score}</div>
                <div className="text-xs text-zinc-600">SCORE</div>
              </div>
            </div>
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
        <div className="text-center text-xs text-zinc-700 pb-8">
          SpecSmith · AMD Developer Hackathon · SpecSmith PopLabs
        </div>
      </main>
    </div>
  );
}
