# CI/CD Integration

While the Vite plugin provides a visual interface for development, you should run Knip directly in your CI/CD pipeline to enforce code quality.

## Available Scripts

The project provides two scripts for different use cases:

| Script         | Command             | Behavior                        |
| -------------- | ------------------- | ------------------------------- |
| `lint:knip`    | `pnpm lint:knip`    | Fails if any dead code is found |
| `lint:knip:ci` | `pnpm lint:knip:ci` | Reports issues without failing  |

## GitHub Actions

Add Knip to your CI workflow to catch dead code before it reaches production:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Typecheck
        run: pnpm typecheck

      - name: Check for dead code (Knip)
        run: pnpm lint:knip
```

## Enforcement Modes

### Strict Mode (Recommended)

Use `pnpm lint:knip` to fail the build when any dead code is detected:

```yaml
- name: Check for dead code (Knip)
  run: pnpm lint:knip
```

This is the recommended approach for:

- New projects starting fresh
- Projects that have completed their initial cleanup

### Gradual Mode

Use `pnpm lint:knip:ci` to report issues without failing the build:

```yaml
- name: Check for dead code (Knip)
  run: pnpm lint:knip:ci
```

This is useful for:

- Existing projects with technical debt
- Teams in the process of cleaning up dead code

## Migration Path

For projects adopting Knip incrementally:

### Phase 1: Discovery

Run Knip in report-only mode to understand the scope:

```yaml
- name: Check for dead code (Knip)
  run: pnpm lint:knip:ci
```

### Phase 2: Cleanup

Address issues iteratively. Use `knip.json` to ignore known issues temporarily:

```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "ignore": ["legacy/**"],
  "ignoreDependencies": ["legacy-package"]
}
```

### Phase 3: Enforcement

Once cleaned up, switch to strict mode:

```yaml
- name: Check for dead code (Knip)
  run: pnpm lint:knip
```

## Pre-commit Hooks (Optional)

For faster feedback during development, add Knip to your pre-commit hooks.

### With lint-staged

Add to your `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["knip --no-progress"]
  }
}
```

### With Husky

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx knip --no-progress
```

## GitLab CI

```yaml
knip:
  stage: test
  script:
    - pnpm install --frozen-lockfile
    - pnpm lint:knip
```

## Other CI Systems

Knip works with any CI system that can run npm scripts. The key commands are:

```bash
# Strict: exit 1 on issues
npx knip

# Report only: always exit 0
npx knip --no-exit-code

# JSON output for custom processing
npx knip --reporter json
```

## Troubleshooting

### False Positives

If Knip reports false positives, configure exceptions in `knip.json`:

```json
{
  "ignore": ["src/polyfills.ts"],
  "ignoreDependencies": ["@types/node"]
}
```

### Performance

For large codebases, enable caching:

```bash
npx knip --cache
```

See [Knip Configuration](/reference/knip-config) for more options.
