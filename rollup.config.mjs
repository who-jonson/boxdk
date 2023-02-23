import { defineConfig } from 'rollup';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import { rollupImportMapPlugin } from 'rollup-plugin-import-map';

const input = './src/index.ts';

// const _external = ['@whoj/utils', 'rusha', 'whatwg-fetch'];

const plugins = [
    typescript(),
    replace({
        preventAssignment: true,
        'import.meta.env.VITE_BOX_APP_TOKEN': 'undefined'
    })
]

export default defineConfig([
    {
        input,
        output: [
            {
                file: './dist/boxdk.esm-browser.js',
                format: 'esm',
                sourcemap: true
            }
        ],
        plugins: [
            ...plugins,
            rollupImportMapPlugin([
                {
                    imports: {
                        '@whoj/utils-core': 'https://cdn.jsdelivr.net/npm/@whoj/utils-core/+esm',
                        'whatwg-fetch': 'https://cdn.jsdelivr.net/npm/whatwg-fetch/+esm',
                        'rusha': 'https://cdn.jsdelivr.net/npm/rusha/+esm',
                    }
                }
            ])
        ]
    },
    {
        input,
        output: {
            file: './dist/boxdk.iife.js',
            format: 'iife',
            name: 'BoxSdk',
            sourcemap: true
        },
        plugins
    },
    {
        input,
        output: [
            {
                file: './dist/boxdk.esm-bundler.js',
                format: 'es'
            },
            {
                file: './dist/boxdk.cjs',
                format: 'cjs'
            }
        ],
        plugins
    }
]);
