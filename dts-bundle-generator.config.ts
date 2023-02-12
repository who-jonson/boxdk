const config = {
  compilationOptions: {
    preferredConfigPath: './tsconfig.json'
  },
  entries: [
    {
      filePath: './src/boxdk.ts',
      outFile: './dist/boxdk.d.ts',
      noCheck: true,
      libraries: {
        allowedTypesLibraries: ['rusha']
      },
      output: {
        inlineDeclareGlobals: false,
        sortNodes: true,
        umdModuleName: 'BoxSdk'
      }
    }
  ]
};

module.exports = config;
