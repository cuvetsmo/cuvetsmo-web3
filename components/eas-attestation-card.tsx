"use client";

import { useMemo } from "react";

import { cn, shortAddress } from "@/lib/utils";
import {
  decodeData,
  easAttestationUrl,
  SCHEMAS,
  type DecodedItem,
  type EasNetwork,
  type SchemaName,
} from "@/lib/eas";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

/**
 * Visual card for a single EAS attestation.
 *
 * Used in:
 *   - Build pillar profile page (list of someone's credentials)
 *   - Guestbook feed
 *   - Mint-success confirmation modal
 *
 * Props mirror the EAS `Attestation` shape but accept loose strings for ease
 * of use with the GraphQL indexer (which returns time as a numeric string).
 */
export interface EasAttestationCardProps {
  /** 32-byte attestation UID, 0x-prefixed. */
  uid: string;
  /** 32-byte schema UID, 0x-prefixed. */
  schemaUid: string;
  /** The wallet that issued the attestation (us in most cases). */
  attester: `0x${string}`;
  /** The wallet that received the attestation. */
  recipient: `0x${string}`;
  /** Whether the issuer reserved the right to revoke. */
  revocable: boolean;
  /** True if currently revoked. */
  revoked?: boolean;
  /** Unix timestamp when the attestation was created (seconds). */
  time: bigint | number | string;
  /** Raw ABI-encoded data payload. We try to decode based on schemaUid. */
  data: string;
  /** Which network the attestation lives on — for explorer link routing. */
  network?: EasNetwork;
  className?: string;
}

const ICONS: Record<SchemaName, string> = {
  VET_CARD: "🎓",
  BADGE: "🏅",
  GUESTBOOK: "📝",
};

/**
 * Determine which configured schema (if any) this attestation matches.
 * Falls back to "Unknown" when the schemaUid doesn't line up with the
 * three we've registered.
 */
function resolveSchemaName(schemaUid: string): SchemaName | null {
  if (!schemaUid) return null;
  for (const name of Object.keys(SCHEMAS) as SchemaName[]) {
    if (
      SCHEMAS[name].uid &&
      SCHEMAS[name].uid.toLowerCase() === schemaUid.toLowerCase()
    ) {
      return name;
    }
  }
  return null;
}

export function EasAttestationCard({
  uid,
  schemaUid,
  attester,
  recipient,
  revocable,
  revoked,
  time,
  data,
  network = "base",
  className,
}: EasAttestationCardProps) {
  const schemaName = resolveSchemaName(schemaUid);
  const schema = schemaName ? SCHEMAS[schemaName] : null;
  const icon = schemaName ? ICONS[schemaName] : "📜";
  const label = schema?.label ?? "Attestation";
  const schemaString = schema?.schema ?? "";

  // Decode the raw bytes — only attempt when we know the schema string.
  const decoded: DecodedItem[] = useMemo(() => {
    if (!schemaString) return [];
    try {
      return decodeData(schemaString, data);
    } catch {
      return [];
    }
  }, [data, schemaString]);

  const timeMs = useMemo(() => {
    const seconds =
      typeof time === "bigint"
        ? Number(time)
        : typeof time === "string"
          ? Number(time)
          : time;
    if (!Number.isFinite(seconds) || seconds <= 0) return null;
    return seconds * 1000;
  }, [time]);

  const dateText = useMemo(() => {
    if (timeMs == null) return "—";
    const d = new Date(timeMs);
    return d.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }, [timeMs]);

  return (
    <Card
      className={cn(
        "flex flex-col w-full max-w-md transition-colors",
        revoked && "opacity-60",
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              aria-hidden
              className="text-2xl leading-none shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand-light)]"
            >
              {icon}
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-tight text-[var(--color-text)] truncate">
                {label}
              </h3>
              <p className="text-xs text-[var(--color-muted)] truncate">
                {dateText} ·{" "}
                <span className="font-mono">{shortAddress(recipient)}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {revoked ? (
              <Badge tone="warning">revoked</Badge>
            ) : revocable ? (
              <Badge tone="muted">revocable</Badge>
            ) : (
              <Badge tone="success">immutable</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {decoded.length > 0 ? (
          <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1.5 text-sm">
            {decoded.map((item) => (
              <div
                key={item.name}
                className="contents text-[var(--color-text)]"
              >
                <dt className="text-[var(--color-muted)] font-medium">
                  {item.name}
                </dt>
                <dd className="font-mono text-xs break-all">
                  {formatValue(item)}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-xs text-[var(--color-muted)] italic">
            ไม่สามารถ decode ข้อมูลได้ (schema unknown หรือ data ว่าง)
          </p>
        )}

        <div className="pt-2 border-t border-[var(--color-border)] text-xs text-[var(--color-muted)] grid grid-cols-[auto,1fr] gap-x-3 gap-y-1">
          <span>Issuer</span>
          <span className="font-mono break-all">{shortAddress(attester)}</span>
          <span>UID</span>
          <span className="font-mono break-all">
            {uid.slice(0, 10)}…{uid.slice(-8)}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <a
          href={easAttestationUrl(uid, network)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] underline-offset-4 hover:underline"
        >
          View on EAS explorer →
        </a>
      </CardFooter>
    </Card>
  );
}

/**
 * Pretty-print a decoded ABI value. Bigints become decimal strings; addresses
 * stay hex; strings keep their quotes. Truncates anything beyond 80 chars.
 */
function formatValue(item: DecodedItem): string {
  const v = item.value;
  let s: string;
  if (typeof v === "bigint") {
    s = v.toString();
  } else if (typeof v === "string") {
    s = v;
  } else if (typeof v === "number" || typeof v === "boolean") {
    s = String(v);
  } else if (v == null) {
    s = "null";
  } else {
    try {
      s = JSON.stringify(v);
    } catch {
      s = String(v);
    }
  }
  if (s.length > 80) return `${s.slice(0, 77)}…`;
  return s;
}

/**
 * Compact list — renders a grid of attestation cards with sensible
 * empty-state. Use in profile pages.
 */
export function EasAttestationGrid({
  attestations,
  network = "base",
  emptyText = "ยังไม่มี attestation",
  className,
}: {
  attestations: EasAttestationCardProps[];
  network?: EasNetwork;
  emptyText?: string;
  className?: string;
}) {
  if (attestations.length === 0) {
    return (
      <p
        className={cn(
          "text-sm text-[var(--color-muted)] italic py-6 text-center",
          className,
        )}
      >
        {emptyText}
      </p>
    );
  }
  return (
    <div
      className={cn(
        "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {attestations.map((a) => (
        <EasAttestationCard key={a.uid} {...a} network={network} />
      ))}
    </div>
  );
}
