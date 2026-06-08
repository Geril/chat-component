import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

/**
 * Pre-canned token arrays.
 */
const DEFAULT_TOKENS: readonly string[] = [
  'Sure,',
  " I'd",
  ' be',
  ' happy',
  ' to',
  ' help',
  ' with',
  ' that.',
  ' What',
  ' would',
  ' you',
  ' like',
  ' to',
  ' know',
  '?'
]

const LONG_TOKENS: readonly string[] = [
  'Great',
  ' question.',
  ' Artificial',
  ' intelligence',
  ' works',
  ' by',
  ' training',
  ' large',
  ' models',
  ' on',
  ' vast',
  ' datasets',
  ' of',
  ' text,',
  ' learning',
  ' statistical',
  ' patterns',
  ' between',
  ' words',
  ' and',
  ' concepts.',
  ' During',
  ' inference,',
  ' the',
  ' model',
  ' predicts',
  ' the',
  ' most',
  ' likely',
  ' next',
  ' token',
  ' given',
  ' all',
  ' the',
  ' context',
  ' it',
  ' has',
  ' seen',
  ' so',
  ' far.',
  ' This',
  ' process',
  ' repeats',
  ' token',
  ' by',
  ' token',
  ' until',
  ' a',
  ' stop',
  ' condition',
  ' is',
  ' met.'
]

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

const MAX_BODY_BYTES = 1_000_000 // 1 MB

class PayloadTooLargeError extends Error {}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Uint8Array[] = []
  let total = 0
  for await (const chunk of req) {
    const buf = chunk as Uint8Array
    total += buf.byteLength
    if (total > MAX_BODY_BYTES) {
      throw new PayloadTooLargeError('Request body exceeds limit')
    }
    chunks.push(buf)
  }
  return Buffer.concat(chunks).toString('utf-8')
}

interface IqRequestBody {
  message: string
}

function parseBody(raw: string): IqRequestBody | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('message' in parsed) ||
      typeof (parsed as Record<string, unknown>).message !== 'string'
    ) {
      return null
    }
    return { message: (parsed as Record<string, unknown>).message as string }
  } catch {
    return null
  }
}

type MockScenario = 'error' | 'slow' | 'midError' | 'delay' | 'empty' | 'long'

const VALID_SCENARIOS = new Set<string>(['error', 'slow', 'midError', 'delay', 'empty', 'long'])

function getMockScenario(params: URLSearchParams): MockScenario | null {
  const mock = params.get('mock')
  return mock !== null && VALID_SCENARIOS.has(mock) ? (mock as MockScenario) : null
}

function sendJson(res: ServerResponse, status: number, body: object): void {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function startSse(res: ServerResponse): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  })
}

function sseToken(res: ServerResponse, token: string): void {
  res.write(`data: ${token}\n\n`)
}

function sseDone(res: ServerResponse): void {
  res.write('data: [DONE]\n\n')
}

function sseError(res: ServerResponse, code: string, message: string): void {
  res.write(`event: error\ndata: ${JSON.stringify({ code, message })}\n\n`)
}

async function handleIqRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const { searchParams } = new URL(req.url ?? '/', 'http://localhost')
  const mock = getMockScenario(searchParams)

  let raw: string
  try {
    raw = await readBody(req)
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      sendJson(res, 413, { code: 'PAYLOAD_TOO_LARGE', message: 'Request body exceeds 1 MB' })
    } else {
      sendJson(res, 400, { code: 'BAD_REQUEST', message: 'Could not read request body' })
    }
    return
  }

  const body = parseBody(raw)
  if (!body) {
    sendJson(res, 400, { code: 'BAD_REQUEST', message: 'Body must be { message: string }' })
    return
  }

  /**
   * Scenario: error
   * HTTP 500 before any SSE data begins.
   * Tests the fetch() rejection path on the client (non-OK status).
   */
  if (mock === 'error') {
    sendJson(res, 500, { code: 'SERVER_ERROR', message: 'Internal server error' })
    return
  }

  // All remaining scenarios are SSE — headers are now flushed
  startSse(res)

  /**
   * Scenario: empty
   * Immediately sends [DONE] with zero tokens.
   * Tests how the UI renders a blank AI response.
   */
  if (mock === 'empty') {
    sseDone(res)
    res.end()
    return
  }

  const tokens = mock === 'long' ? LONG_TOKENS : DEFAULT_TOKENS
  // slow: 500ms/token  default: 100ms/token
  const tokenDelay = mock === 'slow' ? 500 : 100
  // midError fires at the halfway point
  const midErrorAt = mock === 'midError' ? Math.floor(tokens.length / 2) : -1

  /**
   * Scenario: delay
   * 3 s pause before the first token arrives.
   * Tests the loading-indicator state independently of slow streaming.
   */
  if (mock === 'delay') {
    await sleep(3000)
  }

  for (const [i, token] of tokens.entries()) {
    /**
     * Scenario: midError
     * Sends an SSE error event mid-stream (headers already flushed, can't change status).
     * Tests partial-response cleanup in the UI.
     */
    if (i === midErrorAt) {
      sseError(res, 'STREAM_ERROR', 'Stream interrupted mid-response')
      res.end()
      return
    }

    await sleep(tokenDelay)
    sseToken(res, token)
  }

  sseDone(res)
  res.end()
}

export function mockIqPlugin(): Plugin {
  return {
    name: 'mock-iq',
    configureServer(server) {
      server.middlewares.use('/iq', (req, res, next) => {
        if (req.method !== 'POST') {
          next()
          return
        }

        handleIqRequest(req, res).catch(() => {
          // Last-resort handler — should not normally be reached
          if (!res.headersSent) {
            sendJson(res, 500, { code: 'SERVER_ERROR', message: 'Unexpected error' })
          } else {
            sseError(res, 'SERVER_ERROR', 'Unexpected error')
            res.end()
          }
        })
      })
    }
  }
}
