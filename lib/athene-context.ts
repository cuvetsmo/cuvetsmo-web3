import { getQuestById, type Quest } from './quests'
import { ZERO_TO_HERO_STEPS } from './zero-to-hero'

const ORIGIN = 'https://web3.cuvetsmo.com'
const DATA_REVISION = '49a3e98'
export type Web3Context = {
  schema_version: 1; surface: 'web3'; kind: 'quest' | 'lesson'; ref: string; title: string; summary: string; points: string[]; source_url: string;
  images: []; provenance: { url: string; license: string | null; attribution: string | null; data_revision: string }; retrieved_at: string;
}

const SECURITY_CHECKS = [
  'ไม่ส่ง private key, seed phrase, recovery code หรือรหัสผ่านเข้าแชต',
  'อ่าน network, ผู้รับ, จำนวน และสิทธิ์ที่ขอก่อนยืนยันใน wallet; บทเรียนนี้ใช้ Base Sepolia testnet',
  'การเปิดบทเรียนหรือคุยกับ Athene ไม่ใช่หลักฐานว่าทำ quest สำเร็จ ต้องใช้ผลตรวจจากระบบเดิม',
]

/** Read-only lesson metadata; it never connects, signs, submits or claims a completion. */
export function web3Context(kind: string, ref: string, now = new Date()): Web3Context | null {
  if (!['quest', 'lesson'].includes(kind) || !/^\d{1,2}$/.test(ref)) return null
  const id = Number(ref)
  const record = kind === 'quest' ? getQuestById(id) : ZERO_TO_HERO_STEPS.find((step) => step.id === id)
  if (!record) return null
  const source_url = kind === 'quest' ? `${ORIGIN}/learn/quests?quest=${id}` : `${ORIGIN}/learn/zero-to-hero?step=${id}`
  const summary = kind === 'quest' ? (record as Quest).concept : (record as typeof ZERO_TO_HERO_STEPS[number]).subtitle
  const points = kind === 'quest' ? [(record as Quest).task, ...SECURITY_CHECKS] : [...(record as typeof ZERO_TO_HERO_STEPS[number]).bullets, ...SECURITY_CHECKS]
  return {
    schema_version: 1, surface: 'web3', kind: kind as 'quest' | 'lesson', ref: String(id),
    title: record.title.slice(0, 240), summary: summary.slice(0, 1800), points: points.slice(0, 12).map((point) => point.slice(0, 240)), source_url,
    images: [], provenance: { url: source_url, license: null, attribution: 'CUVETSMO Web3 teaching registry', data_revision: DATA_REVISION }, retrieved_at: now.toISOString(),
  }
}

export function web3Handoff(kind: 'quest' | 'lesson', ref: string): string | null {
  const record = web3Context(kind, ref)
  if (!record) return null
  const url = new URL('https://ai.cuvetsmo.com/')
  url.search = new URLSearchParams({ handoff: 'web3', kind, ref: record.ref }).toString()
  return url.href
}
