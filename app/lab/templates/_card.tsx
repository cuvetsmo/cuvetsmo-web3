"use client";

import { useState } from "react";
import type { TemplateMeta } from "./_lib/templates";
import { Button } from "@/components/ui/button";

function toRemixBase64(source: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(source, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  const bytes = new TextEncoder().encode(source);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function TemplateCard({
  meta,
  source,
}: {
  meta: TemplateMeta;
  source: string;
}) {
  const [open, setOpen] = useState(false);
  const remixUrl = `https://remix.ethereum.org/#code=${toRemixBase64(source)}`;

  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 flex flex-col">
      <p className="text-2xl mb-1.5" aria-hidden>
        {meta.emoji}
      </p>
      <h3 className="text-base font-semibold mb-1">{meta.title}</h3>
      <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-3">
        {meta.description}
      </p>
      <dl className="text-[11px] text-[var(--color-muted)] space-y-1 mb-3">
        <div>
          <dt className="inline font-semibold text-[var(--color-text)]">Use case:</dt>{" "}
          <dd className="inline">{meta.useCase}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-[var(--color-text)]">Est. gas:</dt>{" "}
          <dd className="inline font-mono">{meta.estimatedGas}</dd>
        </div>
      </dl>

      <div className="mt-auto pt-3 border-t border-[var(--color-border)] flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "Hide source" : "View source"}
        </Button>
        <a
          href={remixUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-brand)] text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white transition-colors"
        >
          Fork on Remix ↗
        </a>
        {meta.deployable ? (
          <Button variant="brand" size="sm">
            Deploy as-is
          </Button>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-semibold bg-[var(--color-border)] text-[var(--color-muted)]">
            Deploy in Wave 3
          </span>
        )}
      </div>

      {open && <SourceViewer source={source} filename={meta.filename} />}
    </article>
  );
}

function SourceViewer({ source, filename }: { source: string; filename: string }) {
  const [copied, setCopied] = useState(false);

  function onCopy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(source).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const lines = source.split("\n");

  return (
    <div className="mt-3 rounded-lg border border-[var(--color-border)] bg-stone-50 dark:bg-stone-950/60 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
        <span className="text-xs font-mono text-[var(--color-muted)]">{filename}</span>
        <button
          type="button"
          onClick={onCopy}
          className="text-xs text-[var(--color-brand)] hover:underline"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="text-[11px] leading-snug font-mono px-3 py-3 overflow-x-auto max-h-80">
        {lines.map((line, i) => (
          <code key={i} className={highlight(line)}>
            {line || " "}
            {"\n"}
          </code>
        ))}
      </pre>
    </div>
  );
}

function highlight(line: string): string {
  const trimmed = line.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*"))
    return "text-stone-400 dark:text-stone-500";
  if (/^(pragma|contract|interface|library|function|modifier|event|error|struct|enum|mapping|address|uint|bool|string|bytes|return|require|revert|emit|if|else|for|while|external|internal|public|private|view|pure|payable|memory|storage|calldata|constructor|using|import|new|delete|true|false|this)\b/.test(trimmed))
    return "text-sky-700 dark:text-sky-300";
  return "text-[var(--color-text)]";
}
