#!/usr/bin/env bun

import { glob } from "glob";
import * as fs from "fs";
import * as path from "path";

interface CountOptions {
  byfile?: boolean;
}

const categories = ["low", "normal", "high", "critical"] as const;

type Category = (typeof categories)[number];

const CATEGORY_THRESHOLDS = {
  LOW: 300,
  NORMAL: 600,
  HIGH: 1200,
} as const;

function categorizeLines(lineCount: number): Category {
  if (lineCount <= CATEGORY_THRESHOLDS.LOW) return "low";
  if (lineCount <= CATEGORY_THRESHOLDS.NORMAL) return "normal";
  if (lineCount <= CATEGORY_THRESHOLDS.HIGH) return "high";
  return "critical";
}

function formatCategory(category: Category): string {
  if (!process.stdout.isTTY) return category;

  const colors: Record<Category, string> = {
    low: "\x1b[32m",
    normal: "\x1b[36m",
    high: "\x1b[33m",
    critical: "\x1b[31m",
  };
  const reset = "\x1b[0m";
  return `${colors[category]}${category}${reset}`;
}

async function countLines(options: CountOptions = {}): Promise<void> {
  const { byfile = false } = options;

  const patterns = ["**/*"];
  const ignorePatterns = [
    "**/.git/**",
    "**/node_modules/**",
    "**/target/**",
    "**/bun.lock",
    "**/*.lock",
  ];

  const files = await glob(patterns, {
    ignore: ignorePatterns,
    nodir: true,
    absolute: false,
  });

  let totalLines = 0;
  const fileCounts: Record<string, number> = {};
  const fileDetails: Array<{
    path: string;
    lines: number;
    category: Category;
  }> = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n").length;
      totalLines += lines;

      const ext = path.extname(file).toLowerCase();
      fileCounts[ext] = (fileCounts[ext] || 0) + lines;

      if (byfile) {
        const category = categorizeLines(lines);
        fileDetails.push({ path: file, lines, category });
      }
    } catch {
      console.warn(`Could not read file: ${file}`);
    }
  }

  if (byfile) {
    fileDetails.sort((a, b) => a.lines - b.lines);

    console.log("File-by-file line count analysis:");

    for (const detail of fileDetails) {
      const category = formatCategory(detail.category);
      console.log(
        `${category.padEnd(10)} ${detail.path}: ${detail.lines.toString()} lines`,
      );
    }

    const categorySummary: Record<Category, { files: number; lines: number }> =
      {
        low: { files: 0, lines: 0 },
        normal: { files: 0, lines: 0 },
        high: { files: 0, lines: 0 },
        critical: { files: 0, lines: 0 },
      };

    for (const detail of fileDetails) {
      const summary = categorySummary[detail.category];

      summary.files += 1;
      summary.lines += detail.lines;
    }

    console.log("\nSummary:");
    for (const category of categories) {
      const stats = categorySummary[category];

      if (stats.files > 0) {
        console.log(
          `  ${formatCategory(category)}: ${stats.files.toString()} file${stats.files === 1 ? "" : "s"} (${stats.lines.toString()} lines)`,
        );
      }
    }
  } else {
    console.log(`Total files: ${files.length.toString()}`);
    console.log(`Total lines: ${totalLines.toString()}`);
    console.log("\nLines by file type:");

    const sortedExtensions = Object.entries(fileCounts).sort(
      (a, b) => b[1] - a[1],
    );
    for (const [ext, count] of sortedExtensions) {
      const PERCENTAGE_DECIMALS = 1;
      const percentage = ((count / totalLines) * 100).toFixed(
        PERCENTAGE_DECIMALS,
      );
      console.log(
        `  ${ext || "(no extension)"}: ${count.toString()} lines (${percentage}%)`,
      );
    }
  }
}

const args = process.argv.slice(2);
const options: CountOptions = {};

for (const arg of args) {
  if (arg === "--byfile") {
    options.byfile = true;
  } else if (arg === "--help" || arg === "-h") {
    console.log(`
Usage: bun run scripts/count-lines.ts [options]

Options:
  --byfile               Show line count for each file with categorization
  --help, -h            Show this help message

Default behavior:
  - Excludes: .git, node_modules, target, bun.lock, *.lock files
  - Includes: all other files
  - Shows total files, total lines, and lines by file type

With --byfile:
  - Shows table with each file, line count, and category
   - Categories: low (≤${String(CATEGORY_THRESHOLDS.LOW)}), normal (${String(CATEGORY_THRESHOLDS.LOW + 1)}-${String(CATEGORY_THRESHOLDS.NORMAL)}), high (${String(CATEGORY_THRESHOLDS.NORMAL + 1)}-${String(CATEGORY_THRESHOLDS.HIGH)}), critical (>${String(CATEGORY_THRESHOLDS.HIGH)})
`);
    process.exit(0);
  }
}

countLines(options).catch(console.error);
