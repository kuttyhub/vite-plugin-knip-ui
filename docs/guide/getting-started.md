# Getting Started

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Vite](https://vitejs.dev/) 5.x, 6.x, or 7.x
- [Knip](https://knip.dev/) installed in your project

## Installation

::: code-group

```bash [pnpm]
pnpm add -D vite-plugin-knip-ui
```

```bash [npm]
npm install -D vite-plugin-knip-ui
```

```bash [yarn]
yarn add -D vite-plugin-knip-ui
```

:::

## Setup

Add the plugin to your `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import knipUi from 'vite-plugin-knip-ui'

export default defineConfig({
  plugins: [knipUi()],
})
```

## Usage

1. Start your Vite dev server
2. Navigate to `/__knip-ui` in your browser
3. Click the play button to run analysis

The UI will display all dead code issues found by Knip, grouped by category.

## Next Steps

- [Configure plugin options](/guide/configuration)
- [Set up Knip configuration](/reference/knip-config)
- [Understand issue types](/reference/issue-types)
