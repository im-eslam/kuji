import { useEffect, useRef, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { useSheet } from '../../state/SheetContext'

// The sheet's heading. It registers with the sheet, which fades its top bar (and the same title in it) in as this
// heading scrolls up and away, so the title seems to travel into the bar instead of switching on.
export function SheetTitle({ children, className }: { children: ReactNode; className?: string }) {
  const { registerTitle } = useSheet()
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    registerTitle(ref.current)
    return () => registerTitle(null)
  }, [registerTitle])
  return <h2 ref={ref} className={cx('text-title font-bold', className)}>{children}</h2>
}
