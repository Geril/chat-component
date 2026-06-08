import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import type { ChatStatus, Message } from '@/types/chat'

import { EmptyResponseNotice } from './empty-response-notice'
import { MessageBubble } from './message-bubble'
import { StreamingBubble } from './streaming-bubble'

interface MessageListProps {
  messages: Message[]
  status: ChatStatus
  streamingNodeRef: RefObject<HTMLSpanElement | null>
  onRetry: () => void
}

/**
 * Scrollable message list.
 *
 * Auto-scroll fires only on messages.length change (new message committed),
 * not on individual token writes — token writes go directly to the DOM and
 * never trigger this effect.
 *
 * StreamingBubble is rendered below completed messages when a stream is active.
 * Once [DONE] arrives, StreamingBubble unmounts and the committed MessageBubble
 * appears in its place.
 */
export function MessageList({ messages, status, streamingNodeRef, onRetry }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const isStreaming = status === 'loading' || status === 'streaming'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className='flex-1 overflow-y-auto'>
      <div className='flex flex-col gap-4 p-4 pb-2'>
        {messages.length === 0 && status === 'idle' && (
          <div className='flex flex-1 flex-col items-center justify-center py-20 text-center'>
            <p className='text-sm text-muted-foreground'>Ask anything to get started.</p>
          </div>
        )}

        {messages.map(msg =>
          msg.errorKind === 'empty' ? (
            <EmptyResponseNotice key={msg.id} onRetry={onRetry} />
          ) : (
            <MessageBubble key={msg.id} message={msg} />
          )
        )}

        {isStreaming && <StreamingBubble ref={streamingNodeRef} status={status} />}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}

MessageList.displayName = 'MessageList'
