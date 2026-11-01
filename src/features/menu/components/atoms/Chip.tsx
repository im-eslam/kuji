import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

interface Props { kind?: 'detail' | 'savings'; compact?: boolean; outlined?: boolean; children: ReactNode }

// Minimum height + vertical padding (not a fixed height): one line is exactly 24 (20 compact), and a label that
// has to wrap, in a narrow column, a long add-on name, a big font size, grows the chip instead of spilling out.
// Text wraps and never truncates (Doc B 3.5). Numbers line up (tabular) so "Save 20 EGP" and "Save 15 EGP" match.
export function Chip({ kind = 'detail', compact, outlined, children }: Props) {
  return (
    <span
      className={cx(
        'inline-flex max-w-full items-center rounded-full px-2 text-caption tabular-nums text-balance',
        outlined && 'ring-1 ring-white',
        compact ? 'min-h-5 py-0.5' : 'min-h-6 py-1',
        kind === 'detail' ? 'bg-mist font-medium' : 'bg-arctic font-semibold',
      )}
    >
      {children}
    </span>
  )
}
