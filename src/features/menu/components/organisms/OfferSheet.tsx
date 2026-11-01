import { useState } from 'react'
import { getItem, getOffer } from '../../lib/catalog'
import { useOptions } from '../../hooks/useOptions'
import { LINE_QTY_MAX, SHEET_QTY_MAX, defaultPart, makeLine, offerIsDiscounted, offerSavings, offerUnit } from '../../lib/pricing'
import { useLang } from '../../state/LangContext'
import { useOrder } from '../../state/OrderContext'
import { useUI } from '../../state/UIContext'
import { Chip } from '../atoms/Chip'
import { Img } from '../atoms/Image'
import { AddToOrderBar } from '../molecules/AddToOrderBar'
import { OptionBlock } from '../molecules/OptionBlock'
import { SheetTitle } from '../molecules/SheetTitle'
import { BottomSheet } from './BottomSheet'

interface Props { offerId: string; editKey?: string; instant?: boolean }

export function OfferSheet({ offerId, editKey, instant }: Props) {
  const { pick, t, money } = useLang()
  const order = useOrder()
  const ui = useUI()
  const offer = getOffer(offerId)!
  const [a, b] = offer.items.map((id) => getItem(id)!)
  const editing = editKey ? order.lines.find((l) => l.key === editKey) : undefined
  const optsA = useOptions(a.profile, editing && { sizeId: editing.parts[0].sizeId, addOnIds: editing.parts[0].addOnIds })
  const optsB = useOptions(b.profile, editing && { sizeId: editing.parts[1].sizeId, addOnIds: editing.parts[1].addOnIds })
  const [qty, setQty] = useState(editing?.qty ?? 1)

  const parts = [a, b].map((item, i) => {
    const o = i === 0 ? optsA : optsB
    return { ...defaultPart(item), sizeId: o.showSize ? o.sizeId : undefined, addOnIds: o.addOnIds }
  })
  const unit = offerUnit(offer, parts)
  const discounted = offerIsDiscounted(offer)
  const title = `${pick(a.name)} + ${pick(b.name)}`
  const label = editing ? t('updateOrder') : t('addToOrder')

  const submit = () => {
    const line = makeLine('bundle', offer.id, parts, qty)
    if (editing) {
      order.updateLine(editing.key, line)
      ui.announce(t('a11yOrderUpdated'))
      ui.swapToOrder(line.key)
    } else {
      order.add(line)
      ui.announce(t('a11yAdded', { title }))
      ui.close()
    }
  }

  return (
    <BottomSheet
      label={title}
      onClose={editing ? () => ui.swapToOrder(editing.key) : ui.close}
      instant={instant}
      closeAt="media"
      footer={
        <AddToOrderBar
          title={title}
          qty={qty}
          max={editing ? LINE_QTY_MAX : SHEET_QTY_MAX}
          onQty={setQty}
          label={label}
          total={unit * qty}
          onSubmit={submit}
        />
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex gap-2 px-4">
          <Img category={a.categoryId} alt={pick(a.name)} className="aspect-square flex-1 rounded-lg" />
          <Img category={b.categoryId} alt={pick(b.name)} className="aspect-square flex-1 rounded-lg" />
        </div>
        <div className="flex flex-col gap-2 px-4">
          {discounted && <div><Chip kind="savings">{t('offerSaveChip', { price: money(offerSavings(offer)) })}</Chip></div>}
          <SheetTitle>{title}</SheetTitle>
        </div>
        <OptionBlock item={a} opts={optsA} withProductRow />
        <OptionBlock item={b} opts={optsB} withProductRow />
      </div>
    </BottomSheet>
  )
}
