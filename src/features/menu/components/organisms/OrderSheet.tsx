import { useEffect, useRef, useState } from 'react'
import { BRAND } from '../../data/strings'
import type { OrderLine } from '../../data/types'
import { useLang } from '../../state/LangContext'
import { useOrder } from '../../state/OrderContext'
import { useUI } from '../../state/UIContext'
import { PrimaryButton } from '../atoms/PrimaryButton'
import { Price } from '../atoms/Price'
import { Rolling } from '../atoms/Rolling'
import { SecondaryButton } from '../atoms/SecondaryButton'
import { ClearConfirmation } from '../molecules/ClearConfirmation'
import { OrderLineBundle } from '../molecules/OrderLineBundle'
import { OrderLineItem } from '../molecules/OrderLineItem'
import { SheetTitle } from '../molecules/SheetTitle'
import { BottomSheet } from './BottomSheet'

export function OrderSheet({ instant }: { instant?: boolean }) {
  const { t } = useLang()
  const order = useOrder()
  const ui = useUI()
  const [confirming, setConfirming] = useState(false)
  const clearWrap = useRef<HTMLDivElement>(null)
  const { focusLineKey, clearFocusLine } = ui

  useEffect(() => {
    if (!focusLineKey) return
    const id = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-line-key="${CSS.escape(focusLineKey)}"]`)?.focus()
      clearFocusLine()
    })
    return () => window.cancelAnimationFrame(id)
  }, [focusLineKey, clearFocusLine])

  const edit = (l: OrderLine) => ui.editLine(l.kind, l.refId, l.key)
  const setQty = (l: OrderLine, q: number) => order.setQty(l.key, q)
  const remove = (l: OrderLine) => order.remove(l.key)
  const empty = order.lines.length === 0
  const countLabel = order.count === 1 ? t('itemsCountOne') : t('itemsCount', { n: order.count })

  // The footer keeps one fixed layout. The confirmation is laid over it (same spot, bottom-anchored) so
  // asking "Clear your whole order?" never changes the footer's height and nothing above it moves.
  const footer = empty ? undefined : (
    <div className="relative">
      <div
        aria-hidden={confirming}
        {...(confirming ? ({ inert: '' } as object) : {})}
        className={`flex flex-col gap-3 transition-opacity duration-200 ${confirming ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="flex items-baseline justify-between">
          <span className="text-body font-bold">{t('subtotal')}</span>
          <Price value={order.subtotal} size="heading" rolling />
        </div>
        {order.hasUnpriced && <p className="text-caption font-medium text-navy-65">{t('unpricedNote')}</p>}
        <div ref={clearWrap} className="flex flex-col">
          <SecondaryButton onClick={() => setConfirming(true)}>{t('clearOrder')}</SecondaryButton>
        </div>
      </div>
      {confirming && (
        <div className="absolute inset-x-0 bottom-0 z-10 bg-white">
          <ClearConfirmation
            onKeep={() => {
              setConfirming(false)
              // Put focus back on the button that opened the confirmation.
              window.requestAnimationFrame(() => clearWrap.current?.querySelector('button')?.focus())
            }}
            onClear={() => { order.clear(); setConfirming(false); ui.announce(t('emptyOrder')) }}
          />
        </div>
      )}
    </div>
  )

  return (
    <BottomSheet label={t('yourOrder')} onClose={ui.close} instant={instant} footer={footer}>
      <div className="flex min-h-12 items-center ps-4 pe-14">
        <div>
          <SheetTitle>{t('yourOrder')}</SheetTitle>
          {!empty && <p aria-live="polite" className="text-caption font-medium text-navy-65"><Rolling text={countLabel} /></p>}
        </div>
      </div>
      {empty ? (
        <div className="flex flex-col items-center gap-4 px-4 py-8 text-center">
          <p className="text-heading font-bold">{t('emptyOrder')}</p>
          <p className="text-small font-medium text-navy-65">{BRAND.emptyLine}</p>
          <PrimaryButton onClick={ui.close} short className="w-auto px-6">{t('browseMenu')}</PrimaryButton>
        </div>
      ) : (
        <div className="pt-4">
          {order.lines.map((l) =>
            l.kind === 'item'
              ? <OrderLineItem key={l.key} line={l} onEdit={edit} onSetQty={setQty} onRemove={remove} />
              : <OrderLineBundle key={l.key} line={l} onEdit={edit} onSetQty={setQty} onRemove={remove} />,
          )}
        </div>
      )}
    </BottomSheet>
  )
}
