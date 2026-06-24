import { readdirSync, statSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, extname } from 'node:path';

const required = ['index.html', 'src/app.js', 'assets/css/styles.css', '.github/workflows/pages.yml'];
for (const file of required) {
  if (!existsSync(file)) {
    console.error(`Fichier requis manquant : ${file}`);
    process.exit(1);
  }
}

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const jsFiles = walk('src').filter((path) => extname(path) === '.js');
for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(`✓ ${jsFiles.length} modules JavaScript vérifiés.`);
