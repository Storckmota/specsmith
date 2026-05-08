"use client";

import { useState } from "react";
import type { TestFile } from "@/lib/schemas/analysis";

interface Props {
  testFile: TestFile;
}

const frameworkLabel: Record<string, string> = {
  playwright: "Playwright",
  jest: "Jest",
  pytest: "Pytest",
};

export default function TestFileOutput({ testFile }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(testFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = testFile.code.split("\n").length;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Generated Test File</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {frameworkLabel[testFile.framework] ?? testFile.framework} - {testFile.filename} - {lineCount} lines
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:-translate-y-0.5 hover:border-emerald-400/40 hover:text-slate-100"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none">
                <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 5V3.5A1.5 1.5 0 0 0 7.5 2h-4A1.5 1.5 0 0 0 2 3.5v4A1.5 1.5 0 0 0 3.5 9H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Copy code
            </>
          )}
        </button>
      </div>

      <div className="max-h-[560px] overflow-auto bg-slate-950">
        <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-2.5 backdrop-blur">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="truncate px-3 font-mono text-xs text-slate-500">{testFile.filename}</span>
          <span className="rounded-full border border-emerald-400/30 px-2 py-0.5 font-mono text-[11px] text-emerald-300">
            {testFile.framework}
          </span>
        </div>
        <pre className="overflow-x-auto whitespace-pre p-5 font-mono text-xs leading-relaxed text-slate-300">
          {testFile.code}
        </pre>
      </div>
    </div>
  );
}
