import esbuild from 'esbuild';

const entryPoints = {
  index: 'src/index.ts',
  'preset/index': 'src/preset/index.ts',
  'theme/index': 'src/theme/index.ts',
};

const commonOptions = {
  entryPoints,
  bundle: true,
  platform: 'neutral',
  target: 'es2020',
  outbase: 'src',
  entryNames: '[dir]/[name]',
  sourcemap: true,
};

// ESM 构建
await esbuild.build({
  ...commonOptions,
  outdir: 'dist/esm',
  format: 'esm',
  outExtension: { '.js': '.mjs' },
});

// CJS 构建
await esbuild.build({
  ...commonOptions,
  outdir: 'dist/cjs',
  format: 'cjs',
  outExtension: { '.js': '.cjs' },
});

console.log('✅ Build complete');
