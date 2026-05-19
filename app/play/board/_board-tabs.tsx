"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Guestbook } from "./_guestbook";
import { Polls } from "./_polls";

type Tab = "guestbook" | "polls";

export function BoardTabs() {
  const [tab, setTab] = useState<Tab>("guestbook");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Board sections"
        className="flex gap-1 mb-6 border-b border-[var(--color-border)]"
      >
        <TabButton
          active={tab === "guestbook"}
          onClick={() => setTab("guestbook")}
          label="Guestbook"
          sub="on-chain"
        />
        <TabButton
          active={tab === "polls"}
          onClick={() => setTab("polls")}
          label="Polls"
          sub="off-chain · gas-free"
        />
      </div>

      {tab === "guestbook" && <Guestbook />}
      {tab === "polls" && <Polls />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors flex flex-col items-start gap-0.5",
        active
          ? "border-[var(--color-brand)] text-[var(--color-brand)]"
          : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]",
      )}
    >
      <span>{label}</span>
      <span className="text-[11px] font-normal opacity-70">{sub}</span>
    </button>
  );
}
