import { memo, useCallback, useDeferredValue, useState } from 'react'
import { Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { hasPii } from '@/lib/pii-guard'
import { Textarea } from '@/components/ui/textarea'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled: boolean
}

/**
 * Memoized input area.
 *
 * onSend is a stable useCallback reference from useChat; disabled is a derived
 * boolean — neither changes during streaming, so this component never re-renders
 * while tokens are flowing into the StreamingBubble.
 */
const ChatInput = memo(function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }, [value, disabled, onSend])

  const handleKeyDown = useCallback(
    (evt: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (evt.key === 'Enter' && !evt.shiftKey) {
        evt.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  // useDeferredValue marks the PII warning as non-urgent: React can skip updating
  // it to prioritize keeping the input keystroke renders responsive. On any device
  // fast enough to type, the deferred re-render follows immediately — the practical
  // effect is that the warning never blocks input latency.
  const piiDetected = hasPii(useDeferredValue(value))

  return (
    <div className='flex flex-col gap-2 p-4 pt-2'>
      {piiDetected && (
        <p className='text-xs text-amber-600 dark:text-amber-400'>
          ⚠ Personal info detected — will be anonymized before sending
        </p>
      )}
      <div className='flex gap-2'>
        <Textarea
          value={value}
          onChange={evt => {
            setValue(evt.target.value)
          }}
          onKeyDown={handleKeyDown}
          placeholder='Ask anything… (Shift+Enter for newline)'
          disabled={disabled}
          rows={1}
          className='max-h-32 min-h-[2.5rem] resize-none'
        />
        <Button onClick={handleSubmit} disabled={disabled || !value.trim()} size='icon' aria-label='Send'>
          <Send className='size-4' />
        </Button>
      </div>
    </div>
  )
})

ChatInput.displayName = 'ChatInput'

export { ChatInput }
