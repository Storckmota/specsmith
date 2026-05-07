"use client";

import { useState } from "react";
import type { TestFile } from "@/lib/schemas/analysis";

interface Props {
  testFile: TestFile;
}

export default function TestFileOutput({ testFile }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(testFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const frameworkLabel = {
    playwright: "Playwright",
    jest: "Jest",
    pytest: "Pytest",
  }[testFile.framework];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Generated Test File</h2>
          <p className="text-xs text-zinc-600 mt-0.5">
            {frameworkLabel} · {testFile.filename}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-700"
        >
          {copied ? "Copied!" : "Copy code"}
        </button>
      </div>
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-auto max-h-[500px]">
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
          <span className="text-xs text-zinc-600 font-mono">{testFile.filename}</span>
          <span className="text-xs text-zinc-700">{testFile.framework}</span>
        </div>
        <pre className="p-4 text-xs text-zinc-300 font-mono leading-relaxed overflow-x-auto whitespace-pre">
          {testFile.code}
        </pre>
      </div>
    </div>
  );
}
