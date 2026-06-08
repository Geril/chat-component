/**
 * Three bouncing dots — pure CSS animation, zero JS on the main thread.
 * Staggered animation-delay prevents synchronised bouncing.
 */
export function LoadingIndicator() {
  return (
    <div className='flex items-center gap-1 py-1' role='status' aria-label='AI is thinking'>
      <span className='size-2 animate-bounce rounded-full bg-muted-foreground' style={{ animationDelay: '-0.3s' }} />
      <span className='size-2 animate-bounce rounded-full bg-muted-foreground' style={{ animationDelay: '-0.15s' }} />
      <span className='size-2 animate-bounce rounded-full bg-muted-foreground' />
    </div>
  )
}

LoadingIndicator.displayName = 'LoadingIndicator'
