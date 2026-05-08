"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EXAMPLE_SPECS } from "@/lib/example-specs";
import type { InputType, Framework } from "@/lib/schemas/analysis";

// ── Data ────────────────────────────────────────────────────────────────────

const PIPELINE_AGENTS = [
  {
    n: "01",
    name: "Spec Parser",
    desc: "Melts raw specs into structured scope — user stories, rules, endpoints, assumptions, constraints.",
  },
  {
    n: "02",
    name: "Risk Mapper",
    desc: "Finds hidden fractures: ambiguous requirements, validation gaps, abuse paths, undefined error behavior.",
  },
  {
    n: "03",
    name: "Test Planner",
    desc: "Blueprints the defense across happy paths, edge cases, negatives, regression, API validation, and abuse.",
  },
  {
    n: "04",
    name: "Test Writer",
    desc: "Forges executable Playwright, Jest, or Pytest code directly from the approved test matrix.",
  },
  {
    n: "05",
    name: "QA Reviewer",
    desc: "Inspects coverage. Scores completeness. Triggers one targeted revision pass if HIGH or CRITICAL risk is exposed.",
    highlight: true,
  },
];

const BENEFIT_CARDS = [
  {
    title: "Risk-Ranked Findings",
    body: "Every risk is scored CRITICAL / HIGH / MEDIUM / LOW and tied back to the originating spec section.",
    accent: "text-rose-400",
    border: "hover:border-rose-400/25",
  },
  {
    title: "Structured Test Matrix",
    body: "Six categories per run: happy path, edge case, negative, regression, API validation, and abuse case.",
    accent: "text-blue-400",
    border: "hover:border-blue-400/25",
  },
  {
    title: "Executable Test Drafts",
    body: "Playwright, Jest, or Pytest code generated directly from the structured test matrix, ready to run.",
    accent: "text-violet-400",
    border: "hover:border-violet-400/25",
  },
  {
    title: "Coverage Gap Report",
    body: "Explicit gap list: which HIGH and CRITICAL risks still need test coverage after the full review pass.",
    accent: "text-amber-400",
    border: "hover:border-amber-400/25",
  },
];

const TELEMETRY_LINES = [
  { ts: "00:00", msg: "Resident QA forge initializing...", style: "text-violet-400" },
  { ts: "00:01", msg: "Spec Parser active — extracting scope and implicit assumptions.", style: "text-slate-400" },
  { ts: "00:03", msg: "Risk Mapper scanning auth, validation gaps, edge paths, abuse vectors.", style: "text-slate-400" },
  { ts: "00:07", msg: "Test Planner constructing matrix across 6 test categories.", style: "text-slate-400" },
  { ts: "00:12", msg: "Test Writer forging executable test code.", style: "text-slate-400" },
  { ts: "00:15", msg: "QA Reviewer inspecting coverage against all HIGH/CRITICAL risks.", style: "text-slate-400" },
  { ts: "00:16", msg: "Coverage gap detected — triggering targeted revision pass.", style: "text-amber-300" },
  { ts: "00:19", msg: "Revision complete. Final score committed.", style: "text-violet-300" },
];

const PROOF_CHIPS = [
  "5-Agent Workflow",
  "Risk Registry",
  "Executable Tests",
  "Coverage Score",
  "AMD MI300X Ready",
];

const NAV_LINKS = [
  { label: "Home",      href: "/" },
  { label: "Forge",     href: "#forge" },
  { label: "Process",   href: "#process" },
  { label: "Report",    href: "/analyze" },
  { label: "The Smith", href: "#smith" },
];

// ── Scroll reveal hook ───────────────────────────────────────────────────────

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { threshold: 0.07, rootMargin: "0px 0px -32px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── SVG Wordmark ─────────────────────────────────────────────────────────────

function Wordmark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/specsmith-wordmark.svg"
      alt="SpecSmith"
      className={className ?? "h-6 w-auto"}
      draggable={false}
    />
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [specText, setSpecText] = useState("");
  const [inputType, setInputType] = useState<InputType>("plain_spec");
  const [framework, setFramework] = useState<Framework>("playwright");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useReveal();

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
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specText, inputType, framework }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }
      const result = await res.json();
      sessionStorage.setItem("specsmith-result", JSON.stringify(result));
      router.push("/analyze");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#060816] text-slate-100">

      {/* ── Background atmosphere ──────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Top purple radial */}
        <div className="absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(124,58,237,0.18),transparent_70%)]" />
        {/* Subtle dot grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:52px_52px]" />
        {/* Left ambient glow */}
        <div className="absolute left-0 top-0 h-full w-80 bg-[radial-gradient(ellipse_at_0%_20%,rgba(124,58,237,0.07),transparent_65%)]" />
        {/* Right ambient glow */}
        <div className="absolute right-0 top-0 h-full w-80 bg-[radial-gradient(ellipse_at_100%_20%,rgba(59,130,246,0.05),transparent_65%)]" />
        {/* Bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#060816]/80 to-transparent" />
      </div>

      {/* ── Sticky Navbar ──────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 border-b border-[#202A44] bg-[#060816]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3.5">

          {/* Wordmark */}
          <a href="/" className="group flex flex-shrink-0 items-center gap-2.5">
            <Wordmark className="h-[22px] w-auto" />
            <span className="hidden text-[9px] font-medium uppercase tracking-[0.28em] text-violet-400/60 transition-colors group-hover:text-violet-400 sm:block">
              QA Forge
            </span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-5 text-[13px] font-medium md:flex">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-slate-500 transition-colors hover:text-slate-200"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Desktop CTA + mobile hamburger */}
          <div className="flex items-center gap-3">
            <a
              href="#forge"
              className="hidden flex-shrink-0 items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-600/15 px-4 py-2 text-xs font-semibold text-violet-300 transition hover:-translate-y-0.5 hover:border-violet-400/60 hover:bg-violet-600/25 md:inline-flex"
            >
              Run Analysis
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#202A44] text-slate-400 transition hover:border-violet-500/40 hover:text-slate-100 md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-[#202A44] bg-[#0B1020]/95 px-6 py-4 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-violet-500/10 hover:text-slate-100"
                >
                  {label}
                </a>
              ))}
              <a
                href="#forge"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 rounded-xl bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition hover:bg-violet-500"
              >
                Run Analysis
              </a>
            </div>
          </div>
        )}
      </nav>

      <main>

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 pb-10 pt-14 md:pt-24">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">

            {/* Left: headline block */}
            <div className="max-w-2xl">

              <div
                data-reveal
                style={{ transitionDelay: "0ms" }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 text-xs font-medium text-violet-300"
              >
                <span className="h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.9)]" />
                Resident QA agent online
              </div>

              <h1
                data-reveal
                style={{ transitionDelay: "70ms" }}
                className="text-balance text-[2rem] font-semibold leading-[1.1] tracking-tight text-white md:text-[2.8rem] lg:text-[3.4rem]"
              >
                Find What Your Team Forgot To Test.
              </h1>

              <p
                data-reveal
                style={{ transitionDelay: "150ms" }}
                className="mt-5 max-w-lg text-pretty text-[15px] leading-8 text-slate-400"
              >
                Turn PRDs, API specs, and GitHub issues into risk-ranked findings,
                executable test drafts, and coverage gap reports — using a 5-agent
                QA pipeline designed for AMD MI300X.
              </p>

              <div
                data-reveal
                style={{ transitionDelay: "220ms" }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <a
                  href="#forge"
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-7 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(124,58,237,0.35)] transition hover:-translate-y-0.5 hover:bg-violet-500"
                >
                  Run QA Analysis
                </a>
                <a
                  href="#process"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3 text-sm font-medium text-slate-300 transition hover:-translate-y-0.5 hover:border-white/20 hover:text-white"
                >
                  See how it works
                </a>
              </div>

              <div
                data-reveal
                style={{ transitionDelay: "300ms" }}
                className="mt-7 flex flex-wrap gap-2"
              >
                {PROOF_CHIPS.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.04] px-3 py-1 text-xs text-slate-400"
                  >
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-500/70" />
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: mascot */}
            <div
              data-reveal
              style={{ transitionDelay: "100ms" }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-[280px] lg:max-w-none">
                {/* Glow behind mascot */}
                <div className="absolute inset-0 scale-110 rounded-full bg-violet-600/10 blur-3xl" />
                <div className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-b from-[#10172A]/80 to-[#060816]/90 p-8 shadow-2xl shadow-violet-950/40 backdrop-blur-md">
                  <img
                    src="/brand/specsmith-logo.png"
                    alt="The Smith — SpecSmith mascot"
                    className="mx-auto h-44 w-44 object-contain sm:h-52 sm:w-52 md:h-64 md:w-64"
                    draggable={false}
                  />
                  <div className="mt-4 border-t border-white/[0.07] pt-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">The Smith</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600">Resident QA Intelligence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Forge Input ────────────────────────────────────────────── */}
        <section id="forge" className="mx-auto max-w-6xl px-6 py-10">
          <div
            data-reveal
            className="overflow-hidden rounded-2xl border border-[#202A44] bg-[#10172A] shadow-2xl shadow-violet-950/15"
          >
            {/* Card header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#202A44] px-6 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">Spec Input Anvil</h2>
                <p className="mt-0.5 text-xs text-slate-500">Insert raw spec ore. The forge returns risk, tests, and coverage.</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-violet-500/25 px-3 py-1 font-mono text-[11px] text-violet-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                pipeline-ready
              </div>
            </div>

            <div className="space-y-5 p-6">
              {/* Example buttons */}
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Load an example</p>
                  <p className="font-mono text-xs tabular-nums text-slate-700">{specText.length.toLocaleString()} / 50,000</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(EXAMPLE_SPECS) as Array<keyof typeof EXAMPLE_SPECS>).map((key) => (
                    <button
                      key={key}
                      onClick={() => handleLoadExample(key)}
                      className="rounded-full border border-[#202A44] bg-[#0B1020] px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:-translate-y-0.5 hover:border-violet-500/40 hover:text-slate-100"
                    >
                      {EXAMPLE_SPECS[key].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={specText}
                onChange={(e) => setSpecText(e.target.value)}
                placeholder="Paste your product spec, PRD, GitHub issue, or OpenAPI doc here..."
                className="h-56 w-full resize-none rounded-xl border border-[#202A44] bg-[#060816]/80 px-4 py-4 font-mono text-sm leading-7 text-slate-200 outline-none placeholder:text-slate-700 transition focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10"
              />

              {/* Controls */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Input Type</span>
                    <select
                      value={inputType}
                      onChange={(e) => setInputType(e.target.value as InputType)}
                      className="w-full min-w-40 rounded-xl border border-[#202A44] bg-[#0B1020] px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-violet-500/40 focus:ring-4 focus:ring-violet-500/10"
                    >
                      <option value="plain_spec">Plain Spec</option>
                      <option value="prd">PRD</option>
                      <option value="openapi">OpenAPI</option>
                      <option value="github_issue">GitHub Issue</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-slate-500">Test Framework</span>
                    <select
                      value={framework}
                      onChange={(e) => setFramework(e.target.value as Framework)}
                      className="w-full min-w-40 rounded-xl border border-[#202A44] bg-[#0B1020] px-3 py-2.5 text-sm text-slate-200 outline-none transition focus:border-violet-500/40 focus:ring-4 focus:ring-violet-500/10"
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
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-8 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.3)] transition hover:-translate-y-0.5 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-700 border-t-violet-400" />
                      Forging test plan...
                    </>
                  ) : (
                    "Forge Test Plan →"
                  )}
                </button>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-400/30 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Benefit Cards ──────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFIT_CARDS.map((card, i) => (
              <div
                key={card.title}
                data-reveal
                style={{ transitionDelay: `${i * 55}ms` }}
                className={`rounded-2xl border border-[#202A44] bg-[#10172A] p-5 transition hover:-translate-y-1 hover:border-[#2B3560] ${card.border}`}
              >
                <div className={`mb-3 text-xs font-semibold uppercase tracking-[0.2em] ${card.accent}`}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-sm font-semibold text-slate-100">{card.title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Process Section ────────────────────────────────────────── */}
        <section id="process" className="mx-auto max-w-6xl px-6 py-14">
          <div data-reveal className="mb-10 max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-violet-400">The QA Forge</p>
            <h2 className="mt-3 text-[1.9rem] font-semibold tracking-tight text-white">5 agents. 1 unbreakable test plan.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Every spec passes through five specialized agents in sequence.
              The QA Reviewer closes the feedback loop.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PIPELINE_AGENTS.map((agent, i) => (
              <div
                key={agent.name}
                data-reveal
                style={{ transitionDelay: `${i * 55}ms` }}
                className={`relative rounded-2xl border p-5 transition hover:-translate-y-1 ${
                  agent.highlight
                    ? "border-amber-400/35 bg-amber-500/10 shadow-[0_0_28px_rgba(245,158,11,0.06)]"
                    : "border-[#202A44] bg-[#10172A] hover:border-violet-500/30"
                }`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <span className="font-mono text-sm text-slate-700">{agent.n}</span>
                  {agent.highlight && (
                    <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                      Revision loop
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-100">{agent.name}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">{agent.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── The Smith ──────────────────────────────────────────────── */}
        <section id="smith" className="mx-auto max-w-6xl px-6 py-14">
          <div data-reveal className="mb-8 max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-violet-400">Resident Intelligence</p>
            <h2 className="mt-3 text-[1.9rem] font-semibold tracking-tight text-white">The Smith.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              A persistent QA entity that watches your spec. It knows what was tested,
              what was missed, and what will cause production incidents.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            {/* Mascot */}
            <div
              data-reveal
              style={{ transitionDelay: "80ms" }}
              className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-violet-500/20 bg-[#0B1020] p-8 text-center"
            >
              <div className="relative">
                <div className="absolute inset-0 scale-[1.4] rounded-full bg-violet-600/10 blur-3xl" />
                <img
                  src="/brand/specsmith-logo.png"
                  alt="The Smith — SpecSmith resident intelligence"
                  className="relative h-44 w-44 object-contain"
                  draggable={false}
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-100">The Smith</div>
                <div className="mt-1 text-xs text-slate-600">Autonomous QA Entity</div>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3.5 py-1.5 text-xs text-violet-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                Online · Watching
              </div>
            </div>

            {/* Telemetry */}
            <div
              data-reveal
              style={{ transitionDelay: "160ms" }}
              className="overflow-hidden rounded-2xl border border-[#202A44] bg-[#060816] shadow-2xl shadow-violet-950/10"
            >
              <div className="flex items-center justify-between border-b border-[#202A44] bg-[#0B1020]/60 px-5 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-500/70" />
                </div>
                <span className="font-mono text-xs text-slate-600">smith.telemetry — live feed</span>
              </div>
              <div className="space-y-2.5 p-5 font-mono text-xs leading-6">
                {TELEMETRY_LINES.map((line, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="flex-shrink-0 text-slate-700">[{line.ts}]</span>
                    <span className={`${line.style} min-w-0`}>{line.msg}</span>
                  </div>
                ))}
                <div className="flex gap-3 pt-1">
                  <span className="flex-shrink-0 text-slate-700">[──]</span>
                  <span className="animate-pulse text-slate-700">█</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 py-14">
          <div
            data-reveal
            className="relative overflow-hidden rounded-2xl border border-[#2B3560] bg-[#10172A] px-8 py-14 text-center"
          >
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(124,58,237,0.12),transparent_70%)]" />
            <div className="relative">
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-violet-400">Ready to forge</p>
              <h2 className="mx-auto mt-4 max-w-lg text-[1.9rem] font-semibold tracking-tight text-white">
                Stop guessing. Start testing what matters.
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-slate-400">
                Paste your spec. The Smith finds the gaps.
              </p>
              <a
                href="#forge"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(124,58,237,0.35)] transition hover:-translate-y-0.5 hover:bg-violet-500"
              >
                Run QA Analysis
              </a>
            </div>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <footer className="border-t border-[#202A44] px-6 py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row">
            <div className="flex items-center gap-3">
              <Wordmark className="h-5 w-auto opacity-70" />
            </div>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-slate-600">
              <a href="#forge"   className="transition hover:text-slate-400">Forge</a>
              <a href="#process" className="transition hover:text-slate-400">Process</a>
              <a href="#smith"   className="transition hover:text-slate-400">The Smith</a>
              <span>SpecSmith · PopLabs</span>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
