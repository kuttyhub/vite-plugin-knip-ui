import { createBirpc } from 'birpc'
import type { WebSocket } from 'ws'
import type { ServerFunctions, ClientFunctions } from './types'

export function createRpcServer(
  ws: WebSocket,
  functions: ServerFunctions
): ReturnType<typeof createBirpc<ClientFunctions, ServerFunctions>> {
  return createBirpc<ClientFunctions, ServerFunctions>(functions, {
    post: (data) => ws.send(data),
    on: (handler) => ws.on('message', handler),
    serialize: (v) => {
      // Handle Error objects specially since JSON.stringify loses their properties
      if (v instanceof Error) {
        return JSON.stringify({ __isError: true, message: v.message, stack: v.stack })
      }
      return JSON.stringify(v)
    },
    deserialize: (v) => {
      const parsed = JSON.parse(String(v))
      // Reconstruct Error objects from serialized form
      if (parsed && typeof parsed === 'object' && parsed.__isError) {
        const err = new Error(parsed.message)
        err.stack = parsed.stack
        return err
      }
      return parsed
    },
  })
}
