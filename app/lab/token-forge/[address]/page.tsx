import type { Metadata } from "next";
import { isAddress } from "@/lib/utils";
import { TokenPageClient } from "./_client";

interface Params {
  address: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { address } = await params;
  return {
    title: `Token ${address.slice(0, 6)}...${address.slice(-4)}`,
    description: `Public token page for ${address} on Base Sepolia. Deployed via Token Forge.`,
  };
}

export default async function TokenAddressPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { address } = await params;

  if (!isAddress(address)) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold mb-2">ไม่พบ token</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Address นี้ไม่ถูกต้อง: <code className="font-mono">{address}</code>
        </p>
      </main>
    );
  }

  return <TokenPageClient address={address as `0x${string}`} />;
}
