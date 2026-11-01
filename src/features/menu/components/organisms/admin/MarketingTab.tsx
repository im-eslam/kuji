import { useMemo, useState } from 'react'
import { ImageOff, Search } from 'lucide-react'
import type { BadgeKind, PromoPopupConfig } from '../../../data/types'
import { BADGE_PRIORITY, sortByBadge } from '../../../lib/menuLogic'
import { cx } from '../../../lib/cx'
import { useLoadedMenu } from '../../../state/MenuContext'
import { Card, Field, NumberInput, Pill, SectionTitle, Select, TextInput, Toggle } from './ui'
import { previewImage } from './preview'

const BADGES: { value: BadgeKind | 'none'; label: string }[] = [
  { value: 'none', label: 'No badge' },
  { value: 'new', label: 'New' },
  { value: 'top', label: 'Top Rated' },
]

function Badges() {
  const { menu, update } = useLoadedMenu()
  const [categoryId, setCategoryId] = useState(menu.categories[0]?.id ?? '')
  const [query, setQuery] = useState('')

  const products = useMemo(
    () => sortByBadge(menu.products.filter((p) => p.categoryId === categoryId)),
    [menu.products, categoryId],
  )
  const q = query.trim().toLowerCase()
  const visible = q ? products.filter((p) => p.name.en.toLowerCase().includes(q)) : products

  const setBadge = (id: string, value: BadgeKind | 'none') =>
    update((m) => ({
      ...m,
      products: m.products.map((p) => {
        if (p.id !== id) return p
        if (value === 'none') {
          const next = { ...p }
          delete next.badge
          return next
        }
        return { ...p, badge: value }
      }),
    }))

  return (
    <Card>
      <SectionTitle
        title="Badges and sort order"
        description='Products tagged "New" move to the top of their category, then "Top Rated", then everything else.'
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="Category" className="sm:w-56">
          {menu.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title.en}
            </option>
          ))}
        </Select>
        <div className="relative flex-1">
          <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-navy/45" />
          <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search in this category" aria-label="Search in this category" className="ps-9" />
        </div>
      </div>
      <ul className="divide-y divide-navy/10 rounded-xl border border-navy/10">
        {visible.map((p, i) => (
          <li key={p.id} className="flex items-center gap-3 px-3 py-2.5">
            <span className="w-5 text-center text-xs tabular-nums text-navy/45">{i + 1}</span>
            <p className="min-w-0 flex-1 truncate text-sm text-navy">{p.name.en}</p>
            {BADGE_PRIORITY[p.badge ?? 'none'] < 2 && <Pill tone="yellow">Moved up</Pill>}
            <Select
              value={p.badge ?? 'none'}
              onChange={(e) => setBadge(p.id, e.target.value as BadgeKind | 'none')}
              aria-label={`Badge for ${p.name.en}`}
              className="w-36"
            >
              {BADGES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </Select>
          </li>
        ))}
        {visible.length === 0 && <li className="px-3 py-6 text-center text-sm text-navy/55">No products found.</li>}
      </ul>
    </Card>
  )
}

function PopupSettings() {
  const { menu, update } = useLoadedMenu()
  const popup = menu.popup
  const set = (patch: Partial<PromoPopupConfig>) => update((m) => ({ ...m, popup: { ...m.popup, ...patch } }))
  const src = previewImage(popup.image)

  return (
    <Card>
      <SectionTitle title="Promo popup" description="The announcement guests see shortly after opening the menu." />
      <div className="flex flex-col gap-5">
        <Toggle
          checked={popup.enabled}
          onChange={(enabled) => set({ enabled })}
          label="Show the popup"
          description="Switch off to hide it for everyone."
        />
        <div className={cx('flex flex-col gap-5', !popup.enabled && 'opacity-60')}>
          <div className="flex items-end gap-4">
            {src ? (
              <img src={src} alt="" className="size-20 shrink-0 rounded-xl bg-arctic/60 object-cover" />
            ) : (
              <span className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-arctic/60 text-navy/40">
                <ImageOff className="size-5" aria-hidden="true" />
              </span>
            )}
            <Field label="Image path" hint="A file path in the project or a full web link." className="flex-1">
              {(id) => <TextInput id={id} value={popup.image} onChange={(e) => set({ image: e.target.value })} />}
            </Field>
          </div>
          <Field label="Show after" hint="Seconds after the menu opens.">
            {(id) => <NumberInput id={id} suffix="sec" step={1} value={popup.delaySeconds} onChange={(delaySeconds) => set({ delaySeconds })} />}
          </Field>
        </div>
      </div>
    </Card>
  )
}

export default function MarketingTab() {
  return (
    <div className="flex flex-col gap-6">
      <Badges />
      <PopupSettings />
    </div>
  )
}
