"use client";

import { useState } from "react";

interface CopyButtonProps {
  value: string;
  idleLabel: string;
  copiedLabel: string;
}

/**
 * Tiny "Copy to clipboard" button. Pure client-side: tries the modern
 * clipboard API first, falls back to a hidden `<textarea>` + `execCommand`
 * for older WebKit / Android browsers.
 */
export function CopyButton({ value, idleLabel, copiedLabel }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await writeToClipboard(value);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className={[
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition",
        copied
          ? "bg-balna-teal text-white"
          : "bg-white text-balna-ink ring-1 ring-balna-line hover:ring-balna-teal",
      ].join(" ")}
    >
      {copied ? "✓" : <ClipboardIcon className="h-3.5 w-3.5" />}
      {copied ? copiedLabel : idleLabel}
    </button>
  );
}

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="9" y="3" width="6" height="3" rx="1" />
      <rect x="6" y="6" width="12" height="15" rx="2" />
    </svg>
  );
}
