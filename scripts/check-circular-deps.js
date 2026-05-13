#!/usr/bin/env node

/**
 * 循环依赖检测脚本
 * 
 * 使用 madge 检测 packages/ 目录中的循环依赖
 * 如果发现循环依赖，脚本会退出并返回错误码 1
 * 
 * 用法:
 *   node scripts/check-circular-deps.js
 *   pnpm check:circular
 */

import madge from 'madge';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function checkCircularDeps() {
  console.log(chalk.blue('🔍 Checking for circular dependencies...\n'));
  
  try {
    const result = await madge(join(rootDir, 'packages'), {
      fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
      excludeRegExp: [
        /node_modules/,
        /dist/,
        /\.test\./,
        /\.spec\./,
        /__tests__/,
        /test/,
      ],
      tsConfig: join(rootDir, 'tsconfig.json'),
    });
    
    const circular = result.circular();
    
    if (circular.length > 0) {
      console.error(chalk.red('❌ Circular dependencies detected:\n'));
      circular.forEach((cycle, index) => {
        console.error(chalk.yellow(`  ${index + 1}. ${cycle.join(' → ')}`));
      });
      console.error(chalk.red('\n💡 Fix these circular dependencies before proceeding.\n'));
      console.error(chalk.gray('Tip: Circular dependencies can cause:'));
      console.error(chalk.gray('  - Build failures'));
      console.error(chalk.gray('  - Runtime errors'));
      console.error(chalk.gray('  - Maintenance difficulties\n'));
      process.exit(1);
    }
    
    console.log(chalk.green('✅ No circular dependencies found!\n'));
    
    // 可选：生成依赖关系图
    if (process.argv.includes('--graph')) {
      console.log(chalk.blue('📊 Generating dependency graph...\n'));
      const imagePath = join(rootDir, 'dependency-graph.svg');
      await result.image(imagePath);
      console.log(chalk.green(`✅ Dependency graph saved to: ${imagePath}\n`));
    }
    
    // 可选：显示统计信息
    if (process.argv.includes('--stats')) {
      const obj = result.obj();
      const fileCount = Object.keys(obj).length;
      let depCount = 0;
      Object.values(obj).forEach(deps => {
        depCount += deps.length;
      });
      
      console.log(chalk.blue('📊 Dependency Statistics:\n'));
      console.log(chalk.gray(`  Total files: ${fileCount}`));
      console.log(chalk.gray(`  Total dependencies: ${depCount}`));
      console.log(chalk.gray(`  Average dependencies per file: ${(depCount / fileCount).toFixed(2)}\n`));
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error checking circular dependencies:\n'));
    console.error(chalk.red(error.message));
    console.error(chalk.gray('\nMake sure you have installed dependencies:'));
    console.error(chalk.gray('  pnpm install\n'));
    process.exit(1);
  }
}

// 运行检测
checkCircularDeps();
