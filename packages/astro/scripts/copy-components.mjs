import { cp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const sourceDir = join(packageRoot, 'src', 'components');
const targetDir = join(packageRoot, 'dist', 'components');

await rm(targetDir, { recursive: true, force: true });
await cp(sourceDir, targetDir, { recursive: true });
