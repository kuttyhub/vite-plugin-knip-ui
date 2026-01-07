import type { Plugin, ViteDevServer, ResolvedConfig } from 'vite'
import { WebSocketServer, WebSocket } from 'ws'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'
import { runKnipCli } from './knip'
import { createRpcServer } from './rpc'
import type { ServerFunctions, KnipResult, KnipConfigInfo } from './types'

const colors = {
  cyan: (str: string) => `\x1b[36m${str}\x1b[0m`,
  dim: (str: string) => `\x1b[2m${str}\x1b[0m`,
  green: (str: string) => `\x1b[32m${str}\x1b[0m`,
}

const _dirname =
  typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(import.meta.url))

export interface KnipUiOptions {
  /** Base path for the UI. Default: /__knip-ui */
  base?: string
}

export default function knipUi(options: KnipUiOptions = {}): Plugin {
  const base = options.base ?? '/__knip-ui'
  let projectRoot: string
  let config: ResolvedConfig
  let lastResults: KnipResult | null = null

  const clientDir = resolve(_dirname, '../client')

  function detectKnipConfig(): KnipConfigInfo {
    const knipJsonPath = join(projectRoot, 'knip.json')
    if (existsSync(knipJsonPath)) {
      return { exists: true, path: 'knip.json', source: 'knip.json' }
    }

    const knipJsoncPath = join(projectRoot, 'knip.jsonc')
    if (existsSync(knipJsoncPath)) {
      return { exists: true, path: 'knip.jsonc', source: 'knip.jsonc' }
    }

    const pkgJsonPath = join(projectRoot, 'package.json')
    if (existsSync(pkgJsonPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
        if (pkg.knip) {
          return { exists: true, path: 'package.json', source: 'package.json' }
        }
      } catch {
        // Ignore parse errors
      }
    }

    return { exists: false }
  }

  function exportToJson(results: KnipResult): string {
    return JSON.stringify(results, null, 2)
  }

  function exportToCsv(results: KnipResult): string {
    const rows: string[] = []
    rows.push('Category,File,Name,Line,Column,Specifier')

    for (const file of results.files) {
      rows.push(`files,"${file}",,,,`)
    }

    for (const exp of results.exports) {
      rows.push(`exports,"${exp.file}","${exp.name}",${exp.line},${exp.col},`)
    }

    for (const typ of results.types) {
      rows.push(`types,"${typ.file}","${typ.name}",${typ.line},${typ.col},`)
    }

    for (const dep of results.dependencies) {
      rows.push(`dependencies,,"${dep}",,,,`)
    }

    for (const dep of results.devDependencies) {
      rows.push(`devDependencies,,"${dep}",,,,`)
    }

    for (const item of results.unlisted) {
      rows.push(`unlisted,"${item.file}",,,,${item.specifier}`)
    }

    for (const item of results.binaries) {
      rows.push(`binaries,"${item.file}","${item.name}",,,`)
    }

    for (const item of results.unresolved) {
      rows.push(`unresolved,"${item.file}",,,,${item.specifier}`)
    }

    for (const item of results.duplicates) {
      rows.push(`duplicates,"${item.file}","${item.name}",,,`)
    }

    for (const em of results.enumMembers) {
      rows.push(`enumMembers,"${em.file}","${em.name}",${em.line},${em.col},`)
    }

    for (const cm of results.classMembers) {
      rows.push(`classMembers,"${cm.file}","${cm.name}",${cm.line},${cm.col},`)
    }

    return rows.join('\n')
  }

  return {
    name: 'vite-plugin-knip-ui',
    apply: 'serve',

    configResolved(resolvedConfig) {
      config = resolvedConfig
      projectRoot = resolvedConfig.root
    },

    configureServer(server: ViteDevServer) {
      const printUrl = () => {
        const protocol = config.server.https ? 'https' : 'http'
        const host = typeof config.server.host === 'string' ? config.server.host : 'localhost'
        const port = server.config.server.port ?? 5173
        const url = `${protocol}://${host}:${port}${base}/`

        setTimeout(() => {
          console.log(`  ${colors.green('➜')}  ${colors.dim('Knip UI:')} ${colors.cyan(url)}`)
        }, 0)
      }

      server.httpServer?.once('listening', printUrl)
      const wss = new WebSocketServer({ noServer: true })

      server.httpServer?.on('upgrade', (request, socket, head) => {
        if (request.url === `${base}/rpc`) {
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request)
          })
        }
      })

      wss.on('connection', (ws: WebSocket) => {
        const functions: ServerFunctions = {
          async runKnip() {
            const results = await runKnipCli(projectRoot)
            lastResults = results
            return results
          },
          async openInEditor(file: string, line?: number, col?: number) {
            const launchEditor = await import('launch-editor')
            const filePath = resolve(projectRoot, file)
            const location = line ? `${filePath}:${line}:${col ?? 1}` : filePath
            launchEditor.default(location)
          },
          async getFileContent(file: string) {
            const filePath = resolve(projectRoot, file)
            if (existsSync(filePath)) {
              return readFileSync(filePath, 'utf-8')
            }
            throw new Error(`File not found: ${file}`)
          },
          async getKnipConfig() {
            return detectKnipConfig()
          },
          async exportResults(format: 'json' | 'csv') {
            if (!lastResults) {
              throw new Error('No analysis results available. Run analysis first.')
            }
            return format === 'csv' ? exportToCsv(lastResults) : exportToJson(lastResults)
          },
        }

        createRpcServer(ws, functions)
      })

      server.middlewares.use((req, res, next) => {
        const url = req.url ?? ''

        if (url === base || url === `${base}/`) {
          const indexPath = join(clientDir, 'index.html')
          if (existsSync(indexPath)) {
            let html = readFileSync(indexPath, 'utf-8')
            html = html.replace(
              '</head>',
              `<script>window.__KNIP_UI_WS_URL__ = 'ws://' + location.host + '${base}/rpc';</script></head>`
            )
            html = html.replace(/src="\.?\/?assets\//g, `src="${base}/assets/`)
            html = html.replace(/href="\.?\/?assets\//g, `href="${base}/assets/`)
            res.setHeader('Content-Type', 'text/html')
            res.end(html)
            return
          }
          res.setHeader('Content-Type', 'text/html')
          res.end(getDevHtml(base))
          return
        }

        if (url.startsWith(`${base}/assets/`)) {
          const assetPath = url.replace(`${base}/assets/`, '')
          const filePath = join(clientDir, 'assets', assetPath)
          if (existsSync(filePath)) {
            const content = readFileSync(filePath)
            const ext = assetPath.split('.').pop()
            const mimeTypes: Record<string, string> = {
              js: 'application/javascript',
              css: 'text/css',
              json: 'application/json',
            }
            res.setHeader('Content-Type', mimeTypes[ext ?? ''] ?? 'application/octet-stream')
            res.end(content)
            return
          }
        }

        next()
      })
    },
  }
}

function getDevHtml(base: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Knip UI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; background: #1a1a1a; color: #fff; font-family: system-ui; }
    .container { display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; gap: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <p>⚠️ Client not built</p>
    <p>Run <code>pnpm build</code> to build the client UI</p>
  </div>
  <script>
    window.__KNIP_UI_WS_URL__ = 'ws://' + location.host + '${base}/rpc';
  </script>
</body>
</html>`
}
