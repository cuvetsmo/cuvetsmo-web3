import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const { chromium } = await import(pathToFileURL(process.argv[2]).href)
const origin = process.argv[3] ?? 'http://127.0.0.1:3414'
await mkdir(new URL('../work/browser/', import.meta.url), { recursive: true })
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'th-TH', reducedMotion: 'reduce' })
page.setDefaultTimeout(30000)
let actions = 0
await page.route('**/api/quests/**/verify', async (route) => { actions++; await route.abort() })
await page.route('**/api/faucet', async (route) => { actions++; await route.abort() })
try {
  await page.goto(`${origin}/learn/zero-to-hero?step=3`)
  await page.getByRole('heading', { name: 'Wallet เหมือนกระเป๋าเงินจริงไหม', exact: true }).waitFor()
  await page.getByText('ให้ Athene ช่วยอธิบายบทเรียนนี้', { exact: true }).click()
  let link = page.getByRole('link', { name: 'เปิดร่างคำถามใน Athene ↗', exact: true })
  assert.equal(await link.getAttribute('href'), 'https://ai.cuvetsmo.com/?handoff=web3&kind=lesson&ref=3')
  assert.ok((await page.locator('details').filter({ has: link }).innerText()).includes('ไม่ส่ง private key'))
  await page.screenshot({ path: fileURLToPath(new URL('../work/browser/lesson-handoff.png', import.meta.url)), fullPage: false })
  await page.goto(`${origin}/learn/quests?quest=7`)
  await page.getByRole('dialog').waitFor()
  await page.getByText('ให้ Athene ช่วยอธิบายบทเรียนนี้', { exact: true }).click()
  link = page.getByRole('link', { name: 'เปิดร่างคำถามใน Athene ↗', exact: true })
  assert.equal(await link.getAttribute('href'), 'https://ai.cuvetsmo.com/?handoff=web3&kind=quest&ref=7')
  assert.equal(actions, 0)
  const api = await page.request.get(`${origin}/api/athene-context?kind=quest&id=7`, { headers: { Origin: 'https://ai.cuvetsmo.com' } })
  assert.equal(api.status(), 200)
  const record = await api.json()
  assert.equal(record.ref, '7')
  assert.ok(record.points.some((point) => point.includes('ไม่ส่ง private key')))
  assert.equal(record.source_url, 'https://web3.cuvetsmo.com/learn/quests?quest=7')
  assert.equal((await page.request.get(`${origin}/api/athene-context?kind=quest&id=7`, { headers: { Origin: 'https://evil.test' } })).status(), 403)
  console.log('Web3 actual lesson/quest selection, reviewed metadata handoff, CORS and zero faucet/verification actions: passed')
} finally { await browser.close() }
