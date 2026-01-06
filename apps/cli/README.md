# @branch-cleanup/cli

Interactive command-line interface for cleaning up merged git branches.

## Installation

```bash
# From workspace root
pnpm install
pnpm --filter @branch-cleanup/cli build
```

## Usage

### Interactive Mode (Default)

```bash
# Run from anywhere
pnpm --filter @branch-cleanup/cli start

# Or use the built executable
node apps/cli/dist/index.js
```

### Command-Line Options

```bash
# Specify repository and target branch
node apps/cli/dist/index.js -r /path/to/repo -t main

# Dry run to preview changes
node apps/cli/dist/index.js --dry-run

# Filter branches by pattern
node apps/cli/dist/index.js -p "feature/*"

# Exclude branches by pattern
node apps/cli/dist/index.js -e "hotfix/*"

# Only branches older than a date
node apps/cli/dist/index.js -o 2024-01-01

# Non-interactive mode with all options
node apps/cli/dist/index.js --no-interactive -r . -t main -p "feature/*" --dry-run
```

## Features

- **Interactive prompts** for repository path, target branch, and branch selection
- **Color-coded output** with chalk (green=success, red=error, yellow=warning)
- **Table display** of branches with commit info using cli-table3
- **Pattern filtering** with regex support (include and exclude)
- **Date filtering** to target old branches
- **Dry-run mode** to preview changes without deleting
- **Two-step confirmation** (selection + final confirm)
- **Automatic exclusion** of current and target branches
- **Detailed analysis** showing merged vs unmerged branches

## Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--repo-path <path>` | `-r` | Path to git repository | Current directory |
| `--target-branch <branch>` | `-t` | Target branch to compare against | Prompted |
| `--pattern <pattern>` | `-p` | Regex pattern to match branch names | None |
| `--exclude-pattern <pattern>` | `-e` | Regex pattern to exclude branch names | None |
| `--older-than <date>` | `-o` | Only branches older than date (YYYY-MM-DD) | None |
| `--dry-run` | `-d` | Preview without deleting | `false` |
| `--interactive` | `-i` | Interactive mode with prompts | `true` |
| `--no-interactive` | | Non-interactive mode | `false` |
| `--version` | `-V` | Output version number | |
| `--help` | `-h` | Display help | |

## Development

```bash
# Watch mode for development
pnpm --filter @branch-cleanup/cli run dev

# Build
pnpm --filter @branch-cleanup/cli run build

# Type check
pnpm --filter @branch-cleanup/cli run typecheck

# Clean build artifacts
pnpm --filter @branch-cleanup/cli run clean
```

## Architecture

```
apps/cli/
├── src/
│   ├── index.ts      # Entry point with Commander setup
│   ├── cli.ts        # Main CLI flow orchestration
│   ├── prompts.ts    # Inquirer prompt functions
│   └── display.ts    # Output formatting with chalk/cli-table3
├── package.json
└── tsconfig.json
```

## Dependencies

- `@branch-cleanup/core` - Core git operations library
- `commander` - CLI argument parsing
- `@inquirer/prompts` - Interactive prompts
- `chalk` - Terminal color output
- `cli-table3` - Table formatting
