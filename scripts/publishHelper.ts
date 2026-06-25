import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const PACKAGES_DIR = join(import.meta.dirname, '..', 'packages');
const PACKAGE_NAMES = readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter(
    (entry) => entry.isDirectory() && existsSync(join(PACKAGES_DIR, entry.name, 'package.json'))
  )
  .map((entry) => entry.name);

// Helper to resolve package info
function getPackagesInfo() {
  return PACKAGE_NAMES.map((dirName) => {
    const pkgPath = join(PACKAGES_DIR, dirName, 'package.json');
    const backupPath = join(PACKAGES_DIR, dirName, 'package.json.bak');
    const content = JSON.parse(readFileSync(pkgPath, 'utf8'));
    return {
      dirName,
      pkgPath,
      backupPath,
      name: content.name,
      version: content.version,
      content,
    };
  });
}

const args = process.argv.slice(2);
const command = args[0];

if (command === '--prepare') {
  console.log('Preparing packages for publishing: replacing workspace:* with concrete versions...');
  const packagesInfo = getPackagesInfo();
  const versionMap = new Map<string, string>();
  for (const pkg of packagesInfo) {
    versionMap.set(pkg.name, pkg.version);
  }

  for (const pkg of packagesInfo) {
    writeFileSync(pkg.backupPath, JSON.stringify(pkg.content, null, 2), 'utf8');

    const updatedContent = JSON.parse(JSON.stringify(pkg.content));

    // Helper to replace workspace:*
    const replaceDeps = (depsObj: Record<string, string> | undefined) => {
      if (!depsObj) return;
      for (const [depName, depVal] of Object.entries(depsObj)) {
        if (depVal.startsWith('workspace:')) {
          const actualVer = versionMap.get(depName);
          if (actualVer) {
            depsObj[depName] = `^${actualVer}`;
          } else {
            console.warn(`Warning: Could not find version for workspace dependency ${depName}`);
          }
        }
      }
    };

    replaceDeps(updatedContent.dependencies);
    replaceDeps(updatedContent.devDependencies);
    replaceDeps(updatedContent.peerDependencies);

    writeFileSync(pkg.pkgPath, JSON.stringify(updatedContent, null, 2), 'utf8');
    console.log(`  Processed ${pkg.name} -> version ^${pkg.version}`);
  }
} else if (command === '--restore') {
  console.log('Restoring package.json files from backup...');
  const packagesInfo = getPackagesInfo();
  for (const pkg of packagesInfo) {
    if (existsSync(pkg.backupPath)) {
      const backupContent = readFileSync(pkg.backupPath, 'utf8');
      writeFileSync(pkg.pkgPath, backupContent, 'utf8');
      unlinkSync(pkg.backupPath);
      console.log(`  Restored ${pkg.name}`);
    } else {
      console.log(`  No backup found for ${pkg.name}, skipping.`);
    }
  }
} else if (command === '--publish') {
  console.log('Publishing packages to npm...');
  try {
    const prepResult = spawnSync('bun', ['run', 'scripts/publishHelper.ts', '--prepare'], {
      stdio: 'inherit',
    });
    if (prepResult.status !== 0) {
      console.error('Preparation failed.');
      process.exitCode = prepResult.status ?? 1;
    } else {
      // Publish using changeset publish
      const pubResult = spawnSync('bun', ['x', 'changeset', 'publish'], { stdio: 'inherit' });
      if (pubResult.status !== 0) {
        console.error('Changeset publish failed.');
        process.exitCode = pubResult.status ?? 1;
      }
    }
  } catch (err) {
    console.error('Error during publish:', err);
    process.exitCode = 1;
  } finally {
    // Run restore
    spawnSync('bun', ['run', 'scripts/publishHelper.ts', '--restore'], { stdio: 'inherit' });
  }
} else {
  console.error('Invalid command. Use --prepare, --restore, or --publish');
  process.exitCode = 1;
}
