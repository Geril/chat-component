import { startTransition, useCallback, useEffect, useReducer, useRef, useState } from 'react'
import type { RefObject } from 'react'

import { IqError, IqStreamError, streamResponse } from '@/lib/chat-client'
import type { ChatStatus, Message, MessageErrorKind, MockScenario } from '@/types/chat'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface ChatState {
  messages: Message[]
  status: ChatStatus
  error: string | null
}

type ChatAction =
  | { type: 'ADD_USER_MESSAGE'; message: Message }
  | { type: 'COMMIT_AI_MESSAGE'; message: Message }
  | { type: 'SET_STREAMING' }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'START_RETRY' }

const initialState: ChatState = { messages: [], status: 'idle', error: null }

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return { ...state, messages: [...state.messages, action.message], status: 'loading', error: null }
    case 'COMMIT_AI_MESSAGE':
      return { ...state, messages: [...state.messages, action.message], status: 'idle', error: null }
    case 'SET_STREAMING':
      return { ...state, status: 'streaming' }
    case 'SET_ERROR':
      return { ...state, status: 'error', error: action.error }
    case 'CLEAR_ERROR':
      return { ...state, status: 'idle', error: null }
    case 'START_RETRY':
      return { ...state, status: 'loading', error: null }
    default:
      return state
  }
}

function makeMessage(role: 'user' | 'ai', content: string, errorKind?: MessageErrorKind): Message {
  return { id: crypto.randomUUID(), role, content, timestamp: new Date(), errorKind }
}

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface UseChatReturn {
  messages: Message[]
  status: ChatStatus
  error: string | null
  scenario: MockScenario | undefined
  setScenario: (scenario: MockScenario | undefined) => void
  streamingNodeRef: RefObject<HTMLSpanElement | null>
  sendMessage: (text: string) => void
  retry: () => void
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useChat(): UseChatReturn {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const [scenario, setScenario] = useState<MockScenario | undefined>(undefined)

  /**
   * Streaming hot-path refs — mutated directly, never stored in React state.
   * Prefixed `mutable` to satisfy the functional/immutable-data lint convention.
   */
  const mutableStreamingNodeRef = useRef<HTMLSpanElement | null>(null)
  const mutableContentRef = useRef<string>('')
  const mutableAbortRef = useRef<AbortController | null>(null)
  const mutableLastTextRef = useRef<string>('')
  const mutableHasStreamedRef = useRef<boolean>(false)

  useEffect(
    () => () => {
      mutableAbortRef.current?.abort()
    },
    []
  )

  const sendMessage = useCallback(
    (text: string, isRetry = false): void => {
      mutableAbortRef.current?.abort()
      const controller = new AbortController()
      mutableAbortRef.current = controller
      mutableLastTextRef.current = text
      mutableHasStreamedRef.current = false
      mutableContentRef.current = ''

      if (isRetry) {
        dispatch({ type: 'START_RETRY' })
      } else {
        dispatch({ type: 'ADD_USER_MESSAGE', message: makeMessage('user', text) })
      }

      /* eslint-disable-next-line complexity */
      void (async () => {
        try {
          for await (const token of streamResponse(text, scenario, controller.signal)) {
            if (!mutableHasStreamedRef.current) {
              mutableHasStreamedRef.current = true
              // The span is always mounted once StreamingBubble renders (status=loading),
              // so mutableStreamingNodeRef.current is already valid here. A plain dispatch is
              // enough — SET_STREAMING just hides the loading indicator.
              dispatch({ type: 'SET_STREAMING' })
            }

            /**
             * Direct DOM write — bypasses React reconciliation entirely for the
             * streaming hot path. React gets exactly one state update per message
             * (when [DONE] arrives), regardless of how many tokens streamed.
             */
            if (mutableStreamingNodeRef.current) {
              mutableStreamingNodeRef.current.textContent += token
            }
            mutableContentRef.current += token
          }

          const content = mutableContentRef.current
          if (mutableStreamingNodeRef.current) mutableStreamingNodeRef.current.textContent = ''
          mutableContentRef.current = ''

          // Single state update for the entire response; startTransition marks it
          // non-urgent so React can yield to higher-priority input events first.
          startTransition(() => {
            dispatch({
              type: 'COMMIT_AI_MESSAGE',
              message: makeMessage('ai', content, content === '' ? 'empty' : undefined)
            })
          })
        } catch (err) {
          if (controller.signal.aborted) return

          const partial = mutableContentRef.current
          if (mutableStreamingNodeRef.current) mutableStreamingNodeRef.current.textContent = ''
          mutableContentRef.current = ''

          if (partial) {
            // midError: partial content received — commit it with error treatment,
            // then return to idle so the conversation can continue
            startTransition(() => {
              dispatch({ type: 'COMMIT_AI_MESSAGE', message: makeMessage('ai', partial, 'partial') })
            })
            dispatch({ type: 'CLEAR_ERROR' })
          } else {
            // HTTP-level failure before any tokens — conversation-level error
            const errorMessage =
              err instanceof IqError || err instanceof IqStreamError
                ? err.message
                : 'Something went wrong. Please try again.'
            dispatch({ type: 'SET_ERROR', error: errorMessage })
          }
        }
      })()
    },
    [scenario]
  )

  const retry = useCallback((): void => {
    if (mutableLastTextRef.current) sendMessage(mutableLastTextRef.current, true)
  }, [sendMessage])

  return {
    messages: state.messages,
    status: state.status,
    error: state.error,
    scenario,
    setScenario,
    streamingNodeRef: mutableStreamingNodeRef,
    sendMessage,
    retry
  }
}
