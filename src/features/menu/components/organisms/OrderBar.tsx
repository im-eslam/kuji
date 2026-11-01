import { useEffect, useRef } from 'react'
import { bump } from '../../lib/motion'
import { useLang } from '../../state/LangContext'
import { useOrder } from '../../state/OrderContext'
import { useUI } from '../../state/UIContext'
import { cx } from '../../lib/cx'
import { Rolling } from '../atoms/Rolling'

export function OrderBar() {
  const { t, money } = useLang()
  const { count, subtotal, hasUnpriced } = useOrder()
  const { openOrder, overlay } = useUI()
  const live = { count, price: hasUnpriced ? `${money(subtotal)}+` : money(subtotal) }

  // While a sheet is open the bar is hidden behind it, so a change made in the sheet would play unseen. The bar holds
  // what it showed and catches up the moment the sheet is gone: that is when the count rolls and the bar pulses.
  const held = useRef(live)
  if (overlay.type === 'none') held.current = live
  const visible = held.current.count > 0

  // While it slides away after the last item is removed, keep showing the last values instead of "0".
  const last = useRef(held.current)
  if (visible) last.current = held.current
  const shown = last.current

  // Pulse when what the bar shows changes while it is already on screen. Arriving (first item) is the slide-in, not a pulse.
  const bar = useRef<HTMLButtonElement>(null)
  const dot = useRef<HTMLSpanElement>(null)
  const seen = useRef({ visible, count: shown.count, price: shown.price })
  useEffect(() => {
    const prev = seen.current
    seen.current = { visible, count: shown.count, price: shown.price }
    if (!prev.visible || !visible) return
    if (prev.count !== shown.count) { bump(dot.current, 1.22, 440); bump(bar.current, 1.035, 400) }
    else if (prev.price !== shown.price) bump(bar.current, 1.02, 340)
  }, [visible, shown.count, shown.price])

  return (
    <div
      className={cx(
        'pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center transition-[transform,opacity,visibility]',
        // In: 250ms easing out. Out: 200ms accelerating away.
        visible ? 'visible translate-y-0 opacity-100 duration-250 ease-(--ease-smooth)' : 'invisible translate-y-full opacity-0 duration-200 ease-(--ease-exit)',
      )}
    >
      <div className="w-full max-w-120 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          ref={bar}
          type="button"
          tabIndex={visible ? 0 : -1}
          aria-label={t('a11yViewOrder', { n: shown.count, price: shown.price })}
          onClick={openOrder}
          className="pointer-events-auto flex h-14 w-full items-center gap-3 rounded-full bg-navy px-3 text-white transition-transform duration-150 ease-out active:scale-[0.98]"
        >
          <span ref={dot} className="flex h-8 min-w-8 items-center justify-center rounded-full bg-yellow px-2 text-small font-bold text-navy">
            <Rolling text={String(shown.count)} />
          </span>
          <span className="flex-1 text-start text-body font-bold">{t('viewOrder')}</span>
          <span className="pe-2 text-body font-bold"><Rolling text={shown.price} /></span>
        </button>
      </div>
    </div>
  )
}
