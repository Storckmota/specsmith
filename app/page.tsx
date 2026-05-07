"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EXAMPLE_SPECS } from "@/lib/example-specs";
import type { InputType, Framework } from "@/lib/schemas/analysis";

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
      <nav className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-zinc-100">SpecSmith</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-900 text-violet-300 font-medium">BETA</span>
          </div>
          <span className="text-sm text-zinc-500">AMD Developer Hackathon · SpecSmith PopLabs</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950 border border-violet-800 text-violet-300 text-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
          5-Agent QA Pipeline · AMD MI300X Ready
        </div>
        <h1 className="text-5xl font-bold text-zinc-50 mb-4 leading-tight">
          SpecSmith finds what your<br />team forgot to test.
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-4">
          Turn product specs, PRDs, and OpenAPI docs into risk-ranked test plans and executable test drafts using a multi-agent QA pipeline.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-zinc-500 mb-12">
          <span>Risk Registry</span>
          <span>·</span>
          <span>Test Matrix</span>
          <span>·</span>
          <span>Executable Tests</span>
          <span>·</span>
          <span>Coverage Score</span>
          <span>·</span>
          <span>Gap Report</span>
        </div>
      </section>

      {/* Input Section */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          {/* Example Buttons */}
          <div>
            <p className="text-sm text-zinc-500 mb-2 font-medium">Load an example</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(EXAMPLE_SPECS) as Array<keyof typeof EXAMPLE_SPECS>).map((key) => (
                <button
                  key={key}
                  onClick={() => handleLoadExample(key)}
                  className="px-3 py-1.5 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors border border-zinc-700"
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
              className="w-full h-64 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent font-mono"
            />
            <p className="text-xs text-zinc-600 mt-1">{specText.length} / 50000 characters</p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-end justify-between">
            <div className="flex gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1 font-medium">Input Type</label>
                <select
                  value={inputType}
                  onChange={(e) => setInputType(e.target.value as InputType)}
                  className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
                >
                  <option value="plain_spec">Plain Spec</option>
                  <option value="prd">PRD</option>
                  <option value="openapi">OpenAPI</option>
                  <option value="github_issue">GitHub Issue</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1 font-medium">Test Framework</label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value as Framework)}
                  className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-600"
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
              className="px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold transition-colors text-sm"
            >
              {isLoading ? "Running pipeline..." : "Analyze Spec"}
            </button>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-950 border border-red-800 text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-zinc-300 mb-6 text-center">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { name: "Spec Parser", desc: "Extracts stories, rules, endpoints, assumptions" },
              { name: "Risk Mapper", desc: "Flags ambiguous reqs, missing validations, abuse cases" },
              { name: "Test Planner", desc: "Builds structured test matrix across 6 categories" },
              { name: "Test Writer", desc: "Generates executable Playwright, Jest, or Pytest tests" },
              { name: "QA Reviewer", desc: "Scores coverage, finds gaps, triggers revision if needed" },
            ].map((agent, i) => (
              <div key={agent.name} className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                {i < 4 && (
                  <div className="hidden md:block absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-10 w-3 h-3 rotate-45 border-t-2 border-r-2 border-zinc-700" />
                )}
                <div className="text-xs font-mono text-violet-400 mb-1">Agent {i + 1}</div>
                <div className="text-sm font-semibold text-zinc-200 mb-1">{agent.name}</div>
                <div className="text-xs text-zinc-500">{agent.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-zinc-600 mt-4">
            The QA Reviewer includes a feedback loop: if HIGH/CRITICAL risks are uncovered, it triggers one revision pass.
          </p>
        </div>
      </section>
    </div>
  );
}
