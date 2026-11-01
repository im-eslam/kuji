import { useState } from 'react'
import { getCatalog, getItem } from '../../lib/catalog'
import type { Item } from '../../data/types'
import { useOptions } from '../../hooks/useOptions'
import { LINE_QTY_MAX, SHEET_QTY_MAX, defaultPart, itemUnit, makeLine } from '../../lib/pricing'
import { useLang } from '../../state/LangContext'
import { useOrder } from '../../state/OrderContext'
import { useUI } from '../../state/UIContext'
import { Badge } from '../atoms/Badge'
import { Img } from '../atoms/Image'
import { Price } from '../atoms/Price'
import { AddToOrderBar } from '../molecules/AddToOrderBar'
import { OftenOrderedCard } from '../molecules/OftenOrderedCard'
import { OptionBlock } from '../molecules/OptionBlock'
import { SheetTitle } from '../molecules/SheetTitle'
import { BottomSheet } from './BottomSheet'

interface Props { itemId: string; editKey?: string; instant?: boolean }

export function ItemSheet({ itemId, editKey, instant }: Props) {
  const { pick, t } = useLang()
  const order = useOrder()
  const ui = useUI()
  const item = getItem(itemId)!
  const editing = editKey ? order.lines.find((l) => l.key === editKey) : undefined
  const initial = editing?.parts[0]
  const opts = useOptions(item.profile, initial && { sizeId: initial.sizeId, addOnIds: initial.addOnIds })
  const [qty, setQty] = useState(editing?.qty ?? 1)
  const [added, setAdded] = useState<Record<string, number>>({})
  const [flash, setFlash] = useState<string | null>(null)

  const part = { ...defaultPart(item), sizeId: opts.showSize ? opts.sizeId : undefined, addOnIds: opts.addOnIds }
  const unit = itemUnit(part)
  const total = unit === null ? null : unit * qty
  const name = pick(item.name)

  const submit = () => {
    const line = makeLine('item', item.id, [part], qty)
    if (editing) {
      order.updateLine(editing.key, line)
      ui.announce(t('a11yOrderUpdated'))
      ui.swapToOrder(line.key)
    } else {
      order.add(line)
      ui.announce(t('a11yAdded', { title: name }))
      ui.close()
    }
  }

  const quickAdd = (o: Item) => {
    order.add(makeLine('item', o.id, [defaultPart(o)], 1))
    setAdded((a) => ({ ...a, [o.id]: (a[o.id] ?? 0) + 1 }))
    setFlash(o.id)
    window.setTimeout(() => setFlash((f) => (f === o.id ? null : f)), 1200)
    ui.announce(t('a11yAdded', { title: pick(o.name) }))
  }

  const label = editing ? t('updateOrder') : t('addToOrder')
  return (
    <BottomSheet
      label={name}
      onClose={editing ? () => ui.swapToOrder(editing.key) : ui.close}
      instant={instant}
      closeAt="media"
      footer={
        <AddToOrderBar
          title={name}
          qty={qty}
          max={editing ? LINE_QTY_MAX : SHEET_QTY_MAX}
          onQty={setQty}
          label={label}
          total={total}
          onSubmit={submit}
        />
      }
    >
      <div className="flex flex-col gap-6">
        <div className="px-4"><Img category={item.categoryId} alt={name} className="aspect-4/3 w-full rounded-lg" /></div>
        <div className="flex flex-col gap-2 px-4">
          {item.badge && <div><Badge kind={item.badge} /></div>}
          <SheetTitle>{name}</SheetTitle>
          <p className="text-small font-medium text-navy-65">{pick(item.desc)}</p>
          {/* The button carries the price. Only a price set on selection has nowhere else to be said. */}
          {total === null && <Price value={null} size="small" className="text-navy-65" />}
        </div>
        <OptionBlock item={item} opts={opts} />
        {!editing && (
          <section aria-label={t('oftenOrdered')} className="flex flex-col gap-2">
            <h3 className="px-4 text-body font-bold">{t('oftenOrdered')}</h3>
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
              {(getCatalog().oftenOrdered[item.id] ?? []).filter((id) => id !== item.id).map((id) => (
                <OftenOrderedCard key={id} item={getItem(id)!} addedCount={added[id] ?? 0} done={flash === id} onQuickAdd={quickAdd} />
              ))}
            </div>
          </section>
        )}
      </div>
    </BottomSheet>
  )
}
