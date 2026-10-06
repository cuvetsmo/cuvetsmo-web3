import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { resolve, dirname } from 'node:path'
import { createHash } from 'node:crypto'
import { build } from 'esbuild'

const root = process.cwd(), dir = 'work/mint-receipt-candidate', mode = process.argv[2] ?? 'fixed', original = 'app/play/mint/_mint-form.tsx', candidate = original, base = 'f51e1544f717705aace12f35d7bfd6a209d33467'
await mkdir(dir, { recursive: true })
const { chromium } = createRequire('C:/Users/palmz/.codex/worktrees/athene-system-20261006/webcuvetsmo/package.json')('@playwright/test')
const { encodeEventTopics, encodeAbiParameters, erc721Abi } = createRequire(resolve('package.json'))('viem')
const A = '0x1111111111111111111111111111111111111111', B = '0x2222222222222222222222222222222222222222', NFT = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', SBT = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', HASH = '0x' + '12'.repeat(32)
const sdk = `import {useSyncExternalStore} from 'react';let state={address:'${A}',receipt:null};const listeners=new Set(),wait={isSuccess:false,isError:false,data:undefined,error:undefined};const subscribe=fn=>{listeners.add(fn);return()=>listeners.delete(fn)};function useStore(){return useSyncExternalStore(subscribe,()=>state,()=>state)};function update(patch){state={...state,...patch};listeners.forEach(fn=>fn())};window.__wallet=address=>update({address});window.__receipt=data=>update({receipt:{isSuccess:true,isError:false,data,error:undefined}});export function usePrivy(){const s=useStore();return{ready:true,authenticated:true,user:{wallet:{address:s.address}},login(){}}};export function useAccount(){return{address:useStore().address}};export function useWriteContract(){return{writeContractAsync:async p=>{window.__writes.push({...p,actor:state.address});return'${HASH}'}}};export function useWaitForTransactionReceipt({hash}){const s=useStore();window.__watchHash=hash;return hash&&s.receipt?s.receipt:wait};`
const ui = `export const DropZone=({onFile,disabled})=><button id='pick' disabled={disabled} onClick={()=>onFile(new File(['fixture'],'mint.png',{type:'image/png'}))}>Pick fixture</button>;export const ContractPending=()=>null;export const WhatJustHappened=()=>null;export const TxReceiptPanel=props=><pre id='receipt-panel'>{JSON.stringify(props)}</pre>;`
const addresses = `export const PLAY_ADDRESSES={NFT_FACTORY:'${NFT}',SBT_FACTORY:'${SBT}'};export const isLive=()=>true;`
const entry = `import React from'react';import{createRoot}from'react-dom/client';import{flushSync}from'react-dom';import{MintForm}from'./app/play/mint/_mint-form';window.__writes=[];window.__uploads=[];window.__unexpected=[];window.__changeWallet=a=>flushSync(()=>window.__wallet(a));window.__settle=data=>flushSync(()=>window.__receipt(data));window.fetch=async(url,opts)=>{if(url!=='/api/pinata/upload'){window.__unexpected.push(String(url));throw Error('Unexpected fixture network boundary')};window.__uploads.push({method:opts.method,json:typeof opts.body==='string'?JSON.parse(opts.body):null});return Response.json({cid:'fixture-cid',url:'https://example.invalid/fixture',ipfs:typeof opts.body==='string'?'ipfs://fixture-meta':'ipfs://fixture-image'})};flushSync(()=>createRoot(document.getElementById('root')).render(<MintForm/>));`
const server = createServer((_req, res) => res.end('<!doctype html><div id="root"></div>'))
await new Promise((done) => server.listen(0, '127.0.0.1', done))
const browser = await chromium.launch({ headless: true }), records = []
try {
  const contents = mode === 'before' ? execFileSync('git', ['show', base + ':' + original], { encoding: 'utf8' }) : await readFile(mode === 'snapshot' ? dir + '/snapshot-only.tsx' : candidate, 'utf8')
  const bundle = await build({ stdin: { contents: entry, resolveDir: root, sourcefile: 'mint-fixture.tsx', loader: 'tsx' }, bundle: true, write: false, format: 'iife', platform: 'browser', jsx: 'automatic', plugins: [{ name: 'existing-native-sdk-fixture', setup(b) {
    b.onResolve({ filter: /^(@privy-io\/react-auth|wagmi)$/ }, () => ({ path: 'sdk', namespace: 'fixture' }))
    b.onResolve({ filter: /(?:drop-zone|contract-pending|tx-receipt-panel|what-just-happened)$/ }, () => ({ path: 'ui', namespace: 'fixture' }))
    b.onResolve({ filter: /\/addresses$/ }, () => ({ path: 'addresses', namespace: 'fixture' }))
    b.onLoad({ filter: /.*/, namespace: 'fixture' }, (a) => ({ contents: a.path === 'sdk' ? sdk : a.path === 'ui' ? ui : addresses, loader: 'tsx', resolveDir: root }))
    b.onLoad({ filter: /_mint-form\.tsx$/ }, () => ({ contents, loader: 'tsx', resolveDir: dirname(resolve(original)) }))
  } }] })
  const cases = mode === 'before' ? [{ name: 'delayed-switch', type: 'nft', switched: true }] : [
    { name: 'nft-minted', type: 'nft' }, { name: 'sbt-minted', type: 'sbt' },
    { name: 'transfer-before-minted', type: 'nft', transfer: true },
    { name: 'unknown-event', type: 'nft', unknown: true },
    { name: 'delayed-switch', type: 'nft', switched: true, transfer: true },
  ]
  for (const scenario of cases) {
    const { switched = false, type } = scenario, target = type === 'nft' ? NFT : SBT
    const context = await browser.newContext(), page = await context.newPage()
    await page.goto('http://127.0.0.1:' + server.address().port)
    await page.addScriptTag({ content: bundle.outputFiles[0].text })
    await page.locator('#pick').click(); await page.locator('#mint-name').fill('Fixture mint')
    if (type === 'sbt') await page.getByRole('radio', { name: /SBT/ }).click()
    await page.getByRole('button', { name: type === 'nft' ? /Mint NFT/ : /Mint SBT/ }).click()
    await page.waitForFunction((hash) => window.__watchHash === hash, HASH)
    const submitted = await page.evaluate(() => window.__writes[0])
    assert.equal(submitted.actor, A); assert.equal(submitted.address, target); assert.equal(submitted.functionName, type === 'nft' ? 'mintTo' : 'mintSoulboundTo'); assert.deepEqual(submitted.args, [A, 'ipfs://fixture-meta'])
    if (switched) { await page.evaluate((address) => window.__changeWallet(address), B); await page.getByRole('radio', { name: /SBT/ }).click() }
    assert.equal(await page.evaluate(() => window.__watchHash), HASH)
    const mint = { address: target, topics: encodeEventTopics({ abi: submitted.abi, eventName: type === 'nft' ? 'Minted' : 'SoulboundMinted', args: { to: A, tokenId: 7n } }), data: encodeAbiParameters([{ type: 'string' }], ['ipfs://fixture-meta']) }
    const transfer = { address: target, topics: encodeEventTopics({ abi: erc721Abi, eventName: 'Transfer', args: { from: '0x0000000000000000000000000000000000000000', to: A, tokenId: 7n } }), data: '0x' }
    const unknown = { address: target, topics: encodeEventTopics({ abi: erc721Abi, eventName: 'Approval', args: { owner: A, spender: B, tokenId: 7n } }), data: '0x' }
    const logs = scenario.unknown ? [unknown] : scenario.transfer ? [transfer, mint] : [mint]
    assert.ok(logs.every((log) => log.topics.every((topic) => typeof topic === 'string' && /^0x[0-9a-f]{64}$/i.test(topic))), 'Actual encoded receipt topics must be bytes32, not query wildcards')
    await page.evaluate((logs) => window.__settle({ logs }), logs)
    await page.locator('#receipt-panel').waitFor({ state: 'visible', timeout: 10000 })
    const done = JSON.parse(await page.locator('#receipt-panel').innerText()), quota = await page.evaluate(() => JSON.parse(localStorage.getItem('cuvetsmo:play:mint:quota'))), counts = (address) => quota.entries.find((r) => r.address === address)?.timestamps.length ?? 0
    const row = { case: scenario.name, type, switched, expected_contract: target, expected_token: scenario.unknown ? null : '7', contract: done.contractAddress ?? done.contract, token_id: done.tokenId ?? null, quota_A: counts(A), quota_B: counts(B), submitted_abi_sha256: createHash('sha256').update(JSON.stringify(submitted.abi)).digest('hex'), submitted_request_unchanged: await page.evaluate((submitted) => JSON.stringify(window.__writes[0]) === JSON.stringify(submitted) && window.__writes.length === 1, submitted), unexpected_network: await page.evaluate(() => window.__unexpected), actual_react: true, event_encoding: 'installed viem real encodeEventTopics/encodeAbiParameters', sdk_and_uploads: 'explicit local mocks; no signing/wallet/provider/RPC/mint' }
    records.push(row); await context.close()
  }
} finally { await browser.close(); await new Promise((done) => server.close(done)) }
await writeFile(dir + '/' + mode + '-receipt.json', JSON.stringify({ checked_at: new Date().toISOString(), base, records }, null, 2))
if (mode === 'before') {
  console.log(JSON.stringify({ mode, observed: records[0], expected: { contract: NFT, token_id: '7', quota_A: 1, quota_B: 0 } }))
  assert.equal(records[0].contract, NFT, 'Delayed receipt must use the submitted NFT contract')
} else if (mode === 'snapshot') {
  console.log(JSON.stringify({ mode, incorrect_token_ids: records.filter((r) => r.token_id !== r.expected_token).map((r) => ({ case: r.case, token_id: r.token_id, expected: r.expected_token })) }))
  assert.equal(records.find((r) => r.case === 'transfer-before-minted').token_id, '7', 'Transfer recipient is not a token ID')
} else {
  for (const row of records) { assert.equal(row.contract, row.expected_contract); assert.equal(row.token_id, row.expected_token); assert.equal(row.quota_A, 1); assert.equal(row.quota_B, 0); assert.equal(row.submitted_request_unchanged, true); assert.deepEqual(row.unexpected_network, []) }
  const before = JSON.parse(await readFile(dir + '/before-receipt.json', 'utf8')).records[0]
  assert.equal(before.contract, SBT); assert.equal(before.quota_A, 0); assert.equal(before.quota_B, 1); assert.equal(before.token_id, null)
  assert.ok(records.filter((row) => row.type === 'nft').every((row) => row.submitted_abi_sha256 === before.submitted_abi_sha256))
  const snapshot = JSON.parse(await readFile(dir + '/snapshot-receipt.json', 'utf8')).records
  assert.ok(records.every((row) => row.submitted_abi_sha256 === snapshot.find((old) => old.case === row.case).submitted_abi_sha256))
  console.log(JSON.stringify({ mode, passed: true, cases: records.length, real_viem_encoding_decoding: true, unknown_token_id: null, authorized_call_unchanged: true, rpc_or_signing: false }))
}
