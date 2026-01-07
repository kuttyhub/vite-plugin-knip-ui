# Troubleshooting

## Common Issues

### Analysis Times Out

If analysis times out on large projects:

1. Run Knip directly to verify it works:

   ```bash
   npx knip --reporter json
   ```

2. Enable caching in your Knip config:

   ```json
   {
     "cache": true
   }
   ```

3. Exclude heavy directories:
   ```json
   {
     "ignore": ["**/node_modules/**", "**/dist/**"]
   }
   ```

See [Knip Performance Guide](https://knip.dev/guides/performance) for more tips.

### False Positives

If Knip reports used code as unused:

1. **Dynamic imports**: Add entry points for dynamically imported files
2. **External usage**: Mark externally consumed exports
3. **Framework patterns**: Ensure framework plugins are enabled

See [Knip Handling Issues Guide](https://knip.dev/guides/handling-issues) for solutions.

### WebSocket Disconnected

If the connection status shows disconnected:

1. Ensure your dev server is running
2. Check for proxy configurations blocking WebSocket
3. Try a different browser

### "Knip not found"

Ensure Knip is installed:

```bash
pnpm add -D knip
```

## Getting Help

- [Knip Documentation](https://knip.dev)
- [GitHub Issues](https://github.com/kuttyhub/vite-plugin-knip-ui/issues)
- [Knip Discord](https://discord.gg/knip)
