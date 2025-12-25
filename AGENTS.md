# Agent Guide

## Build/Lint/Test Commands

- **Lint**: `bun run lint` (ESLint for JS/TS/Vue/JSON/Markdown/CSS)
- **Format**: `bunx prettier --check .` (Prettier formatting check)
- **Rust check**: `cargo check --all-targets`
- **Rust lint**: `cargo clippy --all-targets -- -D warnings`
- **Rust format**: `cargo fmt --all -- --check`
- **Rust test**: `cargo test` (when tests are added); single test: `cargo test --package <crate> --test <test>`
- **Go test**: `go test ./...` (if Go packages exist); single test: `go test -run TestName ./path/to/package`
- **JS/TS test**: `bun test` (when tests are added); single test: `bun test --test-name-pattern <name>`
- **Pre-commit**: Runs Rust checks automatically

## Code Style Guidelines

- **TypeScript**: Strict mode, `noUncheckedIndexedAccess`, `noImplicitOverride`
- **Imports**: ES modules; use workspace dependencies
- **Naming**: camelCase (variables/functions), PascalCase (classes/types)
- **Error handling**: Try/catch in JS/TS; Result/Option in Rust
- **Unused**: `noUnusedLocals` and `noUnusedParameters` disabled
- **Formatting**: Prettier (default config) for all supported files
- **Linting**: ESLint flat config with recommended rules per file type
- **Rust**: Follow clippy warnings and rustfmt
- **Go**: Use `go fmt` and standard conventions
