import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MockScenario } from '@/types/chat'

interface ScenarioConfig {
  label: string
  value: MockScenario | undefined
  description: string
}

const SCENARIOS: readonly ScenarioConfig[] = [
  { label: 'Default', value: undefined, description: 'Normal stream' },
  { label: 'Error', value: 'error', description: 'HTTP 500 immediately' },
  { label: 'Slow', value: 'slow', description: '500ms between tokens' },
  { label: 'Mid Error', value: 'midError', description: 'SSE error mid-stream' },
  { label: 'Delay', value: 'delay', description: '3s before first token' },
  { label: 'Empty', value: 'empty', description: '[DONE] with no tokens' },
  { label: 'Long', value: 'long', description: '~50 token response' }
] as const

interface ScenarioSwitcherProps {
  scenario: MockScenario | undefined
  onScenarioChange: (scenario: MockScenario | undefined) => void
}

/**
 * Dev-only mock scenario selector.
 *
 * This file is never imported in production:
 *   chat.tsx uses `import.meta.env.DEV && React.lazy(...)` so Vite's dead-code
 *   elimination removes the dynamic import entirely from production bundles.
 */
export function ScenarioSwitcher({ scenario, onScenarioChange }: ScenarioSwitcherProps) {
  return (
    <div className='border-t border-dashed border-muted px-4 py-2'>
      <p className='mb-1.5 text-xs font-medium text-muted-foreground'>Dev — mock scenario</p>
      <div className='flex flex-wrap gap-1.5'>
        {SCENARIOS.map(({ label, value, description }) => (
          <Button
            key={label}
            variant={scenario === value ? 'default' : 'outline'}
            size='sm'
            title={description}
            className={cn('h-6 px-2 text-xs', scenario === value && 'font-semibold')}
            onClick={() => {
              onScenarioChange(value)
            }}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}

ScenarioSwitcher.displayName = 'ScenarioSwitcher'
