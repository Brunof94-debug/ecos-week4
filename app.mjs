import { SAMPLE } from './samples.mjs';
import { COPY } from './i18n.mjs';
import { MODEL, LIMITS, MIN_SIMILARITY } from './model-config.mjs';
import {validateMemory,validateArchive,validateShelf,chunkMemory,rankChunks,selectHits,timeline,conflictingAccounts} from './core.mjs';

const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STORAGE='ecos-archive-v1';
let language='en';
try { language = new URL(location.href).searchParams.get('lang') || localStorage.getItem('ecos-language') || 'en'; } catch {}
if (!COPY[language]) language='en';
let memories=SAMPLE.map(validateMemory), shelf=[], isSample=true, saved=false;
try {
  const raw=localStorage.getItem(STORAGE);
  if(raw) { const archive=JSON.parse(raw); const records=validateArchive(archive); const kept=validateShelf(archive.shelf,records); memories=records; shelf=kept; isSample=!!archive.isSample; saved=true; }
} catch { /* An invalid local copy never replaces the fictional sample. */ }
let worker=null, pending=new Map(), nextId=0, ready=false, busy=false, chunks=[], vectors=[], currentHits=null, activeSource=null, activeTab='memories';
let receipt={model:MODEL, indexedPassages:0, queryRuns:[], contentUploaded:false};
const t = key => COPY[language][key] || key;
const yearLabel=m=>m.year===null?t('unknown'):(m.precision==='circa'?`${t('around')} `:'')+m.year;
function notice(message,error=false) { $('#notice').textContent=message; $('#notice').hidden=false; $('#notice').classList.toggle('error',error); }
function languageUI() {
  document.documentElement.lang=language;
  document.title=language==='pt'?'Ecos · As histórias que levamos':'Ecos · The stories we carry';
  for(const el of document.querySelectorAll('[data-i18n]')) el.textContent=t(el.dataset.i18n);
  $('#query').placeholder=t('queryPlaceholder');
  $('#language').textContent=language==='en'?'PT':'EN';
  $('#language').setAttribute('aria-label',language==='en'?'Switch to Portuguese':'Mudar para inglês');
  for(const el of document.querySelectorAll('.suggestions button')) {
    const queries=language==='pt'?['Uma festa durante uma queda de energia','Quem consertava roupas em vez de comprar outras?','Saudade da avó através de um cheiro']:['A celebration without electric lights','Who gave broken clothes a second life?','Remembering grandma through the smell of her apron'];
    el.dataset.query=queries[[...el.parentNode.querySelectorAll('button')].indexOf(el)];
  }
  render();
  $('#model-status').textContent=t(ready?'ready':'notLoaded');
  $('#about-content').innerHTML=['private','honest','privacy','storage','limits','open'].map(section=>`<h3>${esc(t(section+'Heading'))}</h3><p>${esc(t(section+'Body'))}</p>`).join('')+`<p><code>${esc(MODEL.id)} · ${esc(MODEL.revision)} · ${esc(MODEL.dtype)}</code></p>`;
}
function render() {
  $('#collection-label').textContent=t(isSample?'fictional':'untitledCollection');
  $('#storage-note').textContent=t(saved?'savedNote':'session');
  $('#shelf-count').textContent=shelf.length;
  $('#memory-count').textContent=`${memories.length} ${t(memories.length===1?'memorySingular':'memoryPlural')}`;
  $('#results-title').textContent=t(currentHits?'results':'allMemories');
  $('#show-all').hidden=currentHits===null;
  $('#results-info').textContent=currentHits?t('resultHelp'):'';
  const byId=new Map(memories.map(m=>[m.id,m]));
  const conflicts=conflictingAccounts(memories);
  $('#conflicts').innerHTML=conflicts.map(group=>`<div class="conflict-note"><b>${esc(t('conflictTitle'))} ${esc(group.map(m=>`${m.narrator}: ${yearLabel(m)}`).join(' · '))}</b>${esc(t('conflictBody'))}<br><button data-compare="${esc(group[0].event)}">${esc(t('conflictRead'))} ↗</button></div>`).join('');
  $('#timeline').innerHTML=timeline(memories).map(m=>`<button class="time-item" data-source="${esc(m.id)}"><b>${esc(yearLabel(m))}</b><span>${esc(m.title)}</span></button>`).join('');
  const display=currentHits===null?memories.map(m=>({...chunkMemory(m)[0],full:true})):currentHits;
  $('#memory-grid').innerHTML=display.map((hit,i)=>{
    const m=byId.get(hit.memoryId); if(!m)return '';
    const colors=['#9ba586','#c28a60','#8fa3a2','#bca575'];
    const quote=hit.full?(m.text.split('\n')[0].length>170?m.text.split('\n')[0].slice(0,170)+'…':m.text.split('\n')[0]):hit.text;
    return `<article class="memory-card" style="--accent:${colors[i%4]}"><div class="card-kicker"><span>✧</span>${esc(hit.full?m.kind:t('quoteKind'))}<span class="date">${esc(yearLabel(m))}</span></div><h4>${esc(m.title)}</h4>${!hit.full?`<div class="result-label">${esc(t('line'))} ${hit.line} · ${esc(t('chars'))} ${hit.start}–${hit.end}</div>`:''}<blockquote>“${esc(quote)}”</blockquote><div class="card-footer"><span class="narrator"><i>${esc(m.narrator.split(' ').map(w=>w[0]).slice(0,2).join(''))}</i>${esc(m.narrator)}</span><button class="text-button" data-source="${esc(m.id)}" data-start="${hit.start}" data-end="${hit.end}" data-line="${hit.line}">${esc(t('read'))} ↗</button></div></article>`;
  }).join('');
  if(!display.length) $('#memory-grid').innerHTML=`<div class="empty"><h3>${esc(t(currentHits?'nothing':'noMemories'))}</h3><p>${esc(t(currentHits?'nothingHelp':'noMemoriesHelp'))}</p></div>`;
  renderShelf();
}
function renderShelf() {
  $('#shelf-items').innerHTML=shelf.map((item,i)=>{const m=memories.find(m=>m.id===item.memoryId);return `<article class="shelf-card"><blockquote>“${esc(m.text.slice(item.start,item.end))}”</blockquote><div><span>${esc(m.title)} · ${esc(m.narrator)} · ${esc(yearLabel(m))} · ${esc(t('line'))} ${item.line}</span><button class="text-button" data-unpin="${i}">${esc(t('remove'))} ×</button></div></article>`}).join('') || `<div class="empty"><h3>${esc(t('shelfEmpty'))}</h3><p>${esc(t('shelfEmptyHelp'))}</p></div>`;
}
function showSource(id,start,end,line) {
  const m=memories.find(m=>m.id===id); if(!m)return;
  const first=chunkMemory(m)[0];
  const a=Number.isInteger(start)&&start>=0?start:first.start;
  const b=Number.isInteger(end)&&end>a&&end<=m.text.length?end:first.end;
  const n=m.text.slice(0,a).split('\n').length;
  activeSource={memoryId:id,start:a,end:b,line:n};
  $('#source-title').textContent=m.title;
  $('#source-meta').textContent=`${t('by')} ${m.narrator} · ${yearLabel(m)} · ${t('dateHint')}`;
  $('#source-citation').textContent=`${m.id} · ${t('line')} ${n} · ${t('chars')} ${a}–${b} (UTF-16)`;
  $('#source-text').innerHTML=esc(m.text.slice(0,a))+'<mark>'+esc(m.text.slice(a,b))+'</mark>'+esc(m.text.slice(b));
  $('#source-dialog').showModal();
}
function setBusy(value) {
  busy=value; $('#search-button').disabled=value||!ready; $('#enable-button').disabled=value;
  for(const selector of ['#add-button','#import-button','#reset-button','#clear-button','#language']) $(selector).disabled=value;
  $('#cancel-button').hidden=!value;
}
function ensureWorker() {
  if(worker)return;
  worker=new Worker(new URL('./worker.mjs',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{
    if(data.type==='progress') { $('#model-progress').value=data.progress; $('#model-status').textContent=`${t('load')} · ${data.progress}%`; }
    if(data.type==='stage') $('#model-status').textContent=t('index');
    if(data.type==='result'||data.type==='error') {
      const request=pending.get(data.id); if(!request)return;
      clearTimeout(request.timer); pending.delete(data.id);
      if(data.type==='result') request.resolve(data); else request.reject(new Error(data.message));
    }
  };
  worker.onerror=event=>{console.error('Ecos worker:',event.message);stopWorker(new Error(event.message || t('modelFailed')));};
}
function stopWorker(error=new DOMException('Search cancelled.','AbortError')) {
  worker?.terminate(); worker=null;ready=false;vectors=[];chunks=[];
  for(const request of pending.values()) { clearTimeout(request.timer);request.reject(error); } pending.clear();
  $('#model-dot').className='status-dot'; $('#model-progress').hidden=true; $('#enable-button').hidden=false;setBusy(false);
}
function embed(texts) {
  ensureWorker(); const id=++nextId;
  return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{stopWorker(new Error('Model request timed out.'));},240000);pending.set(id,{resolve,reject,timer});worker.postMessage({id,texts});});
}
async function enableSearch() {
  if(busy||!memories.length) {if(!memories.length)notice(t('emptyExport'));return;}
  setBusy(true); $('#model-dot').className='status-dot loading'; $('#model-progress').hidden=false; $('#model-progress').value=0;
  $('#model-status').textContent=t('load'); $('#notice').hidden=true;
  try {
    const index=memories.flatMap(chunkMemory);
    const result=await embed(index.map(c=>c.text));
    chunks=index; vectors=result.vectors;ready=true;
    receipt={...receipt,indexedPassages:chunks.length,indexElapsedMs:result.elapsedMs,indexedAt:new Date().toISOString()};
    $('#model-dot').className='status-dot ready'; $('#model-status').textContent=t('ready'); $('#enable-button').hidden=true;
    $('#download-note').textContent=t('download'); $('#model-progress').hidden=true;
  } catch(error) {stopWorker();if(error.name!=='AbortError'){console.error('Ecos model load:',error.message);$('#model-status').textContent=t('modelFailed');notice(t('modelFailed'),true);}}
  finally {setBusy(false);}
}
async function search(event) {
  event.preventDefault(); const query=$('#query').value.trim(); if(busy||!ready||!query)return;
  setBusy(true);$('#model-status').textContent=t('searching');
  try {
    const response=await embed([query]);
    currentHits=selectHits(rankChunks(chunks,vectors,response.vectors[0]));
    const proof={query,elapsedMs:response.elapsedMs,hits:currentHits.map(h=>({memoryId:h.memoryId,start:h.start,end:h.end,line:h.line,similarity:Number(h.similarity.toFixed(6))})),threshold:MIN_SIMILARITY};
    receipt.queryRuns.push(proof);receipt.queryRuns=receipt.queryRuns.slice(-12);
    render();switchTab('memories');
    $('#model-status').textContent=t('ready');
  } catch(error) {if(error.name!=='AbortError'){console.error('Ecos search:',error.message);notice(t('searchFailed'),true);$('#model-status').textContent=t('searchFailed');}}
  finally{setBusy(false);}
}
function switchTab(tab) {
  activeTab=tab;$('#tab-memories').setAttribute('aria-selected',String(tab==='memories'));$('#tab-shelf').setAttribute('aria-selected',String(tab==='shelf'));
  $('#collection-panel').hidden=tab!=='memories';$('#shelf-panel').hidden=tab!=='shelf';
}
async function confirmAction(title,message) {
  $('#confirm-title').textContent=title;$('#confirm-message').textContent=message;
  const dialog=$('#confirm-dialog');dialog.showModal();
  return new Promise(resolve=>{
    const finish=answer=>{dialog.close();$('#confirm-yes').onclick=null;$('#confirm-no').onclick=null;dialog.oncancel=null;resolve(answer);};
    $('#confirm-yes').onclick=()=>finish(true);$('#confirm-no').onclick=()=>finish(false);dialog.oncancel=()=>finish(false);
  });
}
function replaceCollection(records,sample=false,kept=[]) {
  stopWorker();memories=records;shelf=validateShelf(kept,records);isSample=sample;saved=false;currentHits=null;receipt={model:MODEL,indexedPassages:0,queryRuns:[],contentUploaded:false};
  $('#model-status').textContent=t('notLoaded');$('#query').value='';render();switchTab('memories');
}
function download(name,contents,type='application/json') {
  const url=URL.createObjectURL(new Blob([contents],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
async function archiveObject() {
  const records=await Promise.all(memories.map(async m=>({...m,sha256:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(m.text)))).map(x=>x.toString(16).padStart(2,'0')).join('')})));
  return {format:'ecos-archive-v1',exportedAt:new Date().toISOString(),isSample,memories:records,shelf,searchReceipt:receipt};
}
$('#language').onclick=()=>{language=language==='en'?'pt':'en';try{localStorage.setItem('ecos-language',language);}catch{}languageUI();};
$('#about-button').onclick=()=>$('#about-dialog').showModal();
for(const button of document.querySelectorAll('[data-close]')) button.onclick=()=>document.getElementById(button.dataset.close).close();
$('#add-button').onclick=()=>{if(memories.length>=LIMITS.memories)return notice(t('full'),true);$('#memory-form').reset();$('#form-error').textContent='';$('#memory-dialog').showModal();};
$('#memory-form').onsubmit=event=>{
  event.preventDefault();const form=new FormData(event.target);
  try{
    if(memories.length>=LIMITS.memories)throw new Error(t('full'));
    const memory=validateMemory(Object.fromEntries(form));
    stopWorker();memories.push(memory);saved=false;isSample=false;currentHits=null;$('#model-status').textContent=t('notLoaded');render();$('#memory-dialog').close();notice(t('added'));
  }catch(error){$('#form-error').textContent=error.message;}
};
$('#search-form').onsubmit=search;$('#enable-button').onclick=enableSearch;
$('#cancel-button').onclick=()=>{stopWorker();$('#model-status').textContent=t('notLoaded');};
for(const button of document.querySelectorAll('[data-query]')) button.onclick=()=>{$('#query').value=button.dataset.query;$('#query').focus();if(ready)$('#search-form').requestSubmit();else notice(t('notLoaded'));};
$('#show-all').onclick=()=>{currentHits=null;render();};
$('#tab-memories').onclick=()=>switchTab('memories');$('#tab-shelf').onclick=()=>switchTab('shelf');
for(const tab of [$('#tab-memories'),$('#tab-shelf')]) tab.onkeydown=event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();const next=activeTab==='memories'?'shelf':'memories';switchTab(next);$('#tab-'+next).focus();}};
document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.source)showSource(button.dataset.source,button.hasAttribute('data-start')?Number(button.dataset.start):undefined,button.hasAttribute('data-end')?Number(button.dataset.end):undefined);
  if(button.dataset.compare){const group=memories.filter(m=>m.event.trim().toLowerCase()===button.dataset.compare.trim().toLowerCase());currentHits=group.map(m=>({...chunkMemory(m)[0],text:chunkMemory(m)[0].text}));render();}
  if(button.hasAttribute('data-unpin')){shelf.splice(Number(button.dataset.unpin),1);saved=false;render();notice(t('removed'));}
});
$('#pin-source').onclick=()=>{if(!activeSource)return;if(shelf.some(s=>s.memoryId===activeSource.memoryId&&s.start===activeSource.start&&s.end===activeSource.end)){notice(t('alreadyPinned'));$('#source-dialog').close();return;}if(shelf.length>=80){notice(language==='pt'?'O cantinho comporta até 80 trechos. Baixe uma cópia antes de remover algum.':'The shelf holds up to 80 passages. Download a copy before removing one.',true);$('#source-dialog').close();return;}shelf.push({...activeSource});saved=false;render();$('#source-dialog').close();notice(t('pinned'));};
$('#reset-button').onclick=async()=>{if(memories.length&&!await confirmAction(t('openTitle'),t('openMessage')))return;replaceCollection(SAMPLE.map(validateMemory),true);$('#notice').hidden=true;};
$('#clear-button').onclick=async()=>{if(!await confirmAction(t('clearTitle'),t('clearMessage')))return;try{localStorage.removeItem(STORAGE);}catch{}replaceCollection([]);notice(t('cleared'));};
$('#save-button').onclick=async()=>{if(!memories.length)return notice(t('emptyExport'));try{localStorage.setItem(STORAGE,JSON.stringify(await archiveObject()));saved=true;render();notice(t('saved'));}catch{notice(t('saveFailed'),true);}};
$('#export-button').onclick=async()=>{if(!memories.length)return notice(t('emptyExport'));download('ecos-archive.json',JSON.stringify(await archiveObject(),null,2));notice(t('exported'));};
$('#export-shelf').onclick=()=>{if(!shelf.length)return notice(t('noShelfExport'));const text='# Ecos — '+t('shelf')+'\n\n'+shelf.map(item=>{const m=memories.find(m=>m.id===item.memoryId);return `${m.title}\n${m.narrator} · ${yearLabel(m)}\n\n${m.text.slice(item.start,item.end)}\n\n[${m.id}, ${t('line')} ${item.line}, UTF-16 ${item.start}–${item.end}]`;}).join('\n\n---\n\n');download('ecos-keepsake.txt',text,'text/plain;charset=utf-8');};
$('#import-button').onclick=()=>$('#import-file').click();
$('#import-file').onchange=async event=>{
  const file=event.target.files[0];if(!file)return;
  try{
    if(file.size>LIMITS.archiveBytes)throw new Error('Archive exceeds 600 KB.');
    const input=JSON.parse(await file.text());const records=validateArchive(input);
    for(const memory of records){const supplied=input.memories.find(m=>m.id===memory.id)?.sha256;if(supplied){const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(memory.text)))).map(x=>x.toString(16).padStart(2,'0')).join('');if(digest!==supplied)throw new Error('A story does not match its stored SHA-256.');}}
    if(memories.length&&!await confirmAction(t('openTitle'),t('openMessage')))return;
    replaceCollection(records,!!input.isSample,input.shelf);notice(t('imported'));
  }catch(error){notice(t('importBad')+' '+error.message,true);}finally{event.target.value='';}
};
$('#offline-button').onclick=async()=>{
  notice(t('offlineWorking'));
  try{
    const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});
    if(registration.installing){await new Promise((resolve,reject)=>{const sw=registration.installing;sw.addEventListener('statechange',()=>{if(sw.state==='activated')resolve();if(sw.state==='redundant')reject(new Error('Cache install failed.'));});setTimeout(()=>reject(new Error('Cache install timed out.')),90000);});}
    notice(t('offlineReady'));
  }catch{notice(t('offlineFail'),true);}
};
languageUI();
