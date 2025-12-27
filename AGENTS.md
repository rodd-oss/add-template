# Agent Guide

## Agent Rules

- **NEVER ignore linting rules**: Always address lint warnings and errors. Use `bun task fix` to automatically fix issues where possible, and manually resolve any remaining violations before committing code.

## Build/Lint/Test Commands

The repository uses a custom task runner (`bun task`) defined in `package.json`. All commands should be run through `bun task <task>` unless a specific one-off command is needed.

### Task Runner Usage

```bash
bun task <taskname>          # Run a specific task from package.json
bun task --help              # List all available tasks
bun task check               # Run all checks (lint, format, typecheck) concurrently
bun task fix                 # Apply automatic fixes for lint and formatting
bun task test                # Run tests for all languages concurrently
bun task lint                # Run linters for all languages concurrently
```

### Language-Specific Commands

#### TypeScript/JavaScript (Bun)

**Single test execution**: Use `bun test --test-name-pattern "pattern"` to run specific tests. For example: `bun test --test-name-pattern "placeholder"`.

#### Rust

**Single test execution**: Use `cargo test --package <crate_name> --test <test_file>` for integration tests, or `cargo test test_function_name` for unit tests. Example: `cargo test placeholder`.

#### Python

**Single test execution**: Use `pytest path/to/test.py::test_function` when tests are added.

#### Go

**Single test execution**: Use `go test -run TestName ./path/to/package`. Example: `go test -run TestAdd ./packages/go/math`.

### Pre-commit Hooks

The repository uses Husky with lint-staged to run checks on staged files before commits. The pre-commit hook runs:

1. `bunx lint-staged` - Runs Prettier and ESLint on staged files matching patterns
2. `bun task check` - Runs all language checks concurrently

To bypass hooks during commit, use `git commit --no-verify` (not recommended).

## Code Style Guidelines

### TypeScript/JavaScript

- **TypeScript Configuration**: Strict mode enabled with `noUncheckedIndexedAccess` and `noImplicitOverride`. `noUnusedLocals` and `noUnusedParameters` are disabled to allow flexible development.
- **Imports**: Use ES modules (`import/export`). Prefer named imports over default imports when appropriate. Use workspace dependencies for internal packages.
- **Naming Conventions**:
  - Variables and functions: `camelCase`
  - Classes, types, interfaces, enums: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE` for true constants, `camelCase` for `const` variables
  - Private members: prefix with underscore `_privateMethod` (optional)
- **Error Handling**: Use `try/catch` with typed errors where possible. Avoid swallowing errors; log or rethrow appropriately.
- **Async/Await**: Prefer `async/await` over raw promises for readability.
- **Formatting**: Prettier with default configuration (empty `.prettierrc`). Line length: 80 characters (default).
- **Linting**: ESLint flat config with recommended rules per file type (JavaScript, TypeScript, Vue, JSON, Markdown, CSS). Prettier compatibility ensured via `eslint-config-prettier`.
- **Type Annotations**: Provide explicit return types for functions and public methods. Use type inference for local variables when obvious.
- **Comments**: Use JSDoc for public APIs. Prefer self-documenting code over excessive comments.

### Rust

- **Edition**: 2021 edition (configured in workspace).
- **Formatting**: Use `rustfmt` with default settings. Run `cargo fmt --all` before committing.
- **Linting**: Follow all `clippy` warnings. The configuration uses `-D warnings` to treat warnings as errors.
- **Naming**: Follow Rust conventions (`snake_case` for variables/functions, `PascalCase` for types, `SCREAMING_SNAKE_CASE` for constants).
- **Error Handling**: Prefer `Result<T, E>` and `Option<T>` over panics. Use `?` operator for error propagation.
- **Imports**: Group imports (std, external, internal) with blank lines. Use `crate::` prefix for internal modules.
- **Documentation**: Use `///` doc comments for public items. Include examples where helpful.

### Python

- **Tooling**: Ruff for linting and formatting (replaces flake8, black, isort).
- **Python Version**: Requires Python ≥3.12 (configured in `pyproject.toml`).
- **Formatting**: Follow Ruff's default formatting rules (similar to black).
- **Linting**: Ruff with default rule set. Treat warnings as errors.
- **Naming**: Follow PEP 8: `snake_case` for functions/variables, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants.
- **Type Hints**: Use type annotations for function parameters and return values (enabled via `pyproject.toml`).
- **Imports**: Group imports (standard library, third-party, local) with blank lines. Use absolute imports.
- **Error Handling**: Use explicit exception handling. Avoid bare `except:` clauses.

### Go

- **Tooling**: Use `go fmt` for formatting and `go vet` for linting.
- **Formatting**: Standard `gofmt` style.
- **Naming**: Follow Go conventions: `CamelCase` for exported identifiers, `mixedCaps` or `camelCase` for unexported.
- **Error Handling**: Return errors as the last return value. Use `if err != nil` pattern.
- **Imports**: Group standard library, third-party, and internal imports with blank lines.
- **Testing**: Use `testing` package. Table-driven tests preferred for multiple test cases.

## Tooling Configuration

### ESLint

- Configuration: `eslint.config.mts` (flat config)
- Covers: JavaScript, TypeScript, Vue, JSON, Markdown, CSS
- Integrates with Prettier via `eslint-config-prettier/flat`
- Uses TypeScript ESLint for strict type-checked rules
- Ignored directories: `target/`, `node_modules/`

### Prettier

- Configuration: Empty object (`{}`) in `.prettierrc` (uses defaults)
- Ignored files: Defined in `.prittierignore` (note typo)
- Runs on: JS, TS, Vue, JSON, Markdown, CSS files

### Rust

- Workspace configuration in root `Cargo.toml`
- Members: `packages/rust/*`
- Edition: 2021
- Release profile: LTO enabled, codegen-units=1, opt-level=3, strip=true

### Python

- Uses UV workspace configuration in `pyproject.toml`
- Members: `apps/py-*`, `packages/python/*`
- Requires Python ≥3.12

### Go

- Workspace configuration in `go.work` (Go 1.24.1)

## Task Runner Implementation

The custom task runner (`scripts/task.ts`) provides:

- Concurrent and sequential task execution
- Circular dependency detection
- Colored output with task tagging
- Help system listing available tasks

Tasks are defined in `package.json` under the `"tasks"` key. Reference other tasks with `--concurrent task1 task2` for concurrent execution or space-separated for sequential.

## Troubleshooting

- **Pre-commit hooks failing**: Run `bun task check` to identify which language check is failing, then run the specific fix command (e.g., `bun task ts:fix`).
- **TypeScript errors**: Ensure `tsconfig.json` settings are respected. The configuration disables `noUnusedLocals` and `noUnusedParameters` for flexibility.
- **Rust compilation errors**: Check that all crates are members of the workspace in `Cargo.toml`.
- **Python linting errors**: Ensure UV is installed (`curl -LsSf https://astral.sh/uv/install.sh | sh`)
- **Task runner not found**: Ensure Bun is installed (`curl -fsSL https://bun.sh/install | bash`).

## Additional Notes

- Always run `bun task check` before committing to ensure code quality.
- When adding new packages, update the appropriate workspace configuration (Cargo.toml, pyproject.toml, go.work, package.json).
