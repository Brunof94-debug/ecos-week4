export const MODEL = Object.freeze({
  id: 'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
  revision: '2c4055b12046f11709e9df2c122e59ffbdc2f900',
  dtype: 'q8', dimensions: 384,
});
export const LIMITS = Object.freeze({ memories: 40, text: 8000, archiveBytes: 600000, chunk: 480, query: 240 });
export const MIN_SIMILARITY = 0.30;
