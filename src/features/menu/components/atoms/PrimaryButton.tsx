import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

interface Props {
  children: ReactNode
  onClick: () => void
  short?: boolean
  /** Sits in a row next to another control: less side padding, and body-size text on the narrowest phones. */
  compact?: boolean
  className?: string
}

export function PrimaryButton({ children, onClick, short, compact, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'flex w-full items-center justify-center rounded-full bg-yellow text-center font-bold text-navy transition-transform duration-150 ease-out active:scale-[0.98]',
        compact ? 'px-3 text-body xs:text-heading' : 'px-4 text-heading',
        short ? 'h-12' : 'h-14',
        className,
      )}
    >
      {children}
    </button>
  )
}
