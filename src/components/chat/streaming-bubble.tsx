import { forwardRef } from 'react'

import type { ChatStatus } from '@/types/chat'

import { BubbleShell } from './bubble-shell'
import { LoadingIndicator } from './loading-indicator'

interface StreamingBubbleProps {
  /** Only the live states where this component is mounted. */
  status: Extract<ChatStatus, 'loading' | 'streaming'>
}

/**
 * Live AI bubble during an active stream.
 *
 * Not memoized — this is the one component intentionally outside React's update cycle.
 * The forwarded ref lets use-chat write tokens directly to the DOM span, bypassing
 * reconciliation entirely until [DONE] arrives.
 *
 * loading  → shows LoadingIndicator (waiting for first token)
 */
const StreamingBubble = forwardRef<HTMLSpanElement, StreamingBubbleProps>(function StreamingBubble({ status }, ref) {
  return (
    <BubbleShell role='ai'>
      {/*
       * The span is always rendered so mutableStreamingNodeRef is valid the moment
       * StreamingBubble mounts (triggered by ADD_USER_MESSAGE). This lets
       * use-chat write the first token directly without needing flushSync to
       * synchronously force a React render first.
       * SET_STREAMING's only job is hiding this indicator once tokens flow.
       */}
      {status === 'loading' && <LoadingIndicator />}
      <span
        ref={ref}
        aria-live='polite'
        aria-label='AI response'
        className='text-sm leading-relaxed whitespace-pre-wrap'
      />
    </BubbleShell>
  )
})

StreamingBubble.displayName = 'StreamingBubble'

export { StreamingBubble }
