import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { resolve, dirname, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'
const {chromium}=await import(pathToFileURL(process.argv[2]).href)
const root=process.cwd(),base='6cffe2cd1a1ee970b273125bd8f6bcf4b8dfc288'
const A='0x1111111111111111111111111111111111111111',B='0x2222222222222222222222222222222222222222',C='0x3333333333333333333333333333333333333333'
const SA='0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',SB='0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
const sdk=`import {useSyncExternalStore} from 'react';let row={wallets:[]};const listeners=new Set();export function useWallets(){return useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn)},()=>row,()=>row)};window.__wallet=(address)=>{row={wallets:address?[{address,walletClientType:'privy'}]:[]};listeners.forEach(fn=>fn())};`
const aa=`export const aaSponsorshipReady=()=>true;export const getSmartAccountAddressFor=wallet=>new Promise((resolve,reject)=>window.__pending.push({eoa:wallet.address,resolve,reject}));`
const entry=`import React,{useState} from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';import {renderToString} from 'react-dom/server.browser';import {useUserAddresses} from './lib/use-user-addresses';import {NumberTicker} from './app/(marketing)/_components/number-ticker';
window.__pending=[];let now=0,nextFrame=0;const frames=new Map(),observers=[];window.__frames=frames;Object.defineProperty(performance,'now',{value:()=>now});window.requestAnimationFrame=fn=>{const id=++nextFrame;frames.set(id,fn);return id};window.cancelAnimationFrame=id=>frames.delete(id);window.IntersectionObserver=class{constructor(callback){this.callback=callback;this.active=false;observers.push(this)}observe(){this.active=true}disconnect(){this.active=false}};
window.__frame=time=>{now=time;const tasks=[...frames.values()];frames.clear();flushSync(()=>tasks.forEach(fn=>fn(time)))};window.__intersect=()=>observers.filter(o=>o.active).forEach(o=>o.callback([{isIntersecting:true}]));window.__changeWallet=address=>flushSync(()=>window.__wallet(address));
function Probe(){const value=useUserAddresses();return <pre id='addresses'>{JSON.stringify(value)}</pre>};function App(){const [value,setValue]=useState(10),[visible,setVisible]=useState(true),[key,setKey]=useState(0);window.__value=v=>flushSync(()=>setValue(v));window.__unmount=()=>flushSync(()=>setVisible(false));window.__remount=()=>{flushSync(()=>setVisible(false));flushSync(()=>{setKey(k=>k+1);setVisible(true)})};return <><Probe/><div id='ticker' data-requested={value}>{visible&&<NumberTicker key={key} value={value} duration={100}/>}</div></>};window.__ssr=renderToString(<NumberTicker value={99}/>);flushSync(()=>createRoot(document.getElementById('root')).render(<App/>));`
const browser=await chromium.launch({headless:true}),receipts=[]
try{
 for(const before of [true,false]){
  const bundle=await build({stdin:{contents:entry,resolveDir:root,sourcefile:'fixture.tsx',loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',plugins:[{name:'actual-source-boundaries',setup(b){b.onResolve({filter:/^@privy-io\/react-auth$/},()=>({path:'sdk',namespace:'fixture'}));b.onResolve({filter:/^\.\/aa-client$/},()=>({path:'aa',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:a.path==='sdk'?sdk:aa,loader:'js',resolveDir:root}));b.onLoad({filter:/(?:use-user-addresses\.ts|number-ticker\.tsx)$/},async a=>({contents:before?execFileSync('git',['show',base+':'+relative(root,a.path).replaceAll('\\','/')],{encoding:'utf8'}):await readFile(a.path,'utf8'),loader:'tsx',resolveDir:dirname(a.path)}))}}]})
  const page=await browser.newPage();await page.setContent('<div id="root"></div>');await page.addScriptTag({content:bundle.outputFiles[0].text})
  const state=()=>page.locator('#addresses').innerText().then(JSON.parse)
  await page.evaluate(address=>window.__changeWallet(address),A);await page.waitForFunction(a=>window.__pending.some(p=>p.eoa===a),A)
  await page.evaluate(({a,sa})=>window.__pending.find(p=>p.eoa===a).resolve(sa),{a:A,sa:SA});await page.waitForFunction(sa=>JSON.parse(document.querySelector('#addresses').textContent).smartAccount===sa,SA)
  await page.evaluate(address=>window.__changeWallet(address),B);const b=await state();await page.waitForFunction(a=>window.__pending.some(p=>p.eoa===a),B)
  await page.evaluate(address=>window.__changeWallet(address),C);await page.waitForFunction(a=>window.__pending.some(p=>p.eoa===a),C)
  await page.evaluate(({b,sb})=>window.__pending.find(p=>p.eoa===b).resolve(sb),{b:B,sb:SB});const late=await state()
  await page.evaluate(c=>window.__pending.find(p=>p.eoa===c).reject(Error('controlled resolution failure')),C);await page.waitForFunction(()=>JSON.parse(document.querySelector('#addresses').textContent).smartAccountResolved===true)
  const failure=await state();await page.evaluate(()=>window.__changeWallet(null));const disconnected=await state()
  await page.evaluate(()=>{window.__intersect();window.__frame(100)});assert.equal(await page.locator('#ticker').innerText(),'10')
  await page.evaluate(()=>{window.__value(20);window.__intersect();window.__frame(200)});const updated=await page.locator('#ticker').innerText()
  await page.evaluate(()=>{window.__value(30);window.__remount();window.__intersect();window.__frame(250)});const pending=await page.evaluate(()=>window.__frames.size)
  await page.evaluate(()=>window.__unmount());const after=await page.evaluate(()=>window.__frames.size)
  const result={candidate:before?'released-before':'fixed',normal_resolution:true,switch_hides_old_smart_account:b.eoa===B&&b.smartAccount===undefined&&!b.smartAccountResolved,late_prior_resolution_hidden:late.eoa===C&&late.smartAccount===undefined,resolution_failure_settles:failure.eoa===C&&failure.smartAccount===undefined&&failure.smartAccountResolved,disconnect_hides_resolution:!disconnected.eoa&&!disconnected.smartAccount&&!disconnected.smartAccountResolved,ticker_value_updates:updated==='20',ticker_raf_started:pending>0,ticker_cleanup:after===0,ssr_placeholder:await page.evaluate(()=>window.__ssr.includes('>0<')),boundary:'actual hook/ticker + native Chromium/React; SDK/address resolver mocked, no real wallet/RPC/signing'}
  receipts.push(result);await page.close()
 }
}finally{await browser.close()}
await writeFile('work/render-lifecycle.json',JSON.stringify({checked_at:new Date().toISOString(),receipts},null,2)+'\n')
assert.equal(receipts[0].switch_hides_old_smart_account,false);assert.equal(receipts[0].ticker_value_updates,false);assert.equal(receipts[0].ticker_cleanup,false)
for(const [key,value] of Object.entries(receipts[1]))if(typeof value==='boolean')assert.equal(value,true,key)
console.log(JSON.stringify({passed:true,before_failed:['stale wallet account','ticker value','ticker RAF cleanup'],fixed:receipts[1]}))
