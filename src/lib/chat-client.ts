import { scrubPii } from '@/lib/pii-guard'
import type { MockScenario } from '@/types/chat'

export class IqError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message)
    this.name = 'IqError'
  }
}

export class IqStreamError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message)
    this.name = 'IqStreamError'
  }
}

function parseErrorPayload(data: string | undefined): { code: string; message: string } {
  try {
    const parsed: unknown = JSON.parse(data ?? '{}')
    if (typeof parsed !== 'object' || parsed === null) {
      return { code: 'STREAM_ERROR', message: 'Stream error' }
    }
    const record = parsed as Record<string, unknown>
    return {
      code: typeof record.code === 'string' ? record.code : 'STREAM_ERROR',
      message: typeof record.message === 'string' ? record.message : 'Stream error'
    }
  } catch {
    return { code: 'STREAM_ERROR', message: 'Stream error' }
  }
}

/**
 * Streams tokens from POST /iq token by token via Server-Sent Events.
 *
 * PII boundary: only { message } is sent — no user identifiers or personal fields.
 * In production, message content would pass through a scrubbing layer before this call.
 */
/* eslint-disable-next-line complexity */
export async function* streamResponse(
  message: string,
  scenario?: MockScenario,
  signal?: AbortSignal
): AsyncGenerator<string> {
  const url = scenario !== undefined ? `/iq?mock=${scenario}` : '/iq'

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // scrubPii runs at the transport boundary — the last point before data leaves
    // the browser. Original text is shown in the UI; only this payload is scrubbed.
    body: JSON.stringify({ message: scrubPii(message) }),
    signal
  })

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => ({}))
    const record = typeof errorBody === 'object' && errorBody !== null ? (errorBody as Record<string, unknown>) : {}
    throw new IqError(
      response.status,
      typeof record.code === 'string' ? record.code : 'SERVER_ERROR',
      typeof record.message === 'string' ? record.message : 'Request failed'
    )
  }

  if (!response.body) {
    throw new IqError(response.status, 'NO_BODY', 'Response body is empty')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Split on double newlines so we always process complete SSE messages
      // (event: + data: fields arrive together, never split across reads)
      const mutableSseMessages = buffer.split('\n\n')
      buffer = mutableSseMessages.pop() ?? ''

      for (const sseMessage of mutableSseMessages) {
        if (!sseMessage.trim()) continue

        const eventMatch = sseMessage.match(/^event:\s*(.+)$/m)
        // SSE spec: strip exactly one optional space after the colon — the separator.
        // Using \s* would greedily eat leading spaces that are part of the token value.
        const dataMatch = sseMessage.match(/^data: ?(.*)$/m)
        const eventType = eventMatch?.[1]?.trim()
        const data = dataMatch?.[1]

        if (eventType === 'error') {
          const { code, message: msg } = parseErrorPayload(data)
          throw new IqStreamError(code, msg)
        }

        if (data === '[DONE]') return
        if (data !== undefined) yield data
      }
    }
  } finally {
    reader.releaseLock()
  }
}
