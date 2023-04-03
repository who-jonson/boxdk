import { resolve } from 'path';
import { readFileSync } from 'fs';
import { defineConfig } from 'rollup';
import analyze from 'rollup-plugin-analyzer';
import esbuild from 'rollup-plugin-esbuild';
import terser from '@rollup/plugin-terser';
import progress from 'rollup-plugin-progress';

const { name, version } = JSON.parse(readFileSync(resolve('./package.json'), 'utf8'));

const input = './src/boxdk.ts';

const external = [
  '@whoj/utils-core',
  'whatwg-fetch',
  'rusha'
];

const banner = `/**
   * @module ${name}
   * @version  ${version}
   * @copyright ${new Date().getFullYear()} Jonson B.. All rights reserved.
   */
  `;

let analyzePluginIterations = 0;

const plugins = (minify = false, isBrowser = false) => [
  progress(),
  esbuild({
    platform: isBrowser ? 'browser' : 'node',
    legalComments: 'eof',
    tsconfig: './tsconfig.json',
    optimizeDeps: {
      include: external,
      exclude: ['vue-demi']
    },
    define: {
      'import.meta.env.VITE_BOX_APP_TOKEN': 'undefined'
    }
  }),
  minify && terser(),
  analyze({
    hideDeps: true,
    onAnalysis: () => {
      if (analyzePluginIterations > 0) {
        throw '';
      }
      analyzePluginIterations++;
    }
  })
];

const commonOutputOptions = {
  banner,
  name: 'BoxSdk',
  exports: 'auto',
  freeze: false,
  sourcemap: true,
  minifyInternalExports: false,
  generatedCode: {
    constBindings: true
  }
};

function esmBrowserConfig(input, file, minify = false) {
  return {
    input,
    plugins: plugins(minify, true),
    external,
    treeshake: true,
    shimMissingExports: true,
    output: [
      {
        file,
        format: 'esm',
        ...commonOutputOptions
      }
    ]
  };
}

function iifeConfig(input, file, minify = false) {
  return {
    input,
    plugins: plugins(minify, true),
    output: {
      file,
      format: 'iife',
      ...commonOutputOptions
    }
  };
}

export default defineConfig([
  esmBrowserConfig(input, './dist/boxdk.esm-browser.js'),
  esmBrowserConfig(input, './dist/boxdk.esm-browser.min.js', true),

  iifeConfig(input, './dist/boxdk.iife.js'),
  iifeConfig(input, './dist/boxdk.iife.min.js', true),

  {
    input,
    external,
    plugins: plugins(),
    output: [
      {
        // file: './dist/boxdk.mjs',
        dir: './dist',
        format: 'esm',
        ...commonOutputOptions,
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].mjs'
      },
      {
        file: './dist/boxdk.cjs',
        format: 'cjs',
        interop: 'compat',
        ...commonOutputOptions
      }
    ],
    treeshake: true,
    shimMissingExports: true,
    makeAbsoluteExternalsRelative: 'ifRelativeSource'
  }
]);
