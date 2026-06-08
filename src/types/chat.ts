export type MessageErrorKind = 'partial' | 'empty'

export type ChatStatus = 'idle' | 'loading' | 'streaming' | 'error'

export type MockScenario = 'error' | 'slow' | 'midError' | 'delay' | 'empty' | 'long'

export interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
  errorKind?: MessageErrorKind
}
