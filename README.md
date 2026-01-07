# Git Branch Cleanup Tool

**Dual-version application for streamlining cleanup of merged branches in git repositories**

A professional monorepo featuring a CLI tool and web interface for managing git branch cleanup with an elegant, minimalist design.

---

## 🎯 Features

### Core Functionality
- ✅ Analyze merged branches in any git repository
- ✅ Interactive branch selection (multi-select with checkboxes)
- ✅ Pattern-based filtering (regex support)
- ✅ Date-based filtering (branches older than X)
- ✅ Dry-run mode (preview without deleting)
- ✅ Batch branch deletion with confirmation
- ✅ Comprehensive error handling

### CLI Application
- 📟 Interactive terminal prompts (inquirer)
- 🎨 Color-coded output (chalk)
- 📊 Formatted branch tables (cli-table3)
- ⚙️ Command-line options (pattern, exclude, dry-run)
- 🚀 Fast and lightweight

### Web Application
- 🎨 Refined minimalist UI (shadcn-vue + Tailwind CSS)
- 🔵 Professional blue theme with Poppins & Open Sans fonts
- 📱 Responsive design (mobile-first)
- ♿ WCAG AA accessibility compliant
- ⚡ Fast Vite build (270KB JS, 28KB CSS gzipped)
- 🎭 Smooth animations (200ms transitions)

---

## 🏗️ Architecture

```
branch-cleanup-monorepo/
├── packages/
│   └── core/              # Shared library (TypeScript)
│       ├── src/
│       │   ├── git-operations.ts    # Git command wrappers
│       │   ├── branch-analyzer.ts   # Merge detection logic
│       │   ├── branch-manager.ts    # Deletion operations
│       │   ├── validators.ts        # Input validation
│       │   └── types.ts             # TypeScript interfaces
│       └── tests/                   # 79 tests, 100% passing
├── apps/
│   ├── cli/               # CLI application (Node.js)
│   │   ├── src/
│   │   │   ├── index.ts           # Entry point
│   │   │   ├── cli.ts             # Main flow
│   │   │   ├── prompts.ts         # Inquirer prompts
│   │   │   └── display.ts         # Terminal formatting
│   │   └── dist/                  # Built executable
│   ├── api/               # Backend API (Express)
│   │   └── src/
│   │       ├── index.ts           # Server setup
│   │       ├── routes.ts          # API endpoints
│   │       ├── middleware.ts      # CORS, validation
│   │       └── schemas.ts         # Zod schemas
│   └── web/               # Web frontend (Vue 3 + Vite)
│       ├── src/
│       │   ├── components/        # Vue components
│       │   │   ├── ui/           # shadcn-vue components
│       │   │   ├── repository-form.vue
│       │   │   ├── branch-table.vue
│       │   │   └── delete-dialog.vue
│       │   ├── composables/       # Vue composables
│       │   ├── views/             # Pages
│       │   └── types/             # TypeScript types
│       └── dist/                  # Production build
└── pnpm-workspace.yaml
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- pnpm 9+
- Git repository to clean up

### Installation

```bash
# Clone repository
git clone <repo-url>
cd branch-cleanup

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### CLI Usage

```bash
# Run CLI interactively
pnpm dev:cli

# Or use built binary
cd apps/cli
./dist/index.js

# With options
./dist/index.js --pattern "feature/*" --dry-run
```

**CLI Options:**
- `--pattern <regex>` - Filter branches by pattern
- `--exclude <regex>` - Exclude branches matching pattern
- `--older-than <date>` - Only branches older than date
- `--dry-run` - Preview without deleting
- `--help` - Show help
- `--version` - Show version

### Web Usage

```bash
# Start backend API
pnpm dev:api
# API runs at http://localhost:3000

# Start web frontend
pnpm dev:web
# Web app runs at http://localhost:5173
```

**Web Interface:**
1. Enter repository path
2. Select target branch
3. (Optional) Apply filters
4. Analyze merged branches
5. Select branches to delete
6. Confirm deletion (or dry-run preview)

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm test:core    # Core library (79 tests)
pnpm test:cli     # CLI tests
pnpm test:api     # API tests

# Type checking
pnpm typecheck

# Coverage report
pnpm test:core --coverage
```

**Test Results:**
- ✅ 79/79 tests passing (100%)
- ✅ >70% code coverage
- ✅ Real git repositories (no mocks)
- ✅ All type checks passing

---

## 📦 Monorepo Commands

```bash
# Development
pnpm dev:cli      # Run CLI in watch mode
pnpm dev:api      # Run API in watch mode
pnpm dev:web      # Run web app in dev mode

# Building
pnpm build        # Build all packages
pnpm build:core   # Build core library only
pnpm build:cli    # Build CLI only
pnpm build:api    # Build API only
pnpm build:web    # Build web app only

# Testing
pnpm test         # Run all tests
pnpm test:core    # Test core library
pnpm typecheck    # Type check all packages

# Cleaning
pnpm clean        # Remove all dist/ and node_modules/
```

---

## 🎨 Design System

### Colors
- **Primary:** `#2563EB` (Trust Blue)
- **Background:** `#F8FAFC` (Light Slate)
- **Text:** `#1E293B` (Dark Slate)
- **Border:** `#E2E8F0` (Light Slate Border)
- **Destructive:** `#DC2626` (Red)

### Typography
- **Headings:** Poppins (400, 500, 600, 700)
- **Body:** Open Sans (300, 400, 500, 600, 700)
- **Hierarchy:** text-sm → text-base → text-lg → text-2xl → text-4xl

### Components
- shadcn-vue components (Card, Table, Button, Input, Select, etc.)
- Lucide Vue icons
- 200ms transitions
- Subtle shadows
- WCAG AA compliant

---

## 🏢 Tech Stack

### Shared
- **Language:** TypeScript 5.7
- **Package Manager:** pnpm 9.15
- **Monorepo:** pnpm workspaces
- **Node:** 22+

### Core Library
- simple-git 3.27 (Git operations)
- Zod 3.23 (Runtime validation)
- Vitest 2.1 (Testing)

### CLI
- @inquirer/prompts 7.2 (Interactive prompts)
- Commander 12.1 (CLI framework)
- chalk 5.4 (Terminal colors)
- cli-table3 0.6 (Tables)

### API
- Express 4.21 (REST API)
- CORS 2.8 (Cross-origin)
- Zod 3.23 (Validation)

### Web
- Vue 3.5 (Framework)
- Vite 6.0 (Build tool)
- shadcn-vue (Component library)
- Tailwind CSS 3.4 (Styling)
- Axios 1.7 (HTTP client)
- Lucide Vue 0.469 (Icons)

---

## 📖 Documentation

- **Plan:** `plans/260106-2239-git-branch-cleanup-dual-app/plan.md`
- **Design Guidelines:** `docs/design-guidelines.md`
- **Test Reports:** `plans/reports/tester-*.md`
- **Implementation Reports:** `plans/reports/fullstack-developer-*.md`

---

## 🤝 Contributing

1. Follow YAGNI, KISS, DRY principles
2. Keep files under 200 lines
3. Use kebab-case for file names
4. Add JSDoc comments to public APIs
5. Write tests for new features
6. Ensure type safety (no `any`)
7. Run `pnpm typecheck` before committing

---

## 📝 License

MIT

---

## 🙏 Credits

Built with:
- [Vue.js](https://vuejs.org/)
- [shadcn-vue](https://www.shadcn-vue.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [simple-git](https://github.com/steveukx/git-js)
- [inquirer](https://github.com/SBoudrias/Inquirer.js)
- [Vite](https://vitejs.dev/)

Designed with refined minimalism principles.
