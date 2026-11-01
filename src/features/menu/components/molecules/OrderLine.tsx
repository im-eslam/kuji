import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { OrderLine as Line } from '../../data/types'
import { useLang } from '../../state/LangContext'
import { cx } from '../../lib/cx'
import { Chevron } from '../atoms/Chevron'
import { Hairline } from '../atoms/Hairline'
import { Price } from '../atoms/Price'
import { Stepper } from '../atoms/Stepper'
import { lineUnit, lineWas } from '../../lib/pricing'

interface FrameProps {
  line: Line
  title: string
  thumb: ReactNode
  /** Size and add-on chips. Null when the product has none, and the row is then only as tall as its photo. */
  details: ReactNode
  onEdit: (line: Line) => void
  onSetQty: (line: Line, qty: number) => void
  onRemove: (line: Line) => void
}

// The row's height closes over this long; the fade is shorter, so the text is gone before the rows below slide up.
const REMOVE_MS = 220

// A 64px photo on the start side and one column beside it. The column is title (+ chips when there are any), then
// a footer: this line's total on the start, the stepper on the end. With no chips the title and the footer add up to
// exactly the photo's height, so a cookie is a short row; chips just make the column, and the row, taller.
// Photo, title and chips are one edit button; the stepper is a separate control.
export function OrderLineFrame({ line, title, thumb, details, onEdit, onSetQty, onRemove }: FrameProps) {
  const { t } = useLang()
  const unit = lineUnit(line)
  const was = lineWas(line)
  // The row shows what this line costs now (unit x quantity), so the sum of the rows is the subtotal.
  const total = unit === null ? null : unit * line.qty
  const wasTotal = was === null ? null : was * line.qty
  const [leaving, setLeaving] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  // Collapse and fade the row first, then actually remove it, so the rows below glide up instead of jumping.
  const remove = () => {
    if (leaving) return
    setLeaving(true)
    timer.current = window.setTimeout(() => onRemove(line), REMOVE_MS)
  }

  return (
    <div
      style={{ transitionDuration: `${REMOVE_MS}ms, 140ms` }}
      className={cx(
        // Fade first, collapse right behind it, so the rows below glide up instead of jumping.
        'grid transition-[grid-template-rows,opacity] ease-(--ease-smooth)',
        leaving ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100',
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <Hairline />
        <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-3 gap-y-1 px-4 py-3">
          {/* Same action as the edit button, for a finger that lands on the photo. The button is the keyboard and screen reader path. */}
          <div aria-hidden="true" onClick={() => onEdit(line)} className="row-span-2 cursor-pointer self-start">{thumb}</div>
          <button
            type="button"
            data-line-key={line.key}
            aria-label={t('a11yEdit', { title })}
            onClick={() => onEdit(line)}
            className="flex min-w-0 flex-col gap-1 rounded-md text-start transition-colors duration-150 active:bg-mist"
          >
            <span className="flex items-start justify-between gap-2">
              <span className="text-body font-semibold">{title}</span>
              <Chevron small />
            </span>
            {details}
          </button>
          <div className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
              {total === null ? <Price value={null} size="caption" /> : <Price value={total} size="body" rolling />}
              {wasTotal !== null && <Price value={wasTotal} size="caption" struck />}
            </span>
            <Stepper size="sm" value={line.qty} min={1} max={99} title={title} onChange={(q) => onSetQty(line, q)} onRemove={remove} />
          </div>
        </div>
      </div>
    </div>
  )
}
