import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import type { BadgeKind, MenuData, MenuProduct, SizeTier } from '../../../data/types'
import { formatPrice, removeProduct, scopedAddOns, slugify } from '../../../lib/menuLogic'
import { cx } from '../../../lib/cx'
import { useLoadedMenu } from '../../../state/MenuContext'
import { Bilingual, Button, Card, ConfirmDialog, EmptyState, Field, IconBtn, Modal, NumberInput, Pill, PillPicker, SectionTitle, Select, TextInput, Toggle } from './ui'
import { ProductMultiPicker } from './pickers'

function uniqueId(base: string, taken: string[]): string {
  const root = base || 'new-item'
  if (!taken.includes(root)) return root
  let n = 2
  while (taken.includes(`${root}-${n}`)) n++
  return `${root}-${n}`
}

function blankProduct(categoryId: string): MenuProduct {
  return {
    id: '',
    categoryId,
    name: { en: '', ar: '' },
    desc: { en: '', ar: '' },
    price: 0,
    sizes: [],
    baristaWay: { enabled: false, addOns: [] },
    oftenOrderedWith: [],
    excludedAddOns: [],
    inStock: true,
  }
}

function SizeRows({ sizes, onChange }: { sizes: SizeTier[]; onChange: (next: SizeTier[]) => void }) {
  const patch = (index: number, change: Partial<SizeTier>) =>
    onChange(sizes.map((s, i) => (i === index ? { ...s, ...change } : s)))

  return (
    <div className="flex flex-col gap-3">
      {sizes.length === 0 && <p className="text-sm text-navy/55">One size only. Add tiers to let guests choose.</p>}
      {sizes.map((s, i) => (
        <div key={s.id} className="rounded-xl border border-navy/10 bg-white/70 p-3">
          <Bilingual label="Size name" value={s.name} onChange={(name) => patch(i, { name })} maxLength={20} />
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <Field label="Pricing" className="min-w-40 flex-1">
              {(id) => (
                <Select id={id} value={s.mode} onChange={(e) => patch(i, { mode: e.target.value as SizeTier['mode'] })}>
                  <option value="delta">Add to base price</option>
                  <option value="standalone">Full price for this size</option>
                </Select>
              )}
            </Field>
            <Field label={s.mode === 'delta' ? 'Extra cost' : 'Price'} className="w-36">
              {(id) => <NumberInput id={id} suffix="EGP" value={s.value} onChange={(value) => patch(i, { value })} />}
            </Field>
            <IconBtn label="Remove size" tone="danger" onClick={() => onChange(sizes.filter((_, x) => x !== i))}>
              <Trash2 className="size-4" />
            </IconBtn>
          </div>
        </div>
      ))}
      <Button
        size="sm"
        className="self-start"
        onClick={() =>
          onChange([...sizes, { id: `size-${Date.now().toString(36)}`, name: { en: '', ar: '' }, mode: 'delta', value: 0 }])
        }
      >
        <Plus className="size-4" aria-hidden="true" />
        Add size
      </Button>
    </div>
  )
}

function ProductEditor({
  initial,
  menu,
  onApply,
  onClose,
}: {
  initial: MenuProduct
  menu: MenuData
  onApply: (next: MenuProduct) => void
  onClose: () => void
}) {
  const isNew = initial.id === ''
  const [draft, setDraft] = useState(initial)
  const set = (patch: Partial<MenuProduct>) => setDraft((d) => ({ ...d, ...patch }))
  const category = menu.categories.find((c) => c.id === draft.categoryId)
  const applicable = scopedAddOns(menu.addOns, category?.kind ?? 'drink')
  const toggleIn = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  const lines = (s: string) => s.split('\n').length
  const descOk = lines(draft.desc.en) <= 2 && lines(draft.desc.ar) <= 2
  const valid = draft.name.en.trim() !== '' && descOk

  return (
    <Modal
      wide
      title={isNew ? 'New product' : `Edit ${initial.name.en}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!valid}
            onClick={() => {
              const id = isNew ? uniqueId(slugify(draft.name.en), menu.products.map((p) => p.id)) : draft.id
              onApply({ ...draft, id })
              onClose()
            }}
          >
            {isNew ? 'Add product' : 'Apply'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-8">
        <section aria-labelledby="p-basics" className="flex flex-col gap-4">
          <h3 id="p-basics" className="text-sm font-semibold text-navy">
            Basics
          </h3>
          <Field label="Category">
            {(id) => (
              <Select id={id} value={draft.categoryId} onChange={(e) => set({ categoryId: e.target.value, excludedAddOns: [] })}>
                {menu.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title.en}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Bilingual label="Name" value={draft.name} onChange={(name) => set({ name })} />
          <Bilingual
            label="Description"
            multiline
            maxLength={120}
            value={draft.desc}
            onChange={(desc) => set({ desc })}
          />
          {!descOk && <p className="text-xs text-red-700">Keep descriptions to two lines.</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              checked={draft.price === null}
              onChange={(on) => set({ price: on ? null : 0 })}
              label="Price on selection"
              description="The price is worked out after the guest chooses."
            />
            {draft.price !== null && (
              <Field label="Base price">
                {(id) => <NumberInput id={id} suffix="EGP" value={draft.price ?? 0} onChange={(price) => set({ price })} />}
              </Field>
            )}
          </div>
        </section>

        <section aria-labelledby="p-sizes" className="flex flex-col gap-3">
          <h3 id="p-sizes" className="text-sm font-semibold text-navy">
            Size tiers
          </h3>
          <SizeRows sizes={draft.sizes} onChange={(sizes) => set({ sizes })} />
        </section>

        <section aria-labelledby="p-custom" className="flex flex-col gap-4">
          <h3 id="p-custom" className="text-sm font-semibold text-navy">
            Customizations
          </h3>
          <Toggle
            checked={draft.baristaWay.enabled}
            onChange={(enabled) => set({ baristaWay: { ...draft.baristaWay, enabled } })}
            label="Barista's Way"
            description="Lets guests pick the barista's preset customizations in one tap."
          />
          {draft.baristaWay.enabled && (
            <Field label="Preset add-ons">
              {() => (
                <PillPicker
                  options={applicable.map((a) => ({ id: a.id, label: a.name.en, hint: `+${a.price}` }))}
                  selected={draft.baristaWay.addOns}
                  onToggle={(id) => set({ baristaWay: { ...draft.baristaWay, addOns: toggleIn(draft.baristaWay.addOns, id) } })}
                />
              )}
            </Field>
          )}
          <Field label="Add-ons offered" hint="Highlighted add-ons are available on this product. Tap one to turn it off.">
            {() => (
              <PillPicker
                options={applicable.map((a) => ({ id: a.id, label: a.name.en, hint: `+${a.price}` }))}
                selected={applicable.filter((a) => !draft.excludedAddOns.includes(a.id)).map((a) => a.id)}
                onToggle={(id) => set({ excludedAddOns: toggleIn(draft.excludedAddOns, id) })}
                emptyText="No add-ons match this category."
              />
            )}
          </Field>
          <Field label="Often ordered with">
            {() => (
              <ProductMultiPicker
                menu={menu}
                selected={draft.oftenOrderedWith}
                exclude={[draft.id]}
                onChange={(oftenOrderedWith) => set({ oftenOrderedWith })}
              />
            )}
          </Field>
        </section>

        <section aria-labelledby="p-avail" className="flex flex-col gap-3">
          <h3 id="p-avail" className="text-sm font-semibold text-navy">
            Availability
          </h3>
          <Toggle
            checked={draft.inStock}
            onChange={(inStock) => set({ inStock })}
            label="In stock"
            description="Turn off to mark this product as sold out on the menu."
          />
        </section>
      </div>
    </Modal>
  )
}

const BADGE_LABEL: Record<BadgeKind, string> = { new: 'New', top: 'Top Rated' }

export default function ProductsTab() {
  const { menu, update } = useLoadedMenu()
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [editing, setEditing] = useState<MenuProduct | null>(null)
  const [deleting, setDeleting] = useState<MenuProduct | null>(null)

  const q = query.trim().toLowerCase()
  const groups = useMemo(
    () =>
      menu.categories
        .filter((c) => categoryId === 'all' || c.id === categoryId)
        .map((c) => ({
          category: c,
          products: menu.products.filter(
            (p) =>
              p.categoryId === c.id &&
              (q === '' || p.name.en.toLowerCase().includes(q) || p.name.ar.includes(query.trim())),
          ),
        }))
        .filter((g) => g.products.length > 0),
    [menu.categories, menu.products, categoryId, q, query],
  )

  const save = (next: MenuProduct) =>
    update((m) => ({
      ...m,
      products: m.products.some((p) => p.id === next.id)
        ? m.products.map((p) => (p.id === next.id ? next : p))
        : [...m.products, next],
    }))

  return (
    <section>
      <SectionTitle
        title="Products"
        description="Edit prices, sizes, add-ons and availability. Use the stock switch for quick sell-outs."
        action={
          <Button variant="primary" onClick={() => setEditing(blankProduct(categoryId === 'all' ? menu.categories[0].id : categoryId))}>
            <Plus className="size-4" aria-hidden="true" />
            New product
          </Button>
        }
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-navy/45" />
          <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" aria-label="Search products" className="ps-9" />
        </div>
        <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="Filter by category" className="sm:w-56">
          <option value="all">All categories</option>
          {menu.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title.en}
            </option>
          ))}
        </Select>
      </div>

      {groups.length === 0 ? (
        <EmptyState>No products match your search.</EmptyState>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map(({ category, products }) => (
            <Card key={category.id} className="p-0 sm:p-0">
              <h3 className="border-b border-navy/10 px-4 py-3 text-sm font-semibold text-navy">
                {category.title.en} <span className="ms-1 font-normal text-navy/55">{products.length}</span>
              </h3>
              <ul className="divide-y divide-navy/10">
                {products.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className={cx('truncate text-sm font-medium', p.inStock ? 'text-navy' : 'text-navy/45 line-through')}>
                        {p.name.en}
                      </p>
                      <p className="truncate text-xs text-navy/55">{formatPrice(p.price)}</p>
                    </div>
                    {p.badge && <Pill tone="yellow">{BADGE_LABEL[p.badge]}</Pill>}
                    <label className="flex items-center gap-2 text-xs text-navy/65">
                      <span className="hidden sm:inline">{p.inStock ? 'In stock' : 'Sold out'}</span>
                      <input
                        type="checkbox"
                        role="switch"
                        aria-label={`${p.name.en} in stock`}
                        checked={p.inStock}
                        onChange={(e) =>
                          update((m) => ({ ...m, products: m.products.map((x) => (x.id === p.id ? { ...x, inStock: e.target.checked } : x)) }))
                        }
                        className="size-4 accent-yellow"
                      />
                    </label>
                    <IconBtn label={`Edit ${p.name.en}`} onClick={() => setEditing(p)}>
                      <Pencil className="size-4" />
                    </IconBtn>
                    <IconBtn label={`Delete ${p.name.en}`} tone="danger" onClick={() => setDeleting(p)}>
                      <Trash2 className="size-4" />
                    </IconBtn>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      {editing && <ProductEditor key={editing.id || 'new'} initial={editing} menu={menu} onClose={() => setEditing(null)} onApply={save} />}
      {deleting && (
        <ConfirmDialog
          title="Delete product"
          message={`Remove "${deleting.name.en}"? It will also be taken out of signatures, pairings and suggestions.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            update((m) => removeProduct(m, deleting.id))
            setDeleting(null)
          }}
        />
      )}
    </section>
  )
}
