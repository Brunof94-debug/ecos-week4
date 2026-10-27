import { LIMITS, MIN_SIMILARITY } from './model-config.mjs';

export function validateMemory(input) {
  if (!input || typeof input !== 'object') throw new Error('Invalid memory.');
  const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
  const text = typeof input.text === 'string' ? input.text : '';
  if (!text.trim() || text.length > LIMITS.text) throw new Error('Memory text must contain 1–8,000 characters.');
  const title = clean(input.title, 100);
  if (!title) throw new Error('A title is required.');
  const precision = ['year', 'circa', 'unknown'].includes(input.precision) ? input.precision : 'unknown';
  const year = precision === 'unknown' ? null : Number(input.year);
  if (year !== null && (!Number.isInteger(year) || year < 1000 || year > 2100)) throw new Error('Choose a year between 1000 and 2100, or leave the date unknown.');
  return { id: clean(input.id, 80) || crypto.randomUUID(), title, narrator: clean(input.narrator, 80) || 'Anonymous', year, precision,
    event: clean(input.event, 80), text, kind: clean(input.kind, 40) || 'Written memory' };
}

export function validateArchive(input) {
  if (input?.format !== 'ecos-archive-v1' || !Array.isArray(input.memories)) throw new Error('This is not an Ecos archive.');
  if (input.memories.length > LIMITS.memories) throw new Error('An archive can hold up to 40 memories.');
  const memories = input.memories.map(memory => {
    if (typeof memory?.id !== 'string' || !memory.id.trim() || memory.id.length > 80) throw new Error('Every archived memory needs an identifier of up to 80 characters.');
    return validateMemory(memory);
  });
  if (new Set(memories.map(m => m.id)).size !== memories.length) throw new Error('Duplicate memory identifiers.');
  return memories;
}

export function validateShelf(items, records) {
  if (!Array.isArray(items)) return [];
  if (items.length > 80) throw new Error('A shelf can hold up to 80 passages.');
  return items.filter(item => records.some(m => m.id===item.memoryId && Number.isInteger(item.start) && Number.isInteger(item.end) && item.start>=0 && item.end>item.start && item.end<=m.text.length))
    .map(item => ({memoryId:item.memoryId,start:item.start,end:item.end,line:records.find(m=>m.id===item.memoryId).text.slice(0,item.start).split('\n').length}));
}

// All offsets refer to the unmodified JavaScript (UTF-16) source string.
export function chunkMemory(memory) {
  const chunks = [];
  const lines = memory.text.split('\n');
  let offset = 0;
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    let start = 0;
    while (start < line.length) {
      while (start < line.length && /\s/u.test(line[start])) start++;
      if (start >= line.length) break;
      let end = Math.min(start + LIMITS.chunk, line.length);
      if (end < line.length) {
        const space = line.lastIndexOf(' ', end);
        if (space > start + LIMITS.chunk / 2) end = space;
        // Do not cut a surrogate pair.
        if (/[\uD800-\uDBFF]/u.test(line[end - 1])) end--;
      }
      while (end > start && /\s/u.test(line[end - 1])) end--;
      if (end <= start) break;
      chunks.push({ id: `${memory.id}:${chunks.length}`, memoryId: memory.id, start: offset + start,
        end: offset + end, line: lineIndex + 1, text: memory.text.slice(offset + start, offset + end) });
      start = end;
    }
    offset += line.length + 1;
  }
  return chunks;
}

export function cosine(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || !a.length || a.length !== b.length) throw new Error('Invalid embedding dimensions.');
  let dot = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i++) {
    if (!Number.isFinite(a[i]) || !Number.isFinite(b[i])) throw new Error('Non-finite embedding.');
    dot += a[i] * b[i]; aa += a[i] ** 2; bb += b[i] ** 2;
  }
  return aa && bb ? dot / Math.sqrt(aa * bb) : 0;
}

export function rankChunks(chunks, vectors, queryVector, threshold = MIN_SIMILARITY) {
  if (chunks.length !== vectors.length) throw new Error('Index does not match the archive.');
  return chunks.map((chunk, i) => ({ ...chunk, similarity: cosine(vectors[i], queryVector) }))
    .filter(hit => hit.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity || a.id.localeCompare(b.id));
}

export function selectHits(ranked, max = 4) {
  const counts = new Map();
  return ranked.filter(hit => {
    const count = counts.get(hit.memoryId) || 0;
    counts.set(hit.memoryId, count + 1);
    return count < 2;
  }).slice(0, max);
}

export function timeline(memories) {
  return [...memories].sort((a, b) => (a.year ?? Infinity) - (b.year ?? Infinity) || a.title.localeCompare(b.title));
}

export function conflictingAccounts(memories) {
  const groups = new Map();
  for (const memory of memories) {
    const key = memory.event.trim().toLocaleLowerCase();
    if (!key || memory.year === null) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(memory);
  }
  return [...groups.values()].filter(group => new Set(group.map(m => m.year)).size > 1);
}

export function lexicalRank(chunks, query) {
  const stop = new Set('the and who that this with for from without which when what where uma com quem que para por das dos uma um the de do da em no na'.split(' '));
  const tokens = s => new Set((s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').match(/[\p{L}\p{N}]{3,}/gu) || []).filter(t=>!stop.has(t)));
  const q = tokens(query);
  return chunks.map(c => { const d = tokens(c.text); return { ...c, score: [...q].filter(t => d.has(t)).length }; })
    .filter(c => c.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
