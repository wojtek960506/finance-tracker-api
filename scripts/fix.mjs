import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const getTrackedFiles = () => {
  const result = spawnSync('git', ['ls-files', '-co', '--exclude-standard'], {
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  return result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((file) => !file.startsWith('node_modules/'));
};

const getFileHashes = (files) =>
  new Map(
    files.map((file) => [
      file,
      createHash('sha1').update(readFileSync(file)).digest('hex'),
    ]),
  );

const run = (command, args) => {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
};

const filesBefore = getTrackedFiles();
const hashesBefore = getFileHashes(filesBefore);

run('pnpm', ['exec', 'eslint', '.', '--fix']);
run('pnpm', ['exec', 'prettier', '.', '--write']);

const filesAfter = getTrackedFiles();
const hashesAfter = getFileHashes(filesAfter);

const changedFiles = filesAfter.filter(
  (file) => hashesBefore.get(file) !== hashesAfter.get(file),
);

if (changedFiles.length === 0) {
  console.log('No files were changed.');
  process.exit(0);
}

console.log('Changed files:');
changedFiles.forEach((file) => console.log(file));
