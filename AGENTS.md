# Agent Guide

## Core Rule

- **NEVER ignore linting errors**: Always run `bun task check` before committing and fix all issues

## Commands

### Task Runner

```bash
bun task <task>            # Run any task (see `bun task --help` for list)
bun task check             # Run all language checks
bun task fix               # Auto-fix all fixable issues
bun task test              # Run all tests
bun task lint              # Run all linters
```

**Available tasks:** `check`, `fix`, `test`, `lint`, `ts:check`, `ts:fix`, `ts:test`, `rust:lint`, `rust:fix`, `rust:test`, `python:lint`, `python:fix`, `go:lint`, `go:test`

### Testing Single Files

**TypeScript**: `bun test --test-name-pattern "pattern"`

**Rust**: `cargo test test_name` or `cargo test --package crate_name`

**Python**: `pytest path/to/test.py::test_function`

**Go**: `go test -run TestName ./path/to/package`

### Pre-commit

Hooks auto-run `bun task check` on staged files. Bypass with `git commit --no-verify` (not recommended).

## Code Style

### TypeScript/JavaScript

- **Formatting**: Ultracite (Biome) - run `bun x ultracite fix`
- **Imports**: ES modules, named imports preferred, workspace deps for internal packages
- **Naming**: `camelCase` (variables/functions), `PascalCase` (types/classes), `UPPER_SNAKE_CASE` (constants)
- **Types**: Explicit return types on functions, `strict` mode enabled, prefer `unknown` over `any`
- **Async**: Use `async/await`, not promise chains
- **Error handling**: Typed `try/catch`, don't swallow errors

### Rust

- **Formatting**: `cargo fmt --all`
- **Linting**: `cargo clippy --all-targets -- -D warnings` (warnings are errors)
- **Naming**: `snake_case` (vars/functions), `PascalCase` (types), `SCREAMING_SNAKE_CASE` (constants)
- **Error handling**: Use `Result<T, E>` and `Option<T>`, `?` operator for propagation
- **Imports**: Group by std/external/internal, use `crate::` prefix

### Python

- **Tooling**: Ruff (replaces black, flake8, isort) - run `uvx ruff check` and `uvx ruff format`
- **Naming**: PEP 8 - `snake_case` (vars/functions), `PascalCase` (classes), `UPPER_SNAKE_CASE` (constants)
- **Types**: Use type hints (Python ≥3.12 required)
- **Imports**: Group stdlib/third-party/local, absolute imports
- **Error handling**: Explicit exceptions, no bare `except:`

### Go

- **Formatting**: `go fmt` (standard `gofmt` style)
- **Linting**: `go vet ./...`
- **Naming**: `CamelCase` (exported), `mixedCaps` (unexported)
- **Error handling**: Return as last value, `if err != nil` pattern
- **Imports**: Group stdlib/third-party/internal

## Workspaces

- **TypeScript**: `apps/*`, `packages/js/*` (bun workspaces)
- **Rust**: `packages/rust/*` (Cargo workspace, edition 2021)
- **Python**: `apps/py-*`, `packages/python/*` (UV workspace, Python ≥3.12)
- **Go**: Workspace configured in `go.work` (Go 1.24.1)

## Ultracite Standards

This project uses **Ultracite** (zero-config Biome preset) for TypeScript/JavaScript.

```bash
bun x ultracite check    # Check for issues
bun x ultracite fix      # Auto-fix issues
bun x ultracite doctor   # Diagnose setup
```

### Key Principles

- **Type safety**: Explicit types, const assertions, type narrowing
- **Modern JS**: Arrow functions, `for...of`, optional chaining, template literals, destructuring, `const` by default
- **React**: Function components, hooks at top level, semantic HTML, ARIA attributes
- **Security**: `rel="noopener"` for `target="_blank"`, no `eval()`, sanitize inputs
- **Performance**: No spread in loops, top-level regex literals, specific imports, no barrel files
- **Organization**: Early returns, focused functions, extract complex conditions

## Testing Guidelines

- Assertions in `it()` or `test()` blocks
- Use `async/await`, not `done` callbacks
- No `.only` or `.skip` in committed code
- Flat test suites (avoid excessive nesting)

## Troubleshooting

- **Pre-commit failures**: Run `bun task check` to identify the issue
- **TypeScript**: Check `tsconfig.json` - `noUnusedLocals` and `noUnusedParameters` are disabled for flexibility
- **Rust**: Verify crates are workspace members in `Cargo.toml`
- **Task runner**: Requires Bun (`curl -fsSL https://bun.sh/install | bash`)
