"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EXAMPLE_SPECS } from "@/lib/example-specs";
import type { InputType, Framework } from "@/lib/schemas/analysis";

const PIPELINE_AGENTS = [
  { name: "Spec Parser", desc: "Extracts stories, rules, endpoints, assumptions" },
  { name: "Risk Mapper", desc: "Flags ambiguous reqs, missing validations, abuse cases" },
  { name: "Test Planner", desc: "Builds structured test matrix across 6 categories" },
  { name: "Test Writer", desc: "Generates executable Playwright, Jest, or Pytest code" },
  { name: "QA Reviewer", desc: "Scores coverage, finds gaps, triggers revision if needed" },
];

const FEATURE_TAGS = [
  "5-Agent Workflow",
  "Risk Registry",
  "Executable Tests",
  "Coverage Score",
  "AMD MI300X Ready",
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-800/80 px-6 py-4 bg-zinc-950/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-zinc-100 tracking-tight">SpecSmith</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-900/60 border border-violet-700/50 text-violet-300 font-medium">BETA</span>
          </div>
          <span className="text-xs text-zinc-600 hidden sm:block">AMD Developer Hackathon · PopLabs</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-950/60 border border-violet-800/50 text-violet-300 text-xs font-medium mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse flex-shrink-0" />
          5-Agent QA Pipeline · AMD MI300X Ready
        </div>

        <h1 className="text-5xl font-bold text-zinc-50 mb-4 leading-tight tracking-tight">
          SpecSmith finds what your<br />team forgot to test.
        </h1>

        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-6 leading-relaxed">
          Turn product specs, PRDs, and OpenAPI docs into risk-ranked test plans
          and executable test drafts — using a multi-agent QA pipeline.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {FEATURE_TAGS.map((feat) => (
            <span
              key={feat}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
              {feat}
            </span>
          ))}
        </div>
      </section>

      {/* Input Section */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-zinc-900 border border-zinc-700/70 rounded-2xl shadow-2xl shadow-violet-950/10 overflow-hidden">
          {/* Card header */}
          <div className="px-6 pt-5 pb-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-200">Analyze your spec</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Paste a product spec, PRD, GitHub issue, or OpenAPI document</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Example Buttons */}
            <div>
              <p className="text-xs text-zinc-500 mb-2.5 font-medium uppercase tracking-wide">Load an example</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(EXAMPLE_SPECS) as Array<keyof typeof EXAMPLE_SPECS>).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleLoadExample(key)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-750 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors border border-zinc-700 hover:border-violet-800/60 font-medium"
                  >
                    {EXAMPLE_SPECS[key].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div>
              <textarea
                value={specText}
                onChange={(e) => setSpecText(e.target.value)}
                placeholder="Paste your product spec, PRD, GitHub issue, or OpenAPI doc here..."
                className="w-full h-52 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-violet-600/40 focus:border-violet-700/70 font-mono leading-relaxed transition-colors"
              />
              <p className="text-xs text-zinc-700 mt-1.5 tabular-nums">{specText.length.toLocaleString()} / 50,000 characters</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-end justify-between">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 font-medium uppercase tracking-wide">Input Type</label>
                  <select
                    value={inputType}
                    onChange={(e) => setInputType(e.target.value as InputType)}
                    className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-600/40 focus:border-violet-700/70 cursor-pointer transition-colors min-w-[130px]"
                  >
                    <option value="plain_spec">Plain Spec</option>
                    <option value="prd">PRD</option>
                    <option value="openapi">OpenAPI</option>
                    <option value="github_issue">GitHub Issue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 font-medium uppercase tracking-wide">Test Framework</label>
                  <select
                    value={framework}
                    onChange={(e) => setFramework(e.target.value as Framework)}
                    className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-600/40 focus:border-violet-700/70 cursor-pointer transition-colors min-w-[130px]"
                  >
                    <option value="playwright">Playwright</option>
                    <option value="jest">Jest</option>
                    <option value="pytest">Pytest</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:border-zinc-700 text-white font-semibold transition-colors text-sm shadow-lg shadow-violet-900/25 border border-violet-500/70 disabled:shadow-none whitespace-nowrap"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-500 border-t-violet-400 animate-spin" />
                    Running pipeline…
                  </span>
                ) : (
                  "Analyze Spec →"
                )}
              </button>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-14">
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-zinc-200 mb-1.5">How it works</h2>
            <p className="text-sm text-zinc-500">
              Five specialized agents collaborate to turn your spec into a complete QA artifact.
            </p>
          </div>

          <div className="relative">
            {/* Connecting gradient line */}
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {PIPELINE_AGENTS.map((agent, i) => (
                <div
                  key={agent.name}
                  className={`relative flex flex-col items-center text-center p-4 rounded-xl border transition-colors ${
                    i === 4
                      ? "bg-violet-950/25 border-violet-800/50 hover:border-violet-700/70"
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-3 flex-shrink-0 ${
                      i === 4
                        ? "bg-violet-800/60 border-2 border-violet-600/60 text-violet-200"
                        : "bg-zinc-800 border-2 border-zinc-700 text-zinc-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="text-sm font-semibold text-zinc-200 mb-1 leading-snug">{agent.name}</div>
                  <div className="text-xs text-zinc-500 leading-relaxed">{agent.desc}</div>
                  {i === 4 && (
                    <span className="mt-2.5 text-xs px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-300">
                      Feedback loop
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-zinc-600 mt-5">
            If HIGH or CRITICAL risks are uncovered, the QA Reviewer triggers one targeted revision pass.
          </p>
        </div>
      </section>
    </div>
  );
}
