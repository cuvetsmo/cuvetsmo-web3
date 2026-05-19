"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFile: (file: File) => void;
  accept?: string;
  maxBytes?: number;
  disabled?: boolean;
  previewUrl?: string | null;
}

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp";
const DEFAULT_MAX = 5 * 1024 * 1024;

/**
 * Drag-drop + click-to-select file zone.
 *
 * Shows preview thumbnail when `previewUrl` is supplied.
 * Validation happens upstream — DropZone just bubbles the File.
 */
export function DropZone({
  onFile,
  accept = DEFAULT_ACCEPT,
  maxBytes = DEFAULT_MAX,
  disabled = false,
  previewUrl,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tryAccept = useCallback(
    (file: File | undefined | null) => {
      setError(null);
      if (!file) return;
      if (file.size > maxBytes) {
        setError(`ไฟล์ใหญ่เกิน ${Math.round(maxBytes / 1024 / 1024)}MB`);
        return;
      }
      const acceptList = accept.split(",").map((s) => s.trim());
      if (!acceptList.includes(file.type)) {
        setError(`รองรับเฉพาะ ${acceptList.join(", ")}`);
        return;
      }
      onFile(file);
    },
    [accept, maxBytes, onFile],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    tryAccept(e.dataTransfer.files?.[0]);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        aria-label="Upload image"
        aria-disabled={disabled}
        className={cn(
          "relative w-full rounded-xl border-2 border-dashed transition-all cursor-pointer",
          "flex flex-col items-center justify-center text-center",
          "min-h-[220px] sm:min-h-[260px] p-6",
          dragOver
            ? "border-[var(--color-brand)] bg-[var(--color-brand-light)]/60 scale-[0.995]"
            : "border-[var(--color-border)] hover:border-[var(--color-brand)]/60 hover:bg-[var(--color-brand-light)]/30",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {previewUrl ? (
          <div className="relative w-full max-w-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-auto max-h-64 object-contain rounded-lg shadow-sm"
            />
            <p className="mt-3 text-xs text-[var(--color-muted)]">
              คลิกหรือลากไฟล์ใหม่เพื่อเปลี่ยน
            </p>
          </div>
        ) : (
          <>
            <UploadIcon className="w-10 h-10 mb-3 text-[var(--color-muted)]" />
            <p className="text-base font-medium mb-1">
              ลากรูปมาวาง · drag image here
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              หรือคลิกเลือกไฟล์ · jpg / png / webp · max{" "}
              {Math.round(maxBytes / 1024 / 1024)}MB
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => tryAccept(e.target.files?.[0])}
        />
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
