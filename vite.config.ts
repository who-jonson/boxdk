import { resolve } from 'path';
import { defineConfig } from 'vite';
import type { ModuleFormat } from 'rollup';

const fileName = (format: ModuleFormat) => {
  let name = 'boxdk.';
  if (format === 'iife') {
    name += 'iife.js';
  } else {
    name += format === 'es' ? 'mjs' : 'cjs';
  }
  return name;
};

export default defineConfig(({ command }) => ({
  base: './',
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/boxdk.ts'),
      name: 'BoxSdk',
      formats: ['es', 'cjs', 'iife'],
      fileName
    },

    sourcemap: true
  },

  define: command === 'serve'
    ? undefined
    : {
        'import.meta.env.VITE_BOX_APP_TOKEN': 'undefined'
      }
}));
