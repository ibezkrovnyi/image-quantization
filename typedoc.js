module.exports = {
  out: 'docs',
  mode: 'file',
  theme: 'default',
  tsconfig: 'tsconfig.json',
  exclude: '**/*.spec.ts',

  excludePrivate: true,
  excludeExternals: true,
  excludeNotExported: true,
  stripInternal: true,
  listInvalidSymbolLinks: true,
  ignoreCompilerErrors: true,

  readme: 'API-README.md',
  mdFlavour: 'github',
  mdSourceRepo: 'ibezkrovnyi/image-quantization'
};
