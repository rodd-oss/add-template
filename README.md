# add-template

A polyglot monorepo template for **Agent-Driven Development (ADD)** with built-in tooling for Rust, Go, Python, and JavaScript/TypeScript workspaces.

## Features

- **Multi‑language workspaces**: Rust (`packages/rust/`, `apps/`), Go (`packages/go/`, `apps/`), Python (`packages/python/`, `apps/`), JavaScript/TypeScript (`packages/js/`, `apps/`)
- **Modern tooling**: Ultracite (Biome), Husky, lint‑staged, TypeScript, Cargo, Go modules, uv (Python)
- **Pre‑commit hooks**: Automated checks for Rust (`cargo check`, `cargo clippy`, `cargo fmt`)
- **Line‑count utility**: Script to analyze codebase size and categorize files by line count
- **Monorepo‑ready**: Workspace‑aware dependency management with Bun, Cargo, Go, and uv workspaces

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (JavaScript runtime & package manager)
- [Rust](https://rust-lang.org) (if using Rust packages)
- [Go](https://go.dev) (if using Go packages)
- [Python](https://python.org) (>=3.12) (if using Python packages)
- [uv](https://github.com/astral-sh/uv) (Python package manager)

### Installation

```bash
bun install
go mod download
cargo fetch
uv sync
```

### Running the line‑count script

```bash
bun run count-lines
```

Show per‑file analysis:

```bash
bun run count-lines --byfile
```

### Task Runner

This template includes a powerful task runner for managing multi-language operations:

```bash
# Run all checks across all languages
bun task check

# Run all fixes across all languages
bun task fix

# Run all tests across all languages
bun task test

# Run language-specific checks
bun task ts:check
bun task rust:check
bun task python:check
bun task go:check

# View all available tasks
bun task --help
```

### Linting & Formatting

```bash
# JavaScript/TypeScript
bun x ultracite check     # Ultracite (Biome) linting and formatting check
bun x ultracite fix       # Auto-fix linting and formatting issues

# Rust
cargo check --all-targets
cargo clippy --all-targets -- -D warnings
cargo fmt --all -- --check

# Python
ruff check
ruff format --check
```

## Workspace Structure

```text
add-template/
├── .husky/            # Git hooks
├── apps/              # Deployable applications (Entry points)
├── docs/              # Documentation
├── gen/               # Generated code (from Proto/OpenAPI) - gitignored usually
├── infra/             # IaC, Dockerfiles, Helm, Terraform
├── packages/          # Shared libraries (Business logic, utilities)
│   ├── go/            # Go modules
│   ├── python/        # UV/Python packages
│   ├── js/            # Shared JavaScript/TypeScript packages
│   └── rust/          # Rust crates
├── proto/             # Interface Definitions (gRPC/Protobuf/GraphQL)
│   ├── google/
│   └── v1/
├── scripts/           # Scripts used for CI/CD or local dev
│   └── count-lines.ts # Line‑count utility
├── .ignore            # Opencode specific ignores for tools
├── AGENTS.md          # Agent guide for development tools
└── README.md          # This file
```

## Available Scripts

| Script                                       | Description                                                 |
| -------------------------------------------- | ----------------------------------------------------------- |
| `bun run count-lines`                        | Total lines of code (excludes `node_modules`, `.git`, etc.) |
| `bun run count-lines --byfile`               | Per‑file breakdown with size categories                     |
| `bun x ultracite check`                      | Ultracite (Biome) linting and formatting check              |
| `bun run prepare`                            | Set up Husky git hooks                                      |
| `bun x ultracite fix`                        | Auto-fix linting and formatting issues                      |
| `bun task lint`                              | Run all language linters concurrently                       |
| `cargo check --all-targets`                  | Check all Rust crates                                       |
| `cargo clippy --all-targets -- -D warnings`  | Lint Rust code                                              |
| `cargo fmt --all -- --check`                 | Verify Rust formatting                                      |
| `ruff check`                                 | Lint Python code                                            |
| `ruff format --check`                        | Verify Python formatting                                    |
| `cargo test`                                 | Run all Rust tests                                          |
| `cargo test --package <crate> --test <test>` | Run specific Rust test                                      |
| `go test ./...`                              | Run all Go tests                                            |
| `bun test`                                   | Run JS/TS tests (when added)                                |

## Pre‑commit Hooks

The template includes a Husky pre‑commit hook that automatically runs:

1. **lint-staged** - Runs Prettier and ESLint on staged JS/TS files (for compatibility)
2. **`bun task check`** - Concurrently runs all typechecks and linting:
   - TypeScript: typecheck, Ultracite (Biome) linting and formatting check
   - Rust: clippy, fmt check, cargo check
   - Python: ruff check, ruff format check

## Testing

Run tests for specific languages:

```bash
# JavaScript/TypeScript
bun test
bun test --test-name-pattern <name>

# Rust
cargo test
cargo test --package <crate> --test <test>

# Go
go test ./...
go test -run TestName ./path/to/package

# Python
bun task python:test  # Configured via task runner
```

## Configuration Files

- **`package.json`** – Bun workspaces, scripts, dev dependencies
- **`Cargo.toml`** – Rust workspace configuration
- **`go.work`** – Go workspace definition
- **`pyproject.toml`** – Python workspace configuration (uv)
- **`tsconfig.json`** – TypeScript compiler options
- **`biome.jsonc`** – Biome configuration extended with Ultracite presets
- **`.prettierrc`** – Prettier configuration (empty, deprecated)
- **`.husky/pre‑commit`** – Git hook script

## License

MIT – see [LICENSE](LICENSE) (if present) or the workspace‑level licenses in each package.
