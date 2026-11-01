import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
await fs.rm(path.join(root, 'dist'), { recursive: true, force: true });
await fs.mkdir(path.join(root, 'dist', 'vendor'), { recursive: true });
const files = [
  'index.html',
  'styles.css',
  'readability.css',
  'icon.svg',
  'app.mjs',
  'core.mjs',
  'samples.mjs',
  'i18n.mjs',
  'model-config.mjs',
  'worker.mjs',
  'licenses/TRANSFORMERS-LICENSE.txt',
  'licenses/ONNX-RUNTIME-LICENSE.txt',
];
for (const file of files) {
  await fs.mkdir(path.dirname(path.join(root, 'dist', file)), { recursive: true });
  await fs.copyFile(path.join(root, file), path.join(root, 'dist', file));
}
for (const file of [
  'transformers.min.js',
  'ort-wasm-simd-threaded.jsep.mjs',
  'ort-wasm-simd-threaded.jsep.wasm',
]) {
  await fs.copyFile(
    path.join(root, 'node_modules', '@huggingface', 'transformers', 'dist', file),
    path.join(root, 'dist', 'vendor', file),
  );
  files.push('vendor/' + file);
}
const assets = ['./', ...files.map((f) => './' + f)];
const version = createHash('sha256');
for (const file of files) version.update(await fs.readFile(path.join(root, 'dist', file)));
const name = 'ecos-app-' + version.digest('hex').slice(0, 12);
const serviceWorkerSource = await fs.readFile(path.join(root, 'service-worker.mjs'), 'utf8');
const serviceWorker = `const NAME = ${JSON.stringify(name)}, ASSETS = ${JSON.stringify(assets, null, 2)};\n\n${serviceWorkerSource}`;
await fs.writeFile(path.join(root, 'dist', 'sw.js'), serviceWorker);
const manifest = [];
for (const file of [...files, 'sw.js'])
  manifest.push({
    file,
    sha256: createHash('sha256')
      .update(await fs.readFile(path.join(root, 'dist', file)))
      .digest('hex'),
  });
await fs.writeFile(
  path.join(root, 'dist', 'asset-manifest.json'),
  JSON.stringify(manifest, null, 2),
);
console.log(`Built ${manifest.length} assets. No stories or keys are uploaded by the application.`);
