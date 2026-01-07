# Knip Configuration

This plugin uses your project's Knip configuration. See the [official Knip configuration reference](https://knip.dev/reference/configuration) for complete documentation.

## Quick Setup

```bash
npx knip --init
```

## Configuration File

Create `knip.json` or `knip.jsonc` in your project root:

```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": ["src/index.ts", "src/main.ts"],
  "project": ["src/**/*.ts"],
  "ignore": ["**/*.test.ts", "**/*.spec.ts"]
}
```

## Key Options

| Option               | Description                       | Reference                                                                    |
| -------------------- | --------------------------------- | ---------------------------------------------------------------------------- |
| `entry`              | Entry points for your application | [Entry Files](https://knip.dev/explanations/entry-files)                     |
| `project`            | Files to analyze (glob patterns)  | [Project Files](https://knip.dev/explanations/project-files)                 |
| `ignore`             | Files to exclude from analysis    | [Handling Issues](https://knip.dev/guides/handling-issues#ignore)            |
| `ignoreDependencies` | Dependencies to ignore            | [Configuration](https://knip.dev/reference/configuration#ignoredependencies) |
| `ignoreBinaries`     | Binaries to ignore                | [Configuration](https://knip.dev/reference/configuration#ignorebinaries)     |

## Framework Plugins

Knip auto-detects frameworks and enables appropriate plugins. See [Knip Plugins](https://knip.dev/reference/plugins) for the full list.

Example with explicit plugin config:

```json
{
  "vite": {
    "config": ["vite.config.ts"]
  },
  "vitest": {
    "config": ["vitest.config.ts"]
  }
}
```

## Monorepo Configuration

For workspaces, see [Knip Workspaces](https://knip.dev/features/workspaces):

```json
{
  "workspaces": {
    "packages/*": {
      "entry": ["src/index.ts"],
      "project": ["src/**/*.ts"]
    }
  }
}
```

## Ignore Patterns

To ignore false positives, see [Handling Issues](https://knip.dev/guides/handling-issues):

```json
{
  "ignore": ["**/fixtures/**"],
  "ignoreDependencies": ["some-peer-dep"],
  "ignoreExportsUsedInFile": true
}
```
