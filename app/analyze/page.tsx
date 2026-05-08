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

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -24px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function AnalyzePage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useReveal();

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
      <div className="flex min-h-screen items-center justify-center bg-[#060816]">
        <div className="w-full max-w-md rounded-2xl border border-[#202A44] bg-[#10172A] p-6 text-center shadow-2xl shadow-violet-950/20">
          <img src="/brand/specsmith-wordmark.svg" alt="SpecSmith" className="mx-auto mb-5 h-6 w-auto" />
          <p className="text-sm font-semibold text-slate-100">The Smith is examining the blueprint...</p>
          <p className="mt-1 text-xs text-slate-500">Heating the forge. Striking the anvil.</p>
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-[#202A44]">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-violet-600" />
          </div>
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#060816] text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.15),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <nav className="sticky top-0 z-20 border-b border-[#202A44] bg-[#060816]/90 px-6 py-3.5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button onClick={() => router.push("/")} className="group flex items-center gap-2.5 text-left">
            <img
              src="/brand/specsmith-wordmark.svg"
              alt="SpecSmith"
              className="h-[22px] w-auto"
              draggable={false}
            />
            <span className="hidden text-[9px] font-medium uppercase tracking-[0.28em] text-violet-400/60 transition-colors group-hover:text-violet-400 sm:block">
              Forge Report
            </span>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-violet-400/30 px-3 py-1 text-xs font-medium text-violet-300 sm:inline-flex">
              Forge Process Complete
            </span>
            <button
              onClick={() => router.push("/")}
              className="rounded-lg border border-[#202A44] bg-[#10172A] px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:-translate-y-0.5 hover:border-violet-400/40 hover:text-slate-100"
            >
              New Analysis
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl space-y-5 px-6 py-8">

        {/* Summary + Coverage Score */}
        <section data-reveal className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-2xl border border-[#202A44] bg-[#10172A] p-6">
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#202A44] bg-[#0B1020] px-2.5 py-1 text-xs font-medium text-slate-400">
                {inputTypeLabel[result.summary.inputType] ?? result.summary.inputType}
              </span>
              <span className="rounded-full border border-[#202A44] bg-[#0B1020] px-2.5 py-1 text-xs font-medium text-slate-400">
                {frameworkLabel[result.testFile?.framework ?? ""] ?? result.testFile?.framework}
              </span>
              <span className="rounded-full border border-[#202A44] bg-[#0B1020] px-2.5 py-1 font-mono text-xs text-slate-500">
                {result.providerMode}
              </span>
              {result.coverage.plannerRevised && (
                <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300">
                  QA revision triggered
                </span>
              )}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">{result.summary.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">{result.summary.detectedScope}</p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <StatCell label="Critical" value={criticalCount} valueClass="text-rose-300" />
              <StatCell label="High" value={highCount} valueClass="text-amber-300" />
              <StatCell label="Medium" value={mediumCount} valueClass="text-yellow-300" />
              <StatCell label="Risks" value={result.riskRegistry.length} valueClass="text-slate-200" />
              <StatCell label="Tests" value={result.testMatrix.length} valueClass="text-violet-300" />
            </div>
          </div>

          <CoverageScore coverage={result.coverage} />
        </section>

        {/* Agent Timeline */}
        <div data-reveal style={{ transitionDelay: "80ms" }}>
          <AgentProgress timeline={result.agentTimeline} providerMode={result.providerMode} />
        </div>

        {/* Gap / Risk + Test Matrix / Test File */}
        <section
          data-reveal
          style={{ transitionDelay: "120ms" }}
          className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]"
        >
          <div className="space-y-5">
            <GapReport coverage={result.coverage} />
            <RiskRegistry risks={result.riskRegistry} />
          </div>
          <div className="space-y-5">
            <TestMatrix tests={result.testMatrix} />
            <TestFileOutput testFile={result.testFile} />
          </div>
        </section>

        <div className="pb-6 text-center text-xs text-slate-700">
          SpecSmith QA Forge · PopLabs
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
    <div className="rounded-xl border border-[#202A44] bg-[#060816]/55 px-4 py-3 transition hover:-translate-y-0.5">
      <div className={`text-2xl font-semibold tabular-nums ${valueClass}`}>{value}</div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-600">{label}</div>
    </div>
  );
}
