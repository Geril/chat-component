import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface BubbleShellProps {
  role: 'user' | 'ai'
  /**
   * 'error' swaps the AI border from primary → destructive.
   * Used for partial-error messages (mid-stream failure).
   */
  variant?: 'default' | 'error'
  children: ReactNode
}

/**
 * Shared layout primitive for all chat bubbles.
 * Owns alignment, border chrome and the AI badge — content is provided by consumers.
 *
 * Not memoized here; memo at the MessageBubble boundary prevents this from
 * executing at all for completed messages during streaming.
 */
export function BubbleShell({ role, variant = 'default', children }: BubbleShellProps) {
  if (role === 'user') {
    return (
      <div className='flex justify-end'>
        <div className='max-w-[80%] rounded-xl bg-muted px-4 py-2.5 text-sm'>{children}</div>
      </div>
    )
  }

  return (
    <div className='flex justify-start'>
      <div className={cn('max-w-[80%] border-l-2 pl-3', variant === 'error' ? 'border-destructive' : 'border-primary')}>
        <div className='mb-1.5 flex items-center gap-1.5'>
          <Badge variant='secondary' className='h-5 px-1.5 text-sm'>
            AI
          </Badge>
        </div>
        {children}
      </div>
    </div>
  )
}

BubbleShell.displayName = 'BubbleShell'
