import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'
const {chromium}=await import(pathToFileURL(process.argv[2]).href)
const root=process.cwd(),base='40c748603f63fd6cf2033f24bdd8269331d20584',candidate=resolve('app/play/board/_polls.tsx')
const KEY='cuvetsmo:play:polls:v1'
const good=JSON.stringify([{id:'saved',question:'Previously saved question',options:[{id:'a',label:'Preserved choice',votes:0}],createdBy:'system',createdAt:1,votes:[]}])
const cases=[['valid',good],['invalid-json','{'],['invalid-row',JSON.stringify([{id:'partial',question:'Damaged row',createdBy:'system',createdAt:1,votes:[]}])],['empty','[]'],['read-error',good]]
const entry=`import React from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';import {Polls} from './app/play/board/_polls';class Boundary extends React.Component{state={failed:false};static getDerivedStateFromError(){return{failed:true}}render(){return this.state.failed?<p id='render-error'>render failed</p>:this.props.children}}flushSync(()=>createRoot(document.getElementById('root')).render(<Boundary><Polls/></Boundary>));`
const browser=await chromium.launch({headless:true}),receipts=[]
try{
 for(const fixed of [false,true]){
  const bundle=await build({stdin:{contents:entry,sourcefile:'fixture.tsx',resolveDir:root,loader:'tsx'},bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic',plugins:[{name:'local-boundaries',setup(b){
   b.onResolve({filter:/^@privy-io\/react-auth$/},()=>({path:'sdk',namespace:'fixture'}));b.onResolve({filter:/^wagmi(?:\/chains)?$/},a=>({path:a.path,namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:a.path==='sdk'?`export const usePrivy=()=>({ready:true,authenticated:!!window.__allowLocalCreate,login(){window.__login++}});`:a.path==='wagmi/chains'?`export const baseSepolia={id:84532};`:`export const useAccount=()=>window.__allowLocalCreate?({address:'0x1111111111111111111111111111111111111111'}):({});export const useSignTypedData=()=>({signTypedDataAsync(){window.__sign++;throw Error('not permitted in fixture')}});`,loader:'js',resolveDir:root}));
   b.onResolve({filter:/^@\/lib\/utils$/},()=>({path:resolve(root,'lib/utils.ts')}));b.onLoad({filter:/app[\\/]play[\\/]board[\\/]_polls\.tsx$/},async a=>({contents:fixed?await readFile(candidate,'utf8'):execFileSync('git',['show',base+':app/play/board/_polls.tsx'],{encoding:'utf8'}),loader:'tsx',resolveDir:dirname(a.path)}))
  }}]})
  for(const [name,raw] of fixed?[...cases,['create','[]'],['write-error','[]']]:cases){
   const context=await browser.newContext({acceptDownloads:true});await context.route('https://polls-fixture.test/',r=>r.fulfill({contentType:'text/html',body:'<div id="root"></div>'}))
   await context.addInitScript(({key,raw,name})=>{localStorage.setItem(key,raw);window.__writes=0;window.__sign=0;window.__login=0;window.__failRead=name==='read-error';window.__failWrite=false;window.__allowLocalCreate=['create','write-error'].includes(name);const original=Storage.prototype.setItem,get=Storage.prototype.getItem;window.__raw=()=>get.call(localStorage,key);Storage.prototype.getItem=function(k){if(k===key&&window.__failRead)throw Error('controlled read failure');return get.call(this,k)};Storage.prototype.setItem=function(k,v){if(k===key){window.__writes++;if(window.__failWrite)throw Error('controlled write failure')}return original.call(this,k,v)}},{key:KEY,raw,name})
   const page=await context.newPage();await page.goto('https://polls-fixture.test/');await page.addScriptTag({content:bundle.outputFiles[0].text})
   // Wait for the actual effect/storage notification task to finish; no implementation predicates are injected.
   await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,30)))
   const result=await page.evaluate(()=>({writes:window.__writes,sign:window.__sign,login:window.__login,crashed:Boolean(document.querySelector('#render-error')),alert:Boolean(document.querySelector('[role="alert"]')),text:document.body.textContent,raw:window.__raw()}))
   const row={source:fixed?'candidate':'released',case:name,raw_preserved:result.raw===raw,writes:result.writes,render_crash:result.crashed,storage_notice:result.alert,valid_question_visible:result.text.includes('Previously saved question'),seed_visible:result.text.includes('ปี 4 วิชาไหนหนักที่สุด?'),sign_calls:result.sign,login_calls:result.login}
   if(fixed&&['invalid-json','invalid-row'].includes(name)){
    const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'ดาวน์โหลดข้อมูลเดิม',exact:true}).click();const download=await downloadPromise
    row.manual_download_exact=(await readFile(await download.path(),'utf8'))===raw
   }
   if(fixed&&name==='read-error'){
    await page.evaluate(()=>window.__failRead=false);await page.getByRole('button',{name:'ลองอ่านใหม่',exact:true}).click();await page.getByRole('heading',{name:'Previously saved question',exact:true}).waitFor({state:'visible'});row.retry_recovers=true
   }
   if(fixed&&['create','write-error'].includes(name)){
    await page.getByRole('button',{name:'Create poll',exact:true}).click();await page.getByPlaceholder('คำถาม...',{exact:true}).fill('New explicit local poll');await page.getByPlaceholder('Option 1',{exact:true}).fill('First choice');await page.getByPlaceholder('Option 2',{exact:true}).fill('Second choice')
    if(name==='write-error')await page.evaluate(()=>window.__failWrite=true)
    await page.getByRole('button',{name:'Publish poll',exact:true}).click()
    if(name==='create'){await page.getByRole('heading',{name:'New explicit local poll',exact:true}).waitFor({state:'visible'});row.explicit_create_persisted=JSON.parse(await page.evaluate(()=>window.__raw())).some(p=>p.question==='New explicit local poll');row.create_ui_updated=true}
    else {row.failed_write_keeps_draft=(await page.getByPlaceholder('คำถาม...',{exact:true}).inputValue())==='New explicit local poll'&&(await page.getByPlaceholder('Option 1',{exact:true}).inputValue())==='First choice';row.raw_preserved=(await page.evaluate(()=>window.__raw()))===raw;row.write_failure_visible=(await page.locator('body').innerText()).includes('ยังบันทึกโพลไม่ได้')}
    row.writes=await page.evaluate(()=>window.__writes)
   }
   row.sign_calls=await page.evaluate(()=>window.__sign);row.login_calls=await page.evaluate(()=>window.__login)
   if(name==='create')row.raw_preserved=(await page.evaluate(()=>window.__raw()))===raw
   receipts.push(row)
   await context.close()
  }
 }
}finally{await browser.close()}
await writeFile('work/wave2-candidate/poll-storage-check.json',JSON.stringify({checked_at:new Date().toISOString(),receipts,scope:'actual Polls/React/native Chromium localStorage; SDK read-only boundaries mocked, no real wallet/RPC/signing'},null,2)+'\n')
assert.equal(receipts.find(r=>r.source==='released'&&r.case==='invalid-json').raw_preserved,false)
assert.equal(receipts.find(r=>r.source==='released'&&r.case==='invalid-row').render_crash,true)
for(const row of receipts.filter(r=>r.source==='candidate')){
 assert.equal(row.render_crash,false);assert.equal(row.sign_calls,0);assert.equal(row.login_calls,0)
 if(row.case==='create'){assert.equal(row.explicit_create_persisted,true);assert.equal(row.create_ui_updated,true);assert.equal(row.writes,1)}
 else if(row.case==='write-error'){assert.equal(row.raw_preserved,true);assert.equal(row.failed_write_keeps_draft,true);assert.equal(row.write_failure_visible,true);assert.equal(row.writes,1)}
 else {assert.equal(row.raw_preserved,true);assert.equal(row.writes,0);if(row.case==='valid')assert.equal(row.valid_question_visible,true);else{assert.equal(row.seed_visible,false);if(row.case!=='empty')assert.equal(row.storage_notice,true)}}
 if(['invalid-json','invalid-row'].includes(row.case))assert.equal(row.manual_download_exact,true)
 if(row.case==='read-error')assert.equal(row.retry_recovers,true)
}
console.log(JSON.stringify({passed:true,cases:receipts.length,observed_before:['invalid JSON overwritten on mount','invalid saved row crashes render'],candidate:'original bytes preserved; malformed input guarded; no automatic writes/signing'}))
