import type { CSSProperties } from 'react'
import { cx } from '../../lib/cx'

interface Props {
  label: string
  options: Array<{ id: string; label: string }>
  value: string | undefined
  onChange: (id: string) => void
}

// The navy thumb slides to the chosen option (see .seg-thumb in index.css) instead of swapping backgrounds.
export function SegmentedControl({ label, options, value, onChange }: Props) {
  const index = Math.max(0, options.findIndex((o) => o.id === value))
  return (
    <div
      role="radiogroup"
      aria-label={label}
      style={{ '--i': index, '--n': options.length } as CSSProperties}
      className="relative grid h-12 auto-cols-fr grid-flow-col gap-1 rounded-full bg-mist p-1"
    >
      <span aria-hidden="true" className="seg-thumb absolute inset-y-1 rounded-full bg-navy" />
      {options.map((o) => {
        const on = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className={cx(
              'relative whitespace-nowrap rounded-full px-2 text-center text-small transition-colors duration-220 ease-(--ease-smooth)',
              on ? 'font-semibold text-white' : 'font-medium text-navy-65',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
