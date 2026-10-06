import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'
const {chromium}=await import(pathToFileURL(process.argv[2]).href)
const root=process.cwd(),base='f51e1544f717705aace12f35d7bfd6a209d33467',candidate=resolve('app/play/board/_guestbook.tsx')
const observe=process.argv.includes('--observe-before'),candidateOnly=process.argv.includes('--candidate-only')
const sdk=`export const usePrivy=()=>({ready:true,authenticated:false,login(){window.__writes++}});`
const wagmi=`const client={async getBlockNumber(){window.__reads++;return 100n},getContractEvents(args){window.__reads++;window.__query=args;return new Promise(resolve=>window.__history=resolve)}};export const useAccount=()=>({});export const usePublicClient=()=>client;export const useWriteContract=()=>({isPending:false,writeContractAsync(){window.__writes++;throw Error('forbidden fixture write')}});export const useWaitForTransactionReceipt=()=>({isSuccess:false,isLoading:false});export const useWatchContractEvent=options=>{window.__live=options.onLogs};`
const sponsored=`export const useSponsoredWrite=()=>({available:false,status:'idle',send(){window.__writes++;throw Error('forbidden sponsored write')}});`
const addresses=`export const PLAY_ADDRESSES={GUESTBOOK:'0x1111111111111111111111111111111111111111'};export const isLive=()=>true;`
const entry=`import React from 'react';import {createRoot} from 'react-dom/client';import {Guestbook} from './app/play/board/_guestbook';window.__reads=0;window.__writes=0;createRoot(document.getElementById('root')).render(<Guestbook/>);`
const hash='0x'+'a'.repeat(64),oldHash='0x'+'b'.repeat(64),sender='0x'+'1'.repeat(40)
const browser=await chromium.launch({headless:true}),receipts=[]
try{
 for(const fixed of observe?[false]:candidateOnly?[true]:[false,true]){
  const bundle=await build({stdin:{contents:entry,resolveDir:root,sourcefile:'fixture.tsx',loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env':'{}'},plugins:[{name:'readonly-event-boundaries',setup(b){
   b.onResolve({filter:/^@privy-io\/react-auth$/},()=>({path:'sdk',namespace:'fixture'}));b.onResolve({filter:/^wagmi$/},()=>({path:'wagmi',namespace:'fixture'}));b.onResolve({filter:/^@\/lib\/use-sponsored-write$/},()=>({path:'sponsored',namespace:'fixture'}));b.onResolve({filter:/^\.\.\/_lib\/addresses$/},()=>({path:'addresses',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:({sdk,wagmi,sponsored,addresses})[a.path],loader:'js',resolveDir:root}));
   b.onResolve({filter:/^@\//},a=>({path:resolve(root,a.path.slice(2)+'.ts')}));b.onLoad({filter:/app[\\/]play[\\/]board[\\/]_guestbook\.tsx$/},async a=>({contents:fixed?await readFile(candidate,'utf8'):execFileSync('git',['show',base+':app/play/board/_guestbook.tsx'],{encoding:'utf8'}),loader:'tsx',resolveDir:dirname(a.path)}))
  }}]})
  const page=await browser.newPage(),pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));await page.setContent('<div id="root"></div>');await page.addScriptTag({content:bundle.outputFiles[0].text});try{await page.waitForFunction(()=>typeof window.__history==='function'&&typeof window.__live==='function')}catch(error){await writeFile('work/guestbook-race-candidate/fixture-diagnostic.json',JSON.stringify({error:error.message,pageErrors,body:await page.locator('body').innerText(),state:await page.evaluate(()=>({reads:window.__reads,writes:window.__writes,history:typeof window.__history,live:typeof window.__live}))},null,2)+'\n');throw error}
  await page.evaluate(({hash,sender})=>window.__live([{transactionHash:hash,logIndex:0,args:{sender,message:'Synthetic live one',timestamp:101n}},{transactionHash:hash,logIndex:1,args:{sender,message:'Synthetic live two',timestamp:101n}}]),{hash,sender})
  await page.evaluate(({oldHash,sender})=>window.__history([{transactionHash:oldHash,logIndex:0,args:{sender,message:'Synthetic historical item',timestamp:100n}}]),{oldHash,sender})
  await page.getByText('Synthetic historical item',{exact:true}).waitFor({state:'visible'})
  const first=await page.locator('body').innerText();const initialLive=first.includes('Synthetic live one')&&first.includes('Synthetic live two')
  await page.evaluate(({hash,sender})=>window.__live([{transactionHash:hash,logIndex:0,args:{sender,message:'Synthetic live one',timestamp:101n}}]),{hash,sender})
  await page.getByText('Synthetic live one',{exact:true}).waitFor({state:'visible'})
  const result={source:fixed?'candidate':'released',late_history_keeps_both_live_events:initialLive,distinct_same_transaction_events:await page.getByText('Synthetic live two',{exact:true}).count()===1,duplicate_live_deduplicated:await page.getByText('Synthetic live one',{exact:true}).count()===1,historical_item_preserved:await page.getByText('Synthetic historical item',{exact:true}).count()===1,writes:await page.evaluate(()=>window.__writes),read_boundary_calls:await page.evaluate(()=>window.__reads),event_ids:[hash+':0',hash+':1',oldHash+':0'],scope:'actual React/Guestbook; delayed public history/live SDK fixtures only, no actual RPC/wallet/message'}
  receipts.push(result);await page.close()
 }
}finally{await browser.close()}
if(observe){assert.equal(receipts[0].late_history_keeps_both_live_events,false);await writeFile('work/guestbook-race-candidate/before-observation.json',JSON.stringify({checked_at:new Date().toISOString(),base,receipts},null,2)+'\n');console.log(JSON.stringify({reproduced:true,source:'released',lost_live_events:true,writes:receipts[0].writes}));}
else{
 const before=candidateOnly?JSON.parse(await readFile('work/guestbook-race-candidate/before-observation.json','utf8')).receipts[0]:receipts[0],fixed=receipts.at(-1)
 assert.equal(before.late_history_keeps_both_live_events,false);for(const [key,value] of Object.entries(fixed))if(typeof value==='boolean')assert.equal(value,true,key);assert.equal(fixed.writes,0)
 await writeFile('work/guestbook-race-candidate/history-race-check.json',JSON.stringify({checked_at:new Date().toISOString(),base,before,fixed},null,2)+'\n');console.log(JSON.stringify({passed:true,late_history_live_events_preserved:true,exact_event_ids:true,writes:0}))
}
