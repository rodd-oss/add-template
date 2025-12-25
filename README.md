# add-template

A polyglot monorepo template for **Agent-Driven Development (ADD)** with built-in tooling for Rust, Go, and JavaScript/TypeScript workspaces.

## Features

- **Multi‑language workspaces**: Rust (`packages/rust/`), Go (`packages/go/`), JavaScript/TypeScript (`packages/js/`, `apps/`)
- **Modern tooling**: ESLint, Prettier, Husky, lint‑staged, TypeScript, Cargo, Go modules
- **Pre‑commit hooks**: Automated checks for Rust (`cargo check`, `cargo clippy`, `cargo fmt`)
- **Line‑count utility**: Script to analyze codebase size and categorize files by line count
- **Monorepo‑ready**: Workspace‑aware dependency management with Bun, Cargo, and Go workspaces

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (JavaScript runtime & package manager)
- [Rust](https://rust-lang.org) (if using Rust packages)
- [Go](https://go.dev) (if using Go packages)

### Installation

```bash
bun install
```

### Running the line‑count script

```bash
bun run count-lines
```

Show per‑file analysis:

```bash
bun run count-lines --byfile
```

### Linting & Formatting

```bash
bun run lint          # ESLint
bunx prettier --check .   # Prettier
```

## Workspace Structure

```text
add-template/
├── apps/              # Application packages (JavaScript/TypeScript)
├── packages/
│   ├── go/           # Go modules
│   ├── js/           # Shared JavaScript/TypeScript packages
│   └── rust/         # Rust crates
├── scripts/
│   └── count-lines.ts # Line‑count utility
├── docs/              # Documentation
└── .husky/            # Git hooks
```

## Available Scripts

| Script                                      | Description                                                 |
| ------------------------------------------- | ----------------------------------------------------------- |
| `bun run count-lines`                       | Total lines of code (excludes `node_modules`, `.git`, etc.) |
| `bun run count-lines --byfile`              | Per‑file breakdown with size categories                     |
| `bun run lint`                              | Run ESLint on all supported files                           |
| `bun run prepare`                           | Set up Husky git hooks                                      |
| `cargo check --all‑targets`                 | Check all Rust crates (runs in pre‑commit)                  |
| `cargo clippy --all‑targets -- -D warnings` | Lint Rust code                                              |
| `cargo fmt --all -- --check`                | Verify Rust formatting                                      |

## Pre‑commit Hooks

The template includes a Husky pre‑commit hook that automatically runs:

1. `cargo check --all-targets`
2. `cargo clippy --all-targets -- -D warnings`
3. `cargo fmt --all -- --check`

## Configuration Files

- **`package.json`** – Bun workspaces, scripts, dev dependencies
- **`Cargo.toml`** – Rust workspace configuration
- **`go.work`** – Go workspace definition
- **`tsconfig.json`** – TypeScript compiler options
- **`eslint.config.mts`** – ESLint flat config for JS/TS/JSON/Markdown/CSS/Vue
- **`.prettierrc`** – Prettier formatting rules
- **`.husky/pre‑commit`** – Git hook script

## License

MIT – see [LICENSE](LICENSE) (if present) or the workspace‑level licenses in each package.
