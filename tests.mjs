import test from 'node:test';
import assert from 'node:assert/strict';
import {validateMemory,validateArchive,validateShelf,chunkMemory,cosine,rankChunks,selectHits,timeline,conflictingAccounts} from './core.mjs';
import {SAMPLE} from './samples.mjs';

test('quotations preserve original Unicode, CRLF positions and physical line numbers',()=>{
 const text='  Avó, café e saudade.\r\n\r\nA carta dizia: “volto amanhã”. 👻\nNão há data.  ';
 const m=validateMemory({id:'unicode',title:'Letter',text,precision:'unknown'});
 const chunks=chunkMemory(m);
 assert.equal(m.text,text);assert.deepEqual(chunks.map(c=>c.line),[1,3,4]);
 for(const c of chunks)assert.equal(text.slice(c.start,c.end),c.text);
 assert.equal(chunks[1].text,'A carta dizia: “volto amanhã”. 👻');
});
test('long source lines are bounded without changing the archived source',()=>{
 const text=('A long remembered sentence 👻. ').repeat(100);
 const chunks=chunkMemory({id:'long',text});
 assert.ok(chunks.length>1);
 for(const c of chunks){assert.ok(c.text.length<=480);assert.equal(c.text,text.slice(c.start,c.end));assert.equal(c.line,1);assert.ok(!/^[\uDC00-\uDFFF]|[\uD800-\uDBFF]$/u.test(c.text));}
});
test('unknown and approximate dates remain distinct and unknown dates sort last',()=>{
 const unknown=validateMemory({id:'u',title:'Undated',text:'In 1987, perhaps.',precision:'unknown',year:1987});
 const approximate=validateMemory({id:'a',title:'About',text:'A story.',precision:'circa',year:1983});
 assert.equal(unknown.year,null);assert.equal(approximate.precision,'circa');assert.equal(timeline([unknown,approximate])[1].id,'u');
 assert.throws(()=>validateMemory({title:'Bad',text:'A story',precision:'year',year:0}));
});
test('a disagreement is flagged only for an explicit shared event label',()=>{
 const records=SAMPLE.map(validateMemory);
 assert.deepEqual(conflictingAccounts(records).map(group=>group.map(m=>m.id)),[['m06','m07']]);
 assert.equal(conflictingAccounts(records.map(m=>({...m,event:''}))).length,0);
 assert.equal(conflictingAccounts(records.map(m=>m.id==='m07'?{...m,year:1987}:m)).length,0);
});
test('malformed and oversized archives fail without silently dropping stories',()=>{
 assert.throws(()=>validateArchive({format:'other',memories:SAMPLE}));
 assert.throws(()=>validateArchive({format:'ecos-archive-v1',memories:[SAMPLE[0],SAMPLE[0]]}));
 assert.throws(()=>validateArchive({format:'ecos-archive-v1',memories:Array.from({length:41},(_,i)=>({...SAMPLE[0],id:String(i)}))}));
 assert.throws(()=>validateMemory({...SAMPLE[0],text:'x'.repeat(8001)}));
 assert.throws(()=>validateArchive({format:'ecos-archive-v1',memories:[{...SAMPLE[0],id:''}]}));
 const valid=validateArchive(JSON.parse(JSON.stringify({format:'ecos-archive-v1',memories:SAMPLE})));
 assert.deepEqual(valid.map(m=>m.text),SAMPLE.map(m=>m.text));
});
test('imported shelf citations derive line numbers from source and reject invalid ranges',()=>{
 const records=[validateMemory({id:'a',title:'A',text:'first\nsecond\nthird'})];
 assert.deepEqual(validateShelf([{memoryId:'a',start:6,end:12,line:'<img src=x onerror=alert(1)>'},{memoryId:'absent',start:0,end:4},{memoryId:'a',start:-1,end:4},{memoryId:'a',start:1,end:100}],records),[{memoryId:'a',start:6,end:12,line:2}]);
 assert.throws(()=>validateShelf(Array(81).fill({memoryId:'a',start:0,end:4}),records));
});
test('embedding mismatches and nonfinite model outputs cannot produce ranked evidence',()=>{
 assert.throws(()=>cosine([1],[1,2]));assert.throws(()=>cosine([NaN],[1]));
 assert.throws(()=>rankChunks([{id:'x'}],[],[1]));assert.equal(cosine([0,0],[1,0]),0);
});
test('retrieval can abstain and limits how many passages one voice contributes',()=>{
 const chunks=[{id:'a:0',memoryId:'a'},{id:'a:1',memoryId:'a'},{id:'a:2',memoryId:'a'},{id:'b:0',memoryId:'b'}];
 assert.deepEqual(rankChunks(chunks,[[0,1],[0,1],[0,1],[0,1]],[1,0]),[]);
 const ranked=rankChunks(chunks,[[1,0],[1,0],[1,0],[.8,.2]],[1,0]);
 assert.deepEqual(selectHits(ranked).map(h=>h.id),['a:0','a:1','b:0']);
});
