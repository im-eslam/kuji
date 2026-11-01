import { useState } from 'react'
import { Search, X } from 'lucide-react'
import type { ItemId, MenuData } from '../../../data/types'
import { Select, TextInput } from './ui'

/** Dropdown of every product, grouped by category in menu order. */
export function ProductSelect({
  menu,
  value,
  onChange,
  exclude = [],
  placeholder = 'Choose a product',
  id,
}: {
  menu: MenuData
  value: ItemId | ''
  onChange: (id: ItemId) => void
  exclude?: ItemId[]
  placeholder?: string
  id?: string
}) {
  return (
    <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="" disabled>
        {placeholder}
      </option>
      {menu.categories.map((c) => {
        const products = menu.products.filter((p) => p.categoryId === c.id && (p.id === value || !exclude.includes(p.id)))
        if (products.length === 0) return null
        return (
          <optgroup key={c.id} label={c.title.en}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name.en}
              </option>
            ))}
          </optgroup>
        )
      })}
    </Select>
  )
}

/** Search box with removable chips, for picking a handful of products. */
export function ProductMultiPicker({
  menu,
  selected,
  onChange,
  exclude = [],
  max,
}: {
  menu: MenuData
  selected: ItemId[]
  onChange: (next: ItemId[]) => void
  exclude?: ItemId[]
  max?: number
}) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const full = max !== undefined && selected.length >= max
  const results =
    q === '' || full
      ? []
      : menu.products
          .filter(
            (p) =>
              !selected.includes(p.id) &&
              !exclude.includes(p.id) &&
              (p.name.en.toLowerCase().includes(q) || p.name.ar.includes(query.trim())),
          )
          .slice(0, 6)

  return (
    <div className="flex flex-col gap-2">
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {selected.map((id) => {
            const p = menu.products.find((x) => x.id === id)
            return (
              <li key={id} className="inline-flex items-center gap-1 rounded-full border border-yellow/60 bg-yellow/20 py-1 ps-3 pe-1 text-xs font-medium text-navy">
                {p?.name.en ?? id}
                <button
                  type="button"
                  aria-label={`Remove ${p?.name.en ?? id}`}
                  onClick={() => onChange(selected.filter((x) => x !== id))}
                  className="flex size-5 items-center justify-center rounded-full hover:bg-yellow/20"
                >
                  <X className="size-3" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-navy/45" />
        <TextInput
          value={query}
          disabled={full}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={full ? `Up to ${max} products` : 'Search products to add'}
          aria-label="Search products to add"
          className="ps-9"
        />
      </div>
      {results.length > 0 && (
        <ul className="overflow-hidden rounded-xl border border-navy/10 bg-white">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  onChange([...selected, p.id])
                  setQuery('')
                }}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-sm text-navy hover:bg-mist"
              >
                <span className="truncate">{p.name.en}</span>
                <span className="shrink-0 text-xs text-navy/55">
                  {menu.categories.find((c) => c.id === p.categoryId)?.title.en}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
