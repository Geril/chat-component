import { Chat } from '@/components/chat/chat'

export function App() {
  return (
    <div className='flex h-screen bg-background text-foreground'>
      <div className='mx-auto flex w-full max-w-2xl flex-col'>
        <Chat />
      </div>
    </div>
  )
}

App.displayName = 'App'
