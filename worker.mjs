import { pipeline, env } from './vendor/transformers.min.js';
import { MODEL } from './model-config.mjs';
env.allowLocalModels = false;
env.backends.onnx.wasm.wasmPaths = new URL('./vendor/', import.meta.url).href;
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.proxy = false;
let extractor;
const files = new Map();
async function load() {
  if (!extractor) extractor = await pipeline('feature-extraction', MODEL.id, {
    revision: MODEL.revision, dtype: MODEL.dtype, device: 'wasm',
    progress_callback: p => {
      if (p.file && p.total) files.set(p.file, {loaded:p.loaded || 0,total:p.total});
      let loaded = 0, total = 0;
      for (const file of files.values()) { loaded += file.loaded; total += file.total; }
      self.postMessage({type:'progress', progress:total ? Math.round(100 * loaded / total) : 0});
    }
  });
  return extractor;
}
self.onmessage = async ({data}) => {
  const started = performance.now();
  try {
    const pipe = await load();
    self.postMessage({type:'stage',stage:'index'});
    const vectors = [];
    for (let i = 0; i < data.texts.length; i += 6) {
      const output = await pipe(data.texts.slice(i,i+6), {pooling:'mean',normalize:true});
      vectors.push(...output.tolist());
    }
    self.postMessage({type:'result', id:data.id, vectors, elapsedMs:Math.round(performance.now()-started), model:MODEL});
  } catch(error) {
    self.postMessage({type:'error', id:data.id, message:String(error?.message || error).slice(0,400)});
  }
};
