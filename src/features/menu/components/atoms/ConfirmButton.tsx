import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

interface Props { children: ReactNode; onClick: () => void; className?: string }

export function ConfirmButton({ children, onClick, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx('flex h-12 items-center justify-center rounded-full bg-navy px-4 text-center text-small font-semibold text-white transition-transform duration-150 ease-out active:scale-[0.98]', className)}
    >
      {children}
    </button>
  )
}
