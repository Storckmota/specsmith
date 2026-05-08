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
  const fw = frameworkLabel[testFile.framework] ?? testFile.framework;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#202A44] bg-[#10172A]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#202A44] px-6 py-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-sm font-semibold text-slate-100">Generated Test File</h2>
            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-300">
              Executable Draft
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            SpecSmith generated this {fw} draft from the analyzed spec, detected risks, and planned coverage.
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-slate-700">
            {testFile.filename} · {lineCount} lines
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#202A44] bg-[#0B1020] px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:-translate-y-0.5 hover:border-violet-400/40 hover:text-slate-100"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-violet-400" viewBox="0 0 14 14" fill="none">
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

      <div className="max-h-[560px] overflow-auto bg-[#060816]">
        <div className="sticky top-0 flex items-center justify-between border-b border-[#202A44] bg-[#0B1020]/90 px-4 py-2.5 backdrop-blur">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-violet-500/80" />
          </div>
          <span className="truncate px-3 font-mono text-xs text-slate-500">{testFile.filename}</span>
          <span className="rounded-full border border-violet-400/30 px-2 py-0.5 font-mono text-[11px] text-violet-300">
            {testFile.framework}
          </span>
        </div>
        <pre className="overflow-x-auto whitespace-pre p-5 font-mono text-xs leading-relaxed text-slate-300">
          {testFile.code}
        </pre>
      </div>

      <div className="border-t border-[#202A44] px-6 py-3">
        <p className="text-xs text-slate-600">
          Review, adapt, and run this draft in your QA workflow.
        </p>
      </div>
    </div>
  );
}
