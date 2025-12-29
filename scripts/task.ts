#!/usr/bin/env bun

import packageJson from "../package.json" with { type: "json" };
const pkg: PackageJson = packageJson;

interface PackageJson {
  tasks?: Record<string, string>;
}

interface TaskContext {
  visited: Set<string>;
  executing: Set<string>;
}

interface TaskDefinition {
  concurrent: boolean;
  tasks: string[];
}

const COLORS = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
  bold: "\x1b[1m",
} as const;

function colorize(text: string, color: keyof typeof COLORS): string {
  if (!process.stdout.isTTY) return text;
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function log(message: string): void {
  console.log(message);
}

function logError(message: string): void {
  console.error(`${colorize("Error:", "red")} ${message}`);
}

function logInfo(message: string): void {
  console.error(`${colorize("Info:", "cyan")} ${message}`);
}

function logTask(message: string): void {
  console.error(`${colorize("→", "gray")} ${message}`);
}

function showHelp(tasks: Record<string, string> | undefined): void {
  log(colorize("Usage:", "bold") + " bun task <taskname>");
  log("");
  log(colorize("Available tasks:", "bold"));

  if (!tasks || Object.keys(tasks).length === 0) {
    log("  No tasks defined in package.json");
    return;
  }

  const maxTaskNameLength = Math.max(
    ...Object.keys(tasks).map((name) => name.length),
  );

  for (const [name, command] of Object.entries(tasks)) {
    const paddedName = name.padEnd(maxTaskNameLength);
    log(`  ${colorize(paddedName, "cyan")}  ${command}`);
  }

  log("");
  log("Examples:");
  log("  bun task check");
  log("  bun task ts:lint");
}

function parseTaskDefinition(value: string): TaskDefinition {
  const parts = value.trim().split(/\s+/);
  const concurrent = parts[0] === "--concurrent";
  const tasks = concurrent ? parts.slice(1) : parts;
  return { concurrent, tasks };
}

function isTaskReference(
  value: string,
  allTasks: Record<string, string>,
): boolean {
  const { tasks } = parseTaskDefinition(value);
  if (tasks.length === 0) return false;
  return tasks.every((part) =>
    Object.prototype.hasOwnProperty.call(allTasks, part),
  );
}

async function executeCommand(
  command: string,
  taskName: string,
): Promise<number> {
  logTask(
    `[${colorize(taskName, "cyan")}] Running: ${colorize(command, "gray")}`,
  );

  const tagPrefix = `[${colorize(taskName, "cyan")}] `;

  const process = Bun.spawn(["sh", "-c", command], {
    stdout: "pipe",
    stderr: "pipe",
    stdin: "inherit",
  });

  // Read and tag stdout (write to stdout)
  const stdoutPromise = (async () => {
    const reader = process.stdout.getReader();
    for (;;) {
      const result = await reader.read();
      if (result.done) break;
      const text = new TextDecoder().decode(result.value);
      const lines = text.split("\n");
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          console.log(tagPrefix + trimmedLine);
        }
      }
    }
  })();

  // Read and tag stderr (also write to stdout to avoid red color)
  const stderrPromise = (async () => {
    const reader = process.stderr.getReader();
    for (;;) {
      const result = await reader.read();
      if (result.done) break;
      const text = new TextDecoder().decode(result.value);
      const lines = text.split("\n");
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          console.log(tagPrefix + trimmedLine);
        }
      }
    }
  })();

  // Wait for both streams to finish
  await Promise.all([stdoutPromise, stderrPromise]);

  const exitCode = await process.exited;

  if (exitCode !== 0) {
    logError(
      `[${colorize(taskName, "cyan")}] Failed with exit code ${exitCode.toString()}`,
    );
  }

  return exitCode;
}

async function executeTask(
  taskName: string,
  tasks: Record<string, string>,
  context: TaskContext,
): Promise<number> {
  const startTime = Date.now();

  // Check for circular dependencies
  if (context.executing.has(taskName)) {
    const chain = Array.from(context.executing).join(" → ");
    logError(
      `[${colorize(taskName, "cyan")}] Circular dependency detected: ${chain} → ${taskName}`,
    );
    return 1;
  }

  // Check if already visited (for logging, but still execute if needed)
  if (context.visited.has(taskName)) {
    // Skip logging for already visited tasks to reduce noise
  } else {
    context.visited.add(taskName);
  }

  const taskValue = tasks[taskName];

  if (!taskValue) {
    logError(`[${colorize(taskName, "cyan")}] Unknown task`);
    return 1;
  }

  context.executing.add(taskName);

  let exitCode = 0;

  // Check if this is a reference to other tasks
  if (isTaskReference(taskValue, tasks)) {
    const { concurrent, tasks: referencedTasks } =
      parseTaskDefinition(taskValue);

    const mode = concurrent ? "concurrently" : "sequentially";
    logInfo(
      `[${colorize(taskName, "cyan")}] References ${referencedTasks.map((t) => colorize(t, "cyan")).join(", ")} (${mode})`,
    );

    if (concurrent) {
      // Execute referenced tasks concurrently
      const results = await Promise.all(
        referencedTasks.map((refTask) => executeTask(refTask, tasks, context)),
      );
      const firstFailure = results.find((code) => code !== 0);
      if (firstFailure !== undefined) {
        exitCode = firstFailure;
      }
    } else {
      // Execute referenced tasks sequentially
      for (const refTask of referencedTasks) {
        exitCode = await executeTask(refTask, tasks, context);
        if (exitCode !== 0) {
          break;
        }
      }
    }
  } else {
    // Execute as a command
    exitCode = await executeCommand(taskValue, taskName);
  }

  context.executing.delete(taskName);

  // Log completion info
  const duration = Date.now() - startTime;
  if (exitCode === 0) {
    logInfo(
      `[${colorize(taskName, "cyan")}] ${colorize("✓", "green")} Completed in ${duration.toString()}ms`,
    );
  } else {
    logInfo(
      `[${colorize(taskName, "cyan")}] ${colorize("✗", "red")} Failed after ${duration.toString()}ms`,
    );
  }

  return exitCode;
}

async function main() {
  const args = process.argv.slice(2);

  // Handle help flags
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    showHelp(pkg.tasks);
    process.exit(0);
  }

  const context: TaskContext = {
    visited: new Set(),
    executing: new Set(),
  };

  if (!pkg.tasks) {
    logError("No 'tasks' section found in package.json");
    process.exit(1);
  }

  const taskName = args[0];

  if (!taskName) {
    logError("No task name provided");
    process.exit(1);
  }

  const exitCode = await executeTask(taskName, pkg.tasks, context);

  if (exitCode === 0) {
    log(`${colorize("✓", "green")} All tasks completed successfully`);
  }

  process.exit(exitCode);
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    logError(error.message);
  } else {
    logError(String(error));
  }
  process.exit(1);
});
