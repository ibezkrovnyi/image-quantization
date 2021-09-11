module.exports = {
  out: 'docs',
  mode: 'file',
  theme: 'default',
  tsconfig: 'tsconfig.build-esm.json',
  exclude: '**/*.spec.ts',

  excludePrivate: true,
  excludeExternals: true,
  excludeNotExported: true,
  stripInternal: true,
  listInvalidSymbolLinks: true,
  ignoreCompilerErrors: true,

  readme: 'API-README.md',
  mdFlavour: 'github',
  mdSourceRepo: 'ibezkrovnyi/image-quantization',
};
