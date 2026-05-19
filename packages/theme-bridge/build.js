import esbuild from 'esbuild';

const shared = {
  entryPoints: [
    'src/index.ts',
    'src/ThemeSwitcher.ts',
    'src/DaisyThemeBridge.ts',
  ],
  bundle: true,
  platform: 'browser',
  target: 'es2020',
  sourcemap: true,
  logLevel: 'info',
  outbase: 'src',
};

const watch = process.argv.includes('--watch');

const esmConfig = {
  ...shared,
  format: 'esm',
  outdir: 'dist/esm',
  entryNames: '[name]',
  outExtension: { '.js': '.mjs' },
};

const cjsConfig = {
  ...shared,
  format: 'cjs',
  outdir: 'dist/cjs',
  entryNames: '[name]',
  outExtension: { '.js': '.cjs' },
};

async function run() {
  if (watch) {
    const esm = await esbuild.context(esmConfig);
    const cjs = await esbuild.context(cjsConfig);
    await Promise.all([esm.watch(), cjs.watch()]);
    console.log('Watching theme-bridge...');
    return;
  }

  await Promise.all([
    esbuild.build(esmConfig),
    esbuild.build(cjsConfig),
  ]);

  console.log('Build complete');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
