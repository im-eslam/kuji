import { useLang } from '../../state/LangContext'
import { getItem } from '../../lib/catalog'
import { getAddOn, showSizeBlock } from '../../lib/options'
import type { OrderLine as Line } from '../../data/types'
import { Chip } from '../atoms/Chip'
import { Img } from '../atoms/Image'
import { OrderLineFrame } from './OrderLine'

interface Props {
  line: Line
  onEdit: (line: Line) => void
  onSetQty: (line: Line, qty: number) => void
  onRemove: (line: Line) => void
}

export function OrderLineItem({ line, ...handlers }: Props) {
  const { pick } = useLang()
  const part = line.parts[0]
  const item = getItem(part.itemId)!
  const size = part.sizeId && showSizeBlock(item.profile) ? item.profile.sizeDefs?.find((s) => s.id === part.sizeId) : undefined
  const chips = [...(size ? [size.name] : []), ...part.addOnIds.flatMap((id) => { const a = getAddOn(id); return a ? [a.name] : [] })]
  return (
    <OrderLineFrame
      line={line}
      title={pick(item.name)}
      thumb={<Img category={item.categoryId} className="h-16 w-16 shrink-0 rounded-md" />}
      details={chips.length > 0 ? <span className="flex flex-wrap gap-1">{chips.map((c, i) => <Chip key={i} compact>{pick(c)}</Chip>)}</span> : null}
      {...handlers}
    />
  )
}
