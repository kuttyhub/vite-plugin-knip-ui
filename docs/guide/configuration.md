# Configuration

## Plugin Options

```ts
import knipUi from 'vite-plugin-knip-ui'

export default defineConfig({
  plugins: [
    knipUi({
      base: '/__knip-ui', // Custom base path (default: /__knip-ui)
    }),
  ],
})
```

See [Plugin Options Reference](/reference/plugin-options) for all available options.

## Knip Configuration

This plugin uses your project's Knip configuration. If no config is found, a warning banner will appear in the UI.

### Quick Setup

```bash
npx knip --init
```

This creates a `knip.json` with sensible defaults for your project.

### Manual Setup

Create `knip.json` in your project root:

```json
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": ["src/main.ts"],
  "project": ["src/**/*.ts"]
}
```

See [Knip Configuration Reference](/reference/knip-config) for detailed options.

## Framework Integration

Knip automatically detects and configures plugins for popular frameworks:

- Vue / Nuxt
- React / Next.js
- Svelte / SvelteKit
- Astro
- And [many more](https://knip.dev/reference/plugins)

No additional configuration is typically needed for standard setups.
