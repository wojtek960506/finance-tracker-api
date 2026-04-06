import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const COVERAGE_SUMMARY_PATH = new URL(
  '../coverage/coverage-summary.json',
  import.meta.url,
);
const COVERAGE_LCOV_PATH = new URL('../coverage/lcov.info', import.meta.url);
const PROJECT_ROOT_PATH = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

const normalizePath = (filePath) => filePath.replaceAll('\\', '/');

const toProjectPath = (filePath) => {
  const normalizedFilePath = normalizePath(filePath);
  const normalizedProjectRoot = normalizePath(PROJECT_ROOT_PATH);

  if (normalizedFilePath.startsWith(`${normalizedProjectRoot}/`)) {
    return normalizedFilePath.slice(normalizedProjectRoot.length + 1);
  }

  return normalizedFilePath;
};

const parseLcov = (lcovRaw) => {
  const uncoveredLinesByFile = new Map();

  let currentFile = null;
  let currentUncoveredLines = [];

  for (const line of lcovRaw.split('\n')) {
    if (line.startsWith('SF:')) {
      currentFile = toProjectPath(line.slice(3).trim());
      currentUncoveredLines = [];
      continue;
    }

    if (line.startsWith('DA:')) {
      const [lineNumber, hits] = line.slice(3).split(',');

      if (Number(hits) === 0) {
        currentUncoveredLines.push(Number(lineNumber));
      }

      continue;
    }

    if (line === 'end_of_record' && currentFile) {
      uncoveredLinesByFile.set(currentFile, currentUncoveredLines);
      currentFile = null;
      currentUncoveredLines = [];
    }
  }

  return uncoveredLinesByFile;
};

const formatUncoveredLines = (lines) => {
  if (lines.length === 0) {
    return '-';
  }

  const ranges = [];
  let rangeStart = lines[0];
  let previousLine = lines[0];

  for (let index = 1; index < lines.length; index += 1) {
    const currentLine = lines[index];

    if (currentLine === previousLine + 1) {
      previousLine = currentLine;
      continue;
    }

    ranges.push(
      rangeStart === previousLine ? `${rangeStart}` : `${rangeStart}-${previousLine}`,
    );
    rangeStart = currentLine;
    previousLine = currentLine;
  }

  ranges.push(
    rangeStart === previousLine ? `${rangeStart}` : `${rangeStart}-${previousLine}`,
  );

  return ranges.join(', ');
};

const [summaryRaw, lcovRaw] = await Promise.all([
  readFile(COVERAGE_SUMMARY_PATH, 'utf8'),
  readFile(COVERAGE_LCOV_PATH, 'utf8'),
]);
const summary = JSON.parse(summaryRaw);
const uncoveredLinesByFile = parseLcov(lcovRaw);

const filesWithMissingCoverage = Object.entries(summary)
  .filter(([filePath]) => filePath !== 'total')
  .filter(
    ([, metrics]) =>
      metrics.lines.pct < 100 ||
      metrics.statements.pct < 100 ||
      metrics.functions.pct < 100 ||
      metrics.branches.pct < 100,
  );

if (filesWithMissingCoverage.length === 0) {
  console.log('All files have 100% coverage.');
  process.exit(0);
}

const rows = filesWithMissingCoverage
  .map(([filePath, metrics]) => {
    const shortPath = toProjectPath(filePath);
    const directory = path.dirname(shortPath);

    return {
      directory: `${directory}${path.sep}`,
      file: path.basename(shortPath),
      statements: `${metrics.statements.pct}%`,
      branches: `${metrics.branches.pct}%`,
      functions: `${metrics.functions.pct}%`,
      lines: `${metrics.lines.pct}%`,
      uncoveredLines: formatUncoveredLines(uncoveredLinesByFile.get(shortPath) ?? []),
    };
  })
  .sort(
    (left, right) =>
      left.directory.localeCompare(right.directory) ||
      left.file.localeCompare(right.file),
  );

const groupedRows = rows.reduce((acc, row) => {
  const currentRows = acc.get(row.directory) ?? [];
  currentRows.push(row);
  acc.set(row.directory, currentRows);
  return acc;
}, new Map());

const FILE = 'File';
const STATEMENTS = 'Stmnts';
const BRANCHES = 'Brnchs';
const FUNCTIONS = 'Fns';
const LINES = 'Lines';
const UNCOVERED_LINES = 'Uncovered lines';

const fileWidth = Math.max(
  FILE.length,
  ...rows.map((row) => Math.max(row.directory.length, row.file.length)),
);
const statementsWidth = Math.max(
  STATEMENTS.length,
  ...rows.map((row) => row.statements.length),
);
const branchesWidth = Math.max(
  BRANCHES.length,
  ...rows.map((row) => row.branches.length),
);
const functionsWidth = Math.max(
  FUNCTIONS.length,
  ...rows.map((row) => row.functions.length),
);
const linesWidth = Math.max(LINES.length, ...rows.map((row) => row.lines.length));
const uncoveredLinesWidth = Math.max(
  UNCOVERED_LINES.length,
  ...rows.map((row) => row.uncoveredLines.length),
);

const createDataRow = (file, statements, branches, functions, lines, uncoveredLines) =>
  `${file.padEnd(fileWidth)} | ${statements.padEnd(statementsWidth)} | ` +
  `${branches.padEnd(branchesWidth)} | ${functions.padEnd(functionsWidth)} | ` +
  `${lines.padEnd(linesWidth)} | ${uncoveredLines.padEnd(uncoveredLinesWidth)} |`;

const createDirectoryRow = (directory) => {
  const fileColumn =
    directory.length < fileWidth
      ? `${directory}${''.padEnd(fileWidth - directory.length, '-')}`
      : directory;

  return (
    `${fileColumn}` +
    `-|-${'-'.repeat(statementsWidth)}-|-` +
    `${'-'.repeat(branchesWidth)}-|-` +
    `${'-'.repeat(functionsWidth)}-|-` +
    `${'-'.repeat(linesWidth)}-|-` +
    `${'-'.repeat(uncoveredLinesWidth)}-|`
  );
};

const separator =
  `${'-'.repeat(fileWidth)}-+-${'-'.repeat(statementsWidth)}-+-` +
  `${'-'.repeat(branchesWidth)}-+-${'-'.repeat(functionsWidth)}-+-` +
  `${'-'.repeat(linesWidth)}-+-${'-'.repeat(uncoveredLinesWidth)}-|`;

console.log('FILES WHICH DO NOT HAVE 100% COVERAGE\n');
console.log(createDataRow(FILE, STATEMENTS, BRANCHES, FUNCTIONS, LINES, UNCOVERED_LINES));
console.log(separator);

for (const [directory, directoryRows] of groupedRows) {
  console.log(createDirectoryRow(directory));

  for (const row of directoryRows) {
    console.log(
      createDataRow(
        row.file,
        row.statements,
        row.branches,
        row.functions,
        row.lines,
        row.uncoveredLines,
      ),
    );
  }

  console.log(separator);
}
