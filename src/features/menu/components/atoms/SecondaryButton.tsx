import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

interface Props { children: ReactNode; onClick: () => void; className?: string }

export function SecondaryButton({ children, onClick, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx('flex h-12 items-center justify-center gap-2 rounded-full border border-arctic px-4 text-center text-small font-semibold active:bg-mist', className)}
    >
      {children}
    </button>
  )
}
