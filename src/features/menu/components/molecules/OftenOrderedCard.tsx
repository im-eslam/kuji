import type { Item } from '../../data/types'
import { useLang } from '../../state/LangContext'
import { Badge } from '../atoms/Badge'
import { Img } from '../atoms/Image'
import { Rolling } from '../atoms/Rolling'
import { PlusButton } from '../atoms/PlusButton'
import { Price } from '../atoms/Price'

interface Props { item: Item; addedCount: number; done: boolean; onQuickAdd: (item: Item) => void }

// Not a button: only the plus is interactive.
export function OftenOrderedCard({ item, addedCount, done, onQuickAdd }: Props) {
  const { pick, t } = useLang()
  const name = pick(item.name)
  return (
    <div className="flex w-26 shrink-0 flex-col gap-1 rounded-md border border-arctic bg-white p-2">
      <div className="relative">
        <Img category={item.categoryId} className="h-16 w-full rounded-md" />
        {addedCount > 0 && (
          <span className="absolute bottom-1 start-1">
            <Badge kind="count" compact><Rolling text={t('quickAdded', { n: addedCount })} /></Badge>
          </span>
        )}
      </div>
      <span className="line-clamp-2 min-h-[2lh] text-caption font-medium">{name}</span>
      <div className="flex items-center justify-between">
        <Price value={item.price} size="caption" />
        <PlusButton small done={done} label={t('a11yQuickAdd', { title: name })} onClick={() => onQuickAdd(item)} />
      </div>
    </div>
  )
}
