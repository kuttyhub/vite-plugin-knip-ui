# Plugin Options

## Configuration

```ts
import knipUi from 'vite-plugin-knip-ui'

export default defineConfig({
  plugins: [
    knipUi({
      // options
    }),
  ],
})
```

## Options

### `base`

- **Type:** `string`
- **Default:** `'/__knip-ui'`

The base URL path where the Knip UI will be served.

```ts
knipUi({
  base: '/__knip', // Access at http://localhost:5173/__knip
})
```

::: tip
Choose a path that doesn't conflict with your application routes.
:::

## TypeScript

The plugin exports types for configuration:

```ts
import knipUi, { type KnipUiOptions } from 'vite-plugin-knip-ui'

const options: KnipUiOptions = {
  base: '/__knip-ui',
}

export default defineConfig({
  plugins: [knipUi(options)],
})
```
