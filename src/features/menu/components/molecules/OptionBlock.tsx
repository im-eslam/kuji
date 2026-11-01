import type { Item } from '../../data/types'
import type { OptionsState } from '../../hooks/useOptions'
import { useLang } from '../../state/LangContext'
import { Img } from '../atoms/Image'
import { AddOnList } from './AddOnList'
import { BaristaWayToggle } from './BaristaWayToggle'
import { SizePicker } from './SizePicker'

interface Props { item: Item; opts: OptionsState; withProductRow?: boolean }

// Only the molecules this product's profile allows, in the order people decide: size, then the Barista's Way, then add-ons. Returns nothing when the profile has no options.
export function OptionBlock({ item, opts, withProductRow }: Props) {
  const { pick } = useLang()
  if (!opts.showBarista && !opts.showSize && !opts.showAddOns) return null
  return (
    <section aria-label={pick(item.name)} className="flex flex-col gap-4">
      {withProductRow && (
        <div className="flex items-center gap-3 px-4">
          <Img category={item.categoryId} className="h-12 w-12 shrink-0 rounded-md" />
          <h3 className="text-body font-semibold">{pick(item.name)}</h3>
        </div>
      )}
      {opts.showSize && <SizePicker sizes={opts.sizes} value={opts.sizeId} onChange={opts.setSizeId} />}
      {/* The Barista's Way is a preset of add-ons, so it sits right above them. */}
      {opts.showBarista && (
        <div className="px-4"><BaristaWayToggle on={opts.baristaOn} onToggle={opts.toggleBarista} profile={item.profile} /></div>
      )}
      {opts.showAddOns && <AddOnList addOns={opts.addOns} selected={opts.addOnIds} onToggle={opts.toggleAddOn} />}
    </section>
  )
}
