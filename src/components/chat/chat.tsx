import { lazy, Suspense } from 'react'

import { useChat } from '@/hooks/use-chat'

import { ChatInput } from './chat-input'
import { MessageList } from './message-list'

/**
 * Lazy-loaded dev scenario switcher.
 *
 * The `import.meta.env.DEV` guard means Vite replaces this with `false` at
 * build time. Rollup's dead-code elimination then removes both the conditional
 * branch and the dynamic import, so scenario-switcher.tsx contributes 0 bytes
 * to the production bundle.
 */
const LazyScenarioSwitcher = import.meta.env.DEV
  ? lazy(() => import('./scenario-switcher').then(mod => ({ default: mod.ScenarioSwitcher })))
  : null

export function Chat() {
  const { messages, status, error, scenario, setScenario, streamingNodeRef, sendMessage, retry } = useChat()

  const isBusy = status === 'loading' || status === 'streaming'

  return (
    <div className='flex h-full flex-col'>
      <MessageList messages={messages} status={status} streamingNodeRef={streamingNodeRef} onRetry={retry} />

      {/* Conversation-level error (HTTP 500 — no tokens were ever received) */}
      {status === 'error' && error && (
        <div className='mx-4 mb-2 flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
          <span>{error}</span>
          <button onClick={retry} className='ml-3 font-medium underline underline-offset-2 hover:no-underline'>
            Try again
          </button>
        </div>
      )}

      {/* Dev-only scenario switcher — zero production bytes */}
      {import.meta.env.DEV && LazyScenarioSwitcher && (
        <Suspense fallback={null}>
          <LazyScenarioSwitcher scenario={scenario} onScenarioChange={setScenario} />
        </Suspense>
      )}

      <ChatInput onSend={sendMessage} disabled={isBusy} />

      {/* Persistent AI disclosure — fulfils "unmistakably AI-generated" requirement */}
      <footer className='flex items-center justify-center border-t border-muted bg-muted/20 px-4 py-2'>
        <p className='text-sm text-muted-foreground'>Responses are AI-generated · Content may be inaccurate</p>
      </footer>
    </div>
  )
}

Chat.displayName = 'Chat'
