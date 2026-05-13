import esbuild from 'esbuild';

const entryPoints = [
  'src/index.ts',
  'src/tokens.ts',
  'src/components.ts',
  'src/layouts.ts',
];

await esbuild.build({
  entryPoints,
  outdir: 'dist/esm',
  format: 'esm',
  platform: 'neutral',
  target: 'es2020',
  bundle: true,
  splitting: true,
  outExtension: { '.js': '.mjs' },
  sourcemap: true,
  external: ['@ouraihub/core', '@ouraihub/tokens'],
});

await esbuild.build({
  entryPoints,
  outdir: 'dist/cjs',
  format: 'cjs',
  platform: 'neutral',
  target: 'es2020',
  bundle: true,
  outExtension: { '.js': '.cjs' },
  sourcemap: true,
  external: ['@ouraihub/core', '@ouraihub/tokens'],
});

console.log('✅ Build complete');
