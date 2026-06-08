import { memo } from 'react'

import type { Message } from '@/types/chat'

import { BubbleShell } from './bubble-shell'

interface MessageBubbleProps {
  message: Message
}

/**
 * Memoized completed message bubble.
 *
 * Messages are immutable objects with stable references — React.memo's shallow
 * comparison is O(1) and prevents any re-render of completed messages while new
 * tokens stream into the live StreamingBubble.
 */
const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
  const variant = message.errorKind === 'partial' ? 'error' : 'default'
  return (
    <BubbleShell role={message.role} variant={variant}>
      <p className='text-sm leading-relaxed whitespace-pre-wrap'>{message.content}</p>
      {message.errorKind === 'partial' && <p className='mt-1.5 text-xs text-destructive'>⚠ Response interrupted</p>}
    </BubbleShell>
  )
})

MessageBubble.displayName = 'MessageBubble'

export { MessageBubble }
