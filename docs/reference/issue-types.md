# Issue Types

All issue types detected by Knip. See the [official Knip issue types reference](https://knip.dev/reference/issue-types) for complete documentation.

## Overview

| Type              | Description                        | Severity |
| ----------------- | ---------------------------------- | -------- |
| `files`           | Unused files not imported anywhere | High     |
| `exports`         | Unused exports not consumed        | Medium   |
| `types`           | Unused type exports                | Medium   |
| `dependencies`    | Unused production dependencies     | High     |
| `devDependencies` | Unused dev dependencies            | Medium   |
| `unlisted`        | Used but not in package.json       | High     |
| `binaries`        | Unused binaries from packages      | Low      |
| `unresolved`      | Unresolved imports                 | High     |
| `duplicates`      | Duplicate exports                  | Low      |
| `enumMembers`     | Unused enum members                | Low      |
| `classMembers`    | Unused class members               | Low      |

## Unused Files

Files that are not imported by any entry point.

**Fix:** Delete the file or add it as an entry point.

**Ignore:**

```json
{
  "ignore": ["**/fixtures/**"]
}
```

## Unused Exports

Exported functions, classes, or variables not used elsewhere.

**Fix:** Remove the export or mark as used.

**Ignore:**

```json
{
  "ignoreExportsUsedInFile": true
}
```

## Unused Dependencies

Packages in `dependencies` not imported in code.

**Fix:** `pnpm remove <package>`

**Ignore:**

```json
{
  "ignoreDependencies": ["some-peer-dep"]
}
```

## Unlisted Dependencies

Imports that resolve but aren't in package.json.

**Fix:** `pnpm add <package>`

## Unresolved Imports

Imports that cannot be resolved.

**Fix:** Install the missing package or fix the import path.

## Further Reading

- [Knip Issue Types](https://knip.dev/reference/issue-types)
- [Handling Issues](https://knip.dev/guides/handling-issues)
- [CLI Reference](https://knip.dev/reference/cli)
