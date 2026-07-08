import { build } from 'esbuild';

const shared = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  external: ['zod'],
  target: 'es2022',
  platform: 'neutral',
};

await Promise.all([
  build({ ...shared, outfile: 'dist/esm/index.mjs', format: 'esm' }),
  build({ ...shared, outfile: 'dist/cjs/index.cjs', format: 'cjs' }),
]);
