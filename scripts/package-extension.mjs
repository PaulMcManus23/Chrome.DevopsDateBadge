import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { join } from 'node:path';

const rootDir = process.cwd();
const distDir = join(rootDir, 'dist');

async function copyFileToDist(relativePath) {
  await cp(join(rootDir, relativePath), join(distDir, relativePath), { recursive: true });
}

async function main() {
  await mkdir(distDir, { recursive: true });

  const manifestPath = join(rootDir, 'manifest.json');
  const manifestRaw = await readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);

  // Build output lives in dist root, so popup path should not include dist/ prefix.
  if (manifest.action?.default_popup) {
    manifest.action.default_popup = manifest.action.default_popup.replace(/^dist\//, '');
  }

  if (Array.isArray(manifest.web_accessible_resources)) {
    manifest.web_accessible_resources = manifest.web_accessible_resources.map((entry) => {
      if (!Array.isArray(entry.resources)) {
        return entry;
      }

      return {
        ...entry,
        resources: entry.resources.map((resource) => resource.replace(/^dist\//, '')),
      };
    });
  }

  await writeFile(join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  await copyFileToDist('content.js');
  await copyFileToDist('service_worker.js');
  await copyFileToDist('lib');
  await copyFileToDist('icon_20.png');
  await copyFileToDist('icon_40.png');
  await copyFileToDist('icon_128.png');

  console.log('Packaged extension assets into dist/');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
