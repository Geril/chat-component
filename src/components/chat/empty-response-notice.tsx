import { Button } from '@/components/ui/button'

interface EmptyResponseNoticeProps {
  onRetry: () => void
}

/**
 * Inline notice shown when the AI returns an empty response ([DONE] with no tokens).
 *
 * Intentionally muted — this is a soft per-message failure, not a conversation-level
 * error. The input stays enabled so the user can immediately rephrase.
 */
export function EmptyResponseNotice({ onRetry }: EmptyResponseNoticeProps) {
  return (
    <div className='rounded-lg border border-muted bg-muted/30 px-4 py-3' role='alert'>
      <p className='text-sm text-muted-foreground'>
        Couldn't generate a response. Try again or rephrase your question.
      </p>
      <Button variant='ghost' size='sm' onClick={onRetry} className='mt-2 h-7 px-2 text-xs'>
        Try again
      </Button>
    </div>
  )
}

EmptyResponseNotice.displayName = 'EmptyResponseNotice'
