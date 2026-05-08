"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EXAMPLE_SPECS } from "@/lib/example-specs";
import type { InputType, Framework } from "@/lib/schemas/analysis";

const PIPELINE_AGENTS = [
  { name: "Spec Parser", desc: "Melts down the raw spec into user stories, rules, endpoints, assumptions, and constraints." },
  { name: "Risk Mapper", desc: "Finds hidden fractures: ambiguous requirements, validation gaps, abuse paths, and missing controls." },
  { name: "Test Planner", desc: "Blueprints the defense with happy paths, edge cases, negative tests, regression checks, and API validation." },
  { name: "Test Writer", desc: "Forges executable Playwright, Jest, or Pytest code from the approved matrix." },
  { name: "QA Reviewer", desc: "Inspects coverage. If HIGH or CRITICAL risk is exposed, the plan is re-forged once.", highlight: true },
];

const PROOF_CARDS = [
  ["5", "resident QA agents"],
  ["6", "test categories mapped"],
  ["1", "review loop for missed high risk"],
];

const TELEMETRY_LINES = [
  "Booting resident QA forge...",
  "Spec Parser: extracting scope and hidden assumptions.",
  "Risk Mapper: checking auth, abuse, validation, and edge paths.",
  "QA Reviewer: watching for uncovered HIGH and CRITICAL risk.",
];

export default function HomePage() {
  const router = useRouter();
  const [specText, setSpecText] = useState("");
  const [inputType, setInputType] = useState<InputType>("plain_spec");
  const [framework, setFramework] = useState<Framework>("playwright");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadExample = (key: keyof typeof EXAMPLE_SPECS) => {
    const example = EXAMPLE_SPECS[key];
    setSpecText(example.text);
    setInputType(example.inputType);
  };

  const handleAnalyze = async () => {
    if (!specText.trim()) {
      setError("Please enter a spec or load an example.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specText, inputType, framework }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Analysis failed");
      }

      const result = await response.json();
      sessionStorage.setItem("specsmith-result", JSON.stringify(result));
      router.push("/analyze");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.18),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0),#020617_82%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:42px_42px]" />
      </div>

      <nav className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/85 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <div>
              <div className="text-sm font-semibold tracking-tight text-white">SpecSmith</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-400">QA Forge</div>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-xs font-medium text-slate-500 md:flex">
            <a href="#process" className="transition-colors hover:text-slate-200">Process</a>
            <a href="#smith" className="transition-colors hover:text-slate-200">The Smith</a>
            <span>AMD Developer Hackathon</span>
          </div>
        </div>
      </nav>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-12 pt-12 text-center md:pt-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/5 px-3 py-1.5 text-xs font-medium text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.12)]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            Resident QA agent online
          </div>

          <h1 className="mx-auto max-w-4xl text-balance text-5xl font-semibold tracking-tight text-white md:text-7xl">
            Find What Your Team Forgot To Test.
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-pretty text-base leading-8 text-slate-400 md:text-lg">
            SpecSmith is an autonomous QA forge. Drop in a PRD or API spec. Our resident AI blacksmith maps the risks,
            catches the edge cases, and hammers out an unbreakable, executable test matrix in seconds.
          </p>

          <div className="mx-auto mt-10 max-w-5xl text-left">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-emerald-950/20 backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">Spec Input Anvil</h2>
                  <p className="mt-1 text-xs text-slate-500">Insert raw product ore. The forge returns risk, tests, and code.</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 px-3 py-1 text-[11px] font-mono text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  pipeline-ready
                </div>
              </div>

              <div className="space-y-5 p-5 md:p-6">
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Load an example</p>
                    <p className="font-mono text-xs tabular-nums text-slate-600">{specText.length.toLocaleString()} / 50,000</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(EXAMPLE_SPECS) as Array<keyof typeof EXAMPLE_SPECS>).map((key) => (
                      <button
                        key={key}
                        onClick={() => handleLoadExample(key)}
                        className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:-translate-y-0.5 hover:border-emerald-400/40 hover:text-slate-100"
                      >
                        {EXAMPLE_SPECS[key].label}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={specText}
                  onChange={(e) => setSpecText(e.target.value)}
                  placeholder="Insert Raw Ore (Specs) Here..."
                  className="h-64 w-full resize-none rounded-xl border border-white/10 bg-slate-950/90 px-4 py-4 font-mono text-sm leading-7 text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-emerald-400/60 focus:ring-4 focus:ring-emerald-500/10"
                />

                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Input Type</span>
                      <select
                        value={inputType}
                        onChange={(e) => setInputType(e.target.value as InputType)}
                        className="w-full min-w-40 rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-500/10"
                      >
                        <option value="plain_spec">Plain Spec</option>
                        <option value="prd">PRD</option>
                        <option value="openapi">OpenAPI</option>
                        <option value="github_issue">GitHub Issue</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Test Framework</span>
                      <select
                        value={framework}
                        onChange={(e) => setFramework(e.target.value as Framework)}
                        className="w-full min-w-40 rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-500/10"
                      >
                        <option value="playwright">Playwright</option>
                        <option value="jest">Jest</option>
                        <option value="pytest">Pytest</option>
                      </select>
                    </label>
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-500 px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_28px_rgba(16,185,129,0.28)] transition hover:-translate-y-0.5 hover:bg-emerald-400 disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 animate-pulse rounded-sm border border-emerald-300 bg-emerald-400/30 rotate-45" />
                        Striking the anvil...
                      </span>
                    ) : (
                      "Forge Test Plan"
                    )}
                  </button>
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {PROOF_CARDS.map(([value, label]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-slate-900/55 px-5 py-4 text-left backdrop-blur">
                <div className="text-3xl font-semibold text-white">{value}</div>
                <div className="mt-1 text-sm text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="process" className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-7 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-400">The QA Forge</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">5 agents. 1 unbreakable test plan.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-6">
            {PIPELINE_AGENTS.map((agent, i) => (
              <div
                key={agent.name}
                className={`rounded-2xl border p-5 transition hover:-translate-y-1 ${
                  agent.highlight
                    ? "border-amber-400/40 bg-amber-500/10 shadow-[0_0_28px_rgba(245,158,11,0.08)] md:col-span-2"
                    : "border-white/10 bg-white/[0.045] hover:border-emerald-400/30 md:col-span-2"
                }`}
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-600">0{i + 1}</span>
                  {agent.highlight && (
                    <span className="rounded-full border border-amber-400/40 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                      Feedback loop
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-slate-100">{agent.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{agent.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="smith" className="mx-auto grid max-w-6xl gap-6 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-md">
            <div className="flex min-h-80 items-center justify-center rounded-xl border border-emerald-400/20 bg-slate-950/80">
              <div className="text-center">
                <BrandLogo size="lg" />
                <div className="mt-5 text-sm font-semibold text-slate-200">The Smith</div>
                <div className="mt-1 text-xs text-slate-600">Resident QA intelligence</div>
              </div>
            </div>
          </div>

          <TelemetryLog lines={TELEMETRY_LINES} />
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 pt-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/45 px-6 py-5 text-center">
            <p className="text-sm text-slate-400">Forged with AMD Instinct accelerators and Qwen Intelligence.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-medium text-slate-500">
              {["AMD", "Qwen", "Next.js", "TypeScript", "Tailwind"].map((item) => (
                <span key={item} className="rounded-full border border-white/10 px-3 py-1">{item}</span>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function BrandLogo({ size }: { size: "sm" | "lg" }) {
  const frame = size === "lg" ? "h-40 w-40" : "h-10 w-10";
  const image = size === "lg" ? "h-32 w-32" : "h-8 w-8";

  return (
    <div className={`mx-auto flex ${frame} items-center justify-center rounded-2xl border border-emerald-400/30 bg-slate-950/70 shadow-[0_0_34px_rgba(16,185,129,0.18)]`}>
      <img
        src="/brand/specsmith-logo.png"
        alt="SpecSmith logo"
        className={`${image} object-contain`}
      />
    </div>
  );
}

function TelemetryLog({ lines }: { lines: string[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-emerald-950/10">
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <span className="font-mono text-xs text-slate-600">smith.telemetry</span>
      </div>
      <div className="space-y-3 p-5 font-mono text-xs leading-6 text-slate-400">
        {lines.map((line, i) => (
          <div key={line} className="flex gap-3">
            <span className="text-emerald-400">{String(i + 1).padStart(2, "0")}</span>
            <span>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
