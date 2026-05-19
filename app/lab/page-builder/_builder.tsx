"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Field, Input, Textarea } from "../_components/form-field";
import { Button } from "@/components/ui/button";

type BlockKind =
  | "wallet-connect"
  | "mint-button"
  | "balance-display"
  | "vote-widget"
  | "donation-button"
  | "text-header"
  | "text-paragraph";

interface Block {
  id: string;
  kind: BlockKind;
  config: Record<string, string>;
}

interface BuilderConfig {
  pageTitle: string;
  pageDescription: string;
  blocks: Block[];
  username: string;
  pagename: string;
}

const BLOCKS: {
  kind: BlockKind;
  label: string;
  emoji: string;
  configFields: { key: string; label: string; placeholder?: string }[];
}[] = [
  { kind: "wallet-connect", label: "Wallet Connect button", emoji: "🔌", configFields: [] },
  {
    kind: "mint-button",
    label: "Mint button",
    emoji: "🪄",
    configFields: [
      { key: "contractAddress", label: "NFT/SBT contract address", placeholder: "0x..." },
      { key: "buttonText", label: "Button label", placeholder: "Mint your badge" },
    ],
  },
  {
    kind: "balance-display",
    label: "Balance display",
    emoji: "💰",
    configFields: [
      { key: "tokenAddress", label: "ERC-20 token address", placeholder: "0x..." },
      { key: "label", label: "Label", placeholder: "Your tokens" },
    ],
  },
  {
    kind: "vote-widget",
    label: "Vote widget (Snapshot)",
    emoji: "🗳️",
    configFields: [
      { key: "snapshotSpace", label: "Snapshot space", placeholder: "cuvetsmo.eth" },
      { key: "proposalId", label: "Proposal ID", placeholder: "0xabc..." },
    ],
  },
  {
    kind: "donation-button",
    label: "Donation button",
    emoji: "💸",
    configFields: [
      { key: "treasuryAddress", label: "Treasury address (placeholder)", placeholder: "0x..." },
      { key: "buttonText", label: "Button label", placeholder: "Support us" },
    ],
  },
  {
    kind: "text-header",
    label: "Header text",
    emoji: "🅷",
    configFields: [{ key: "text", label: "Heading", placeholder: "Welcome to our DAO" }],
  },
  {
    kind: "text-paragraph",
    label: "Paragraph",
    emoji: "📝",
    configFields: [{ key: "text", label: "Paragraph text", placeholder: "We are..." }],
  },
];

const STORAGE_KEY = "cuvetsmo:page-builder:draft";
const EMPTY: BuilderConfig = {
  pageTitle: "",
  pageDescription: "",
  blocks: [],
  username: "",
  pagename: "",
};

export function PageBuilder() {
  const [config, setConfig] = useState<BuilderConfig>(EMPTY);
  const [selected, setSelected] = useState<string | null>(null);
  const [draggingKind, setDraggingKind] = useState<BlockKind | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const idCounter = useRef(0);

  // Hydrate from localStorage after mount. We use setState here intentionally
  // — SSR can't read localStorage, so initial state is EMPTY and we patch
  // after hydration to avoid a server/client HTML mismatch.
  useEffect(() => {
    let restored: BuilderConfig | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) restored = JSON.parse(raw) as BuilderConfig;
    } catch {
      // ignore — bad JSON
    }
    if (restored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional hydration after mount
      setConfig(restored);
    }
    setHydrated(true);
  }, []);

  const selectedBlock = useMemo(
    () => config.blocks.find((b) => b.id === selected) ?? null,
    [config.blocks, selected],
  );

  function update<K extends keyof BuilderConfig>(key: K, value: BuilderConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  function addBlock(kind: BlockKind) {
    idCounter.current += 1;
    const id = `block-${idCounter.current}`;
    const meta = BLOCKS.find((b) => b.kind === kind)!;
    const defaultConfig: Record<string, string> = {};
    for (const f of meta.configFields) {
      defaultConfig[f.key] = f.placeholder ?? "";
    }
    setConfig((c) => ({ ...c, blocks: [...c.blocks, { id, kind, config: defaultConfig }] }));
    setSelected(id);
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setConfig((c) => {
      const i = c.blocks.findIndex((b) => b.id === id);
      if (i < 0) return c;
      const j = i + dir;
      if (j < 0 || j >= c.blocks.length) return c;
      const next = [...c.blocks];
      const [item] = next.splice(i, 1);
      next.splice(j, 0, item);
      return { ...c, blocks: next };
    });
  }

  function removeBlock(id: string) {
    setConfig((c) => ({ ...c, blocks: c.blocks.filter((b) => b.id !== id) }));
    if (selected === id) setSelected(null);
  }

  function updateBlockConfig(id: string, key: string, value: string) {
    setConfig((c) => ({
      ...c,
      blocks: c.blocks.map((b) =>
        b.id === id ? { ...b, config: { ...b.config, [key]: value } } : b,
      ),
    }));
  }

  function onSave() {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setSaveMsg("✓ Saved to localStorage · Wave 3 จะ sync ลง Supabase");
      setTimeout(() => setSaveMsg(null), 2500);
    } catch (err) {
      setSaveMsg("⚠️ " + (err instanceof Error ? err.message : "Save failed"));
    }
  }

  function onExport() {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(config.pagename || "page").replace(/[^a-z0-9-]/gi, "-")}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid lg:grid-cols-[240px_1fr_280px] gap-4 lg:gap-5">
      <aside className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 h-fit lg:sticky lg:top-20">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2 px-1">
          Components
        </h3>
        <div className="grid gap-1">
          {BLOCKS.map((b) => (
            <button
              key={b.kind}
              type="button"
              draggable
              onDragStart={() => setDraggingKind(b.kind)}
              onDragEnd={() => setDraggingKind(null)}
              onClick={() => addBlock(b.kind)}
              className="text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-[var(--color-brand-light)] hover:text-[var(--color-brand)] cursor-grab active:cursor-grabbing"
            >
              <span className="text-base" aria-hidden>{b.emoji}</span>
              <span>{b.label}</span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[var(--color-muted)] mt-2 px-1 leading-relaxed">
          คลิกหรือลากเข้า canvas
        </p>
      </aside>

      <section
        className={cn(
          "rounded-xl border bg-[var(--color-card)] p-4 sm:p-5 min-h-[400px] transition-colors",
          draggingKind ? "border-[var(--color-brand)] border-dashed" : "border-[var(--color-border)]",
        )}
        onDragOver={(e) => { if (draggingKind) e.preventDefault(); }}
        onDrop={() => {
          if (draggingKind) {
            addBlock(draggingKind);
            setDraggingKind(null);
          }
        }}
      >
        <div className="mb-4 pb-4 border-b border-[var(--color-border)]">
          <Field label="Page title" htmlFor="pb-title">
            <Input
              id="pb-title"
              type="text"
              value={config.pageTitle}
              onChange={(e) => update("pageTitle", e.target.value)}
              placeholder="My DAO landing page"
            />
          </Field>
          <div className="mt-3">
            <Field label="Description" htmlFor="pb-desc">
              <Textarea
                id="pb-desc"
                value={config.pageDescription}
                onChange={(e) => update("pageDescription", e.target.value)}
                placeholder="What's this page about..."
              />
            </Field>
          </div>
        </div>

        {config.blocks.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-[var(--color-border)] py-12 text-center">
            <p className="text-3xl mb-2" aria-hidden>🧱</p>
            <p className="text-sm font-medium text-[var(--color-text)] mb-1">
              ลาก component ใส่ตรงนี้
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              หรือคลิกตัวเลือกด้านซ้ายเพื่อ add
            </p>
          </div>
        ) : (
          <ol className="grid gap-2">
            {config.blocks.map((b, i) => (
              <BlockCard
                key={b.id}
                block={b}
                index={i}
                total={config.blocks.length}
                selected={selected === b.id}
                onSelect={() => setSelected(b.id)}
                onMoveUp={() => moveBlock(b.id, -1)}
                onMoveDown={() => moveBlock(b.id, 1)}
                onRemove={() => removeBlock(b.id)}
              />
            ))}
          </ol>
        )}
      </section>

      <aside className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 h-fit lg:sticky lg:top-20">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-3">
          Inspector
        </h3>
        {selectedBlock ? (
          <InspectorPanel
            block={selectedBlock}
            onChange={(k, v) => updateBlockConfig(selectedBlock.id, k, v)}
          />
        ) : (
          <p className="text-xs text-[var(--color-muted)] leading-relaxed">
            เลือก component ใน canvas เพื่อตั้งค่า props
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-[var(--color-border)] grid gap-3">
          <Field label="Username (slug)" htmlFor="pb-user">
            <Input
              id="pb-user"
              type="text"
              value={config.username}
              onChange={(e) => update("username", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="palm"
            />
          </Field>
          <Field label="Page name (slug)" htmlFor="pb-page">
            <Input
              id="pb-page"
              type="text"
              value={config.pagename}
              onChange={(e) => update("pagename", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="my-dao"
            />
          </Field>
          <p className="text-[10px] text-[var(--color-muted)] font-mono break-all">
            /lab/page-builder/u/{config.username || "<user>"}/{config.pagename || "<page>"}
          </p>

          <Button type="button" variant="brand" size="md" onClick={onSave}>
            💾 Save draft
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onExport}>
            Export JSON
          </Button>
          {saveMsg && (
            <p className="text-xs text-emerald-700 dark:text-emerald-300">{saveMsg}</p>
          )}
        </div>
      </aside>
    </div>
  );
}

function BlockCard({
  block, index, total, selected, onSelect, onMoveUp, onMoveDown, onRemove,
}: {
  block: Block;
  index: number;
  total: number;
  selected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const meta = BLOCKS.find((b) => b.kind === block.kind)!;
  return (
    <li>
      <div
        onClick={onSelect}
        className={cn(
          "rounded-lg border p-3 transition-colors cursor-pointer",
          selected
            ? "border-[var(--color-brand)] bg-[var(--color-brand-light)]"
            : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-brand)]",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg" aria-hidden>{meta.emoji}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium">{meta.label}</p>
              {Object.values(block.config).filter(Boolean).length > 0 && (
                <p className="text-xs text-[var(--color-muted)] truncate">
                  {Object.entries(block.config)
                    .filter(([, v]) => v)
                    .map(([k, v]) => `${k}: ${String(v).slice(0, 24)}`)
                    .join(" · ")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              disabled={index === 0}
              className="w-7 h-7 rounded-md hover:bg-[var(--color-border)] disabled:opacity-30 text-sm"
              aria-label="Move up"
            >↑</button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              disabled={index === total - 1}
              className="w-7 h-7 rounded-md hover:bg-[var(--color-border)] disabled:opacity-30 text-sm"
              aria-label="Move down"
            >↓</button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="w-7 h-7 rounded-md hover:bg-red-100 hover:text-red-600 text-sm"
              aria-label="Remove"
            >✕</button>
          </div>
        </div>
      </div>
    </li>
  );
}

function InspectorPanel({
  block, onChange,
}: {
  block: Block;
  onChange: (key: string, value: string) => void;
}) {
  const meta = BLOCKS.find((b) => b.kind === block.kind)!;
  if (meta.configFields.length === 0) {
    return (
      <p className="text-xs text-[var(--color-muted)]">
        {meta.label} ไม่ต้องตั้งค่าอะไรเพิ่ม.
      </p>
    );
  }
  return (
    <div className="grid gap-3">
      <p className="text-sm font-semibold">{meta.label}</p>
      {meta.configFields.map((f) => (
        <Field key={f.key} label={f.label} htmlFor={`inspect-${block.id}-${f.key}`}>
          <Input
            id={`inspect-${block.id}-${f.key}`}
            type="text"
            value={block.config[f.key] ?? ""}
            onChange={(e) => onChange(f.key, e.target.value)}
            placeholder={f.placeholder}
          />
        </Field>
      ))}
    </div>
  );
}
