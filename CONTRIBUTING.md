# Contributing

Thanks for your interest in contributing!

## Development Setup

```bash
# Clone the repo
git clone https://github.com/kuttyhub/vite-plugin-knip-ui.git
cd vite-plugin-knip-ui

# Install dependencies
pnpm install

# Build the plugin
pnpm build

# Run the playground to test changes
cd playground && pnpm dev
```

## Project Structure

```
src/
├── client/          # Vue UI components
│   ├── components/  # UI components
│   ├── composables/ # Vue composables
│   └── main.ts      # Client entry
└── node/            # Vite plugin (server-side)
    ├── plugin.ts    # Main plugin
    ├── knip.ts      # Knip runner
    └── rpc.ts       # WebSocket RPC
```

## Making Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run `pnpm build` to ensure it builds
5. Run `pnpm typecheck` to check types
6. Commit your changes with a descriptive message
7. Push to your fork and open a Pull Request

## Code Style

- Use TypeScript
- Follow existing code conventions
- Keep changes focused and minimal

## Reporting Issues

- Check existing issues before opening a new one
- Include reproduction steps when reporting bugs
- Provide your environment details (Node.js, Vite, OS)
