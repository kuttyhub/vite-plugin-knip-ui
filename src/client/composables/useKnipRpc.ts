import { ref, shallowRef } from 'vue'
import { createBirpc } from 'birpc'
import type { ServerFunctions, ClientFunctions, KnipResult, KnipConfigInfo } from '../../node/types'

const RPC_TIMEOUT_MS = 6 * 60 * 1000

const rpc = shallowRef<ReturnType<typeof createBirpc<ServerFunctions, ClientFunctions>> | null>(
  null
)
const isConnected = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const results = shallowRef<KnipResult | null>(null)
const configInfo = shallowRef<KnipConfigInfo | null>(null)

let onConnectCallback: (() => void) | null = null

/**
 * Ensures all KnipResult arrays are initialized.
 * Handles cases where JSON serialization might omit empty arrays.
 */
function normalizeKnipResult(raw: Partial<KnipResult>): KnipResult {
  return {
    files: raw.files ?? [],
    exports: raw.exports ?? [],
    types: raw.types ?? [],
    dependencies: raw.dependencies ?? [],
    devDependencies: raw.devDependencies ?? [],
    optionalPeerDependencies: raw.optionalPeerDependencies ?? [],
    unlisted: raw.unlisted ?? [],
    binaries: raw.binaries ?? [],
    unresolved: raw.unresolved ?? [],
    duplicates: raw.duplicates ?? [],
    enumMembers: raw.enumMembers ?? [],
    classMembers: raw.classMembers ?? [],
  }
}

function connect(onConnect?: () => void) {
  if (onConnect) {
    onConnectCallback = onConnect
  }

  const wsUrl =
    (window as { __KNIP_UI_WS_URL__?: string }).__KNIP_UI_WS_URL__ ??
    `ws://${location.host}/__knip-ui/rpc`

  const ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    isConnected.value = true
    error.value = null

    rpc.value = createBirpc<ServerFunctions, ClientFunctions>(
      {},
      {
        post: (data) => ws.send(data),
        on: (handler) => {
          ws.onmessage = (e) => handler(e.data)
        },
        serialize: (v) => JSON.stringify(v),
        deserialize: (v) => JSON.parse(v),
        timeout: RPC_TIMEOUT_MS,
        onTimeoutError: (name) => {
          console.error(`[knip-ui] RPC timeout for method: ${name}`)
          error.value = `Analysis timed out. Try running 'npx knip' directly.`
          isLoading.value = false
        },
      }
    )

    if (onConnectCallback) {
      onConnectCallback()
    }
  }

  ws.onclose = () => {
    isConnected.value = false
    rpc.value = null
  }

  ws.onerror = () => {
    error.value = 'WebSocket connection failed'
    isConnected.value = false
  }
}

async function runAnalysis() {
  if (!rpc.value) {
    error.value = 'Not connected to server'
    return
  }

  isLoading.value = true
  error.value = null
  results.value = null

  try {
    console.log('[knip-ui] Starting analysis...')
    const startTime = performance.now()
    const raw = await rpc.value.runKnip()
    results.value = normalizeKnipResult(raw)
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(1)
    console.log(`[knip-ui] Analysis completed in ${elapsed}s`)
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e)
    console.error('[knip-ui] Analysis failed:', errMsg)
    if (errMsg.includes('timeout')) {
      error.value = "Analysis timed out. Try running 'npx knip' directly."
    } else {
      error.value = errMsg
    }
  } finally {
    isLoading.value = false
  }
}

async function openInEditor(file: string, line?: number, col?: number) {
  if (!rpc.value) return
  await rpc.value.openInEditor(file, line, col)
}

async function getFileContent(file: string): Promise<string | null> {
  if (!rpc.value) {
    console.error('[knip-ui] RPC not connected')
    return null
  }
  try {
    const content = await rpc.value.getFileContent(file)
    return content
  } catch (err) {
    console.error('[knip-ui] Failed to get file content:', file, err)
    return null
  }
}

async function fetchKnipConfig(): Promise<KnipConfigInfo | null> {
  if (!rpc.value) {
    console.error('[knip-ui] RPC not connected')
    return null
  }
  try {
    const info = await rpc.value.getKnipConfig()
    configInfo.value = info
    return info
  } catch (err) {
    console.error('[knip-ui] Failed to get config info:', err)
    return null
  }
}

async function exportResults(format: 'json' | 'csv'): Promise<string | null> {
  if (!rpc.value) {
    console.error('[knip-ui] RPC not connected')
    return null
  }
  try {
    return await rpc.value.exportResults(format)
  } catch (err) {
    console.error('[knip-ui] Failed to export results:', err)
    return null
  }
}

export function useKnipRpc() {
  return {
    isConnected,
    isLoading,
    error,
    results,
    configInfo,
    connect,
    runAnalysis,
    openInEditor,
    getFileContent,
    fetchKnipConfig,
    exportResults,
  }
}
