import { useState, type ReactNode } from 'react'
import { cx } from '../../lib/cx'

interface Props { value: string | number | boolean | null | undefined; children: ReactNode; className?: string }

// For things that are replaced, not counted: an icon turning into another (plus -> check, minus -> bin).
// The new one pops in (170ms: scale up + fade). Nothing plays on first render, and the same value stays still.
export function Swap({ value, children, className }: Props) {
  const key = String(value)
  const [prev, setPrev] = useState(key)
  const [changes, setChanges] = useState(0)
  if (prev !== key) { setPrev(key); setChanges(changes + 1) }
  return <span key={key} className={cx('inline-flex', changes > 0 && 'animate-swap-in', className)}>{children}</span>
}
