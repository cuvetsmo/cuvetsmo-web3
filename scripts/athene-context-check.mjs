import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const { default: ts } = await import(process.argv[2] ? pathToFileURL(process.argv[2]).href : 'typescript')
const modules = new Map()
async function compile(relative) {
  const url = new URL(relative, import.meta.url)
  if (modules.has(url.href)) return modules.get(url.href)
  let code = ts.transpileModule(await readFile(url, 'utf8'), { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText
  for (const match of [...code.matchAll(/from ['"]([^'"]+)['"]/g)]) {
    if (match[1] === '@/lib/athene-context') code = code.replace(match[0], `from ${JSON.stringify(await compile('../lib/athene-context.ts'))}`)
    else if (match[1].startsWith('.')) code = code.replace(match[0], `from ${JSON.stringify(await compile(new URL(`${match[1]}.ts`, url).href))}`)
  }
  const uri = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  modules.set(url.href, uri)
  return uri
}
const { QUESTS } = await import(await compile('../lib/quests.ts'))
const { ZERO_TO_HERO_STEPS } = await import(await compile('../lib/zero-to-hero.ts'))
const context = await import(await compile('../lib/athene-context.ts'))
const route = await import(await compile('../app/api/athene-context/route.ts'))
for (const [kind, records] of [['quest', QUESTS], ['lesson', ZERO_TO_HERO_STEPS]]) {
  for (const record of records) {
    const payload = context.web3Context(kind, String(record.id), new Date('2026-10-06T00:00:00Z'))
    assert.equal(payload.ref, String(record.id))
    assert.equal(payload.title, record.title)
    assert.equal(payload.summary, kind === 'quest' ? record.concept : record.subtitle)
    assert.deepEqual(payload.images, [])
    assert.equal(payload.retrieved_at, '2026-10-06T00:00:00.000Z')
    assert.ok(payload.source_url.includes(`${kind === 'quest' ? '?quest=' : '?step='}${record.id}`))
    assert.ok(payload.points.some((text) => text.includes('ไม่ส่ง private key')))
    assert.ok(!('signature' in payload) && !('txHash' in payload) && !('address' in payload) && !('completed' in payload))
    const handoff = new URL(context.web3Handoff(kind, String(record.id)))
    assert.equal(handoff.origin, 'https://ai.cuvetsmo.com')
    assert.deepEqual([...handoff.searchParams.keys()], ['handoff', 'kind', 'ref'])
  }
}
assert.equal(context.web3Context('quest', '9999'), null)
assert.equal(context.web3Context('wallet', '1'), null)
const request = (query, origin) => new Request(`https://web3.cuvetsmo.com/api/athene-context?${query}`, { headers: origin ? { origin } : {} })
const ok = route.GET(request('kind=quest&id=1', 'https://ai.cuvetsmo.com'))
assert.equal(ok.status, 200)
assert.equal(ok.headers.get('access-control-allow-origin'), 'https://ai.cuvetsmo.com')
assert.equal(ok.headers.get('access-control-allow-credentials'), null)
assert.match(ok.headers.get('cache-control'), /max-age=300/)
assert.equal((await ok.json()).ref, '1')
assert.equal(route.GET(request('kind=quest&id=1', 'https://evil.test')).status, 403)
assert.equal(route.GET(request('kind=quest&id=0xprivate')).status, 400)
assert.equal(route.GET(request('kind=quest&id=99')).status, 404)
assert.equal(route.OPTIONS(request('', 'https://ai.cuvetsmo.com')).status, 204)
assert.equal((await route.GET(request('kind=quest&ref=1')).json()).ref, '1')
assert.equal(route.GET(request('kind=quest&ref=1&id=2')).status, 400)
assert.equal(route.GET(request('kind=quest&ref=1&ref=1')).status, 400)
const savedEnv = { mode: process.env.NODE_ENV, origin: process.env.ATHENE_DEV_ORIGIN }
try {
  process.env.NODE_ENV = 'development'; process.env.ATHENE_DEV_ORIGIN = 'http://127.0.0.1:3411'
  assert.equal(route.GET(request('kind=quest&id=1', 'http://127.0.0.1:3411')).status, 200)
  process.env.NODE_ENV = 'production'
  assert.equal(route.GET(request('kind=quest&id=1', 'http://127.0.0.1:3411')).status, 403)
} finally {
  if (savedEnv.mode === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = savedEnv.mode
  if (savedEnv.origin === undefined) delete process.env.ATHENE_DEV_ORIGIN; else process.env.ATHENE_DEV_ORIGIN = savedEnv.origin
}
// Relocation must preserve the existing five authored lessons exactly.
const flow = await readFile(new URL('../app/learn/zero-to-hero/_components/zth-flow.tsx', import.meta.url), 'utf8')
assert.match(flow, /ZERO_TO_HERO_STEPS as STEPS/)
assert.match(flow, /AtheneGuide kind="lesson"/)
assert.equal(ZERO_TO_HERO_STEPS.length, 5)
console.log('Web3 real quest/lesson context, no wallet action, exact metadata handoff and endpoint CORS checks: passed')
