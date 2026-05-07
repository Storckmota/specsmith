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
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Generated Test File</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {frameworkLabel[testFile.framework] ?? testFile.framework} · {testFile.filename} · {lineCount} lines
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-700"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 5V3.5A1.5 1.5 0 0 0 7.5 2h-4A1.5 1.5 0 0 0 2 3.5v4A1.5 1.5 0 0 0 3.5 9H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Copy code
            </>
          )}
        </button>
      </div>

      {/* Code block */}
      <div className="bg-zinc-950 overflow-auto max-h-[480px]">
        {/* Fake window chrome */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-900/40 sticky top-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          </div>
          <span className="text-xs text-zinc-600 font-mono">{testFile.filename}</span>
          <span className="text-xs text-zinc-700 font-mono">{testFile.framework}</span>
        </div>
        <pre className="p-5 text-xs text-zinc-300 font-mono leading-relaxed overflow-x-auto whitespace-pre">
          {testFile.code}
        </pre>
      </div>
    </div>
  );
}
