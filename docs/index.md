---
layout: home

hero:
  name: Vite Plugin Knip UI
  text: Dead Code Visualization
  tagline: Visualize Knip analysis results directly in your Vite dev server
  image:
    src: /screenshot.png
    alt: Knip UI Screenshot
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/kuttyhub/vite-plugin-knip-ui

features:
  - icon: 🔍
    title: Real-time Analysis
    details: Run Knip analysis directly from the browser with one click
  - icon: 🌳
    title: Tree View
    details: Navigate issues in a structured file tree grouped by category
  - icon: 📂
    title: Click to Open
    details: Jump to any file or export in your editor instantly
  - icon: 📊
    title: Export Reports
    details: Download analysis results as JSON or CSV
  - icon: ⚡
    title: Fast Integration
    details: Works with Vite 5, 6, and 7 out of the box
  - icon: 🎨
    title: Dark & Light Themes
    details: Matches your preferred editor theme
---

## Quick Start

```bash
pnpm add -D vite-plugin-knip-ui
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import knipUi from 'vite-plugin-knip-ui'

export default defineConfig({
  plugins: [knipUi()],
})
```

Navigate to `/__knip-ui` in your dev server to view the analysis panel.
