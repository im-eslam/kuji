import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { MenuPairing } from '../../../data/types'
import { discountPercent, regularPrice } from '../../../lib/menuLogic'
import { useLoadedMenu } from '../../../state/MenuContext'
import { Button, Card, EmptyState, Field, IconBtn, NumberInput, Pill, SectionTitle, SortableList, Toggle } from './ui'
import { ProductSelect } from './pickers'

function Signatures() {
  const { menu, update } = useLoadedMenu()
  const [adding, setAdding] = useState<string>('')

  return (
    <Card>
      <SectionTitle
        title="Signatures"
        description="The featured carousel at the top of the menu. Drag to set the order guests see."
      />
      {menu.signatures.length === 0 ? (
        <EmptyState>No signature items yet.</EmptyState>
      ) : (
        <SortableList
          label="Signature items"
          items={menu.signatures}
          getKey={(id) => id}
          onReorder={(signatures) => update((m) => ({ ...m, signatures }))}
          renderItem={(id) => {
            const p = menu.products.find((x) => x.id === id)
            return (
              <div className="flex items-center gap-3 p-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">{p?.name.en ?? id}</p>
                  <p className="truncate text-xs text-navy/55">
                    {menu.categories.find((c) => c.id === p?.categoryId)?.title.en}
                  </p>
                </div>
                <IconBtn
                  label={`Remove ${p?.name.en ?? id}`}
                  tone="danger"
                  onClick={() => update((m) => ({ ...m, signatures: m.signatures.filter((x) => x !== id) }))}
                >
                  <Trash2 className="size-4" />
                </IconBtn>
              </div>
            )
          }}
        />
      )}
      <div className="mt-4 flex items-end gap-2">
        <Field label="Add a signature" className="flex-1">
          {(id) => (
            <ProductSelect id={id} menu={menu} value={adding} exclude={menu.signatures} onChange={setAdding} />
          )}
        </Field>
        <Button
          variant="primary"
          disabled={!adding}
          onClick={() => {
            update((m) => ({ ...m, signatures: [...m.signatures, adding] }))
            setAdding('')
          }}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add
        </Button>
      </div>
    </Card>
  )
}

function PairingRow({ pairing }: { pairing: MenuPairing }) {
  const { menu, update } = useLoadedMenu()
  const patch = (change: Partial<MenuPairing>) =>
    update((m) => ({ ...m, pairings: m.pairings.map((p) => (p.id === pairing.id ? { ...p, ...change } : p)) }))
  const regular = regularPrice(pairing, menu.products)
  const pct = discountPercent(pairing, menu.products)

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1].map((slot) => (
          <Field key={slot} label={slot === 0 ? 'First item' : 'Second item'}>
            {(id) => (
              <ProductSelect
                id={id}
                menu={menu}
                value={pairing.items[slot]}
                onChange={(value) => {
                  const items: MenuPairing['items'] = [...pairing.items]
                  items[slot] = value
                  patch({ items })
                }}
              />
            )}
          </Field>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-48 flex-1">
          <Toggle
            checked={pairing.bundlePrice !== null}
            onChange={(on) => patch({ bundlePrice: on ? Math.max(0, regular - 5) : null })}
            label="Bundle price"
            description={`Regular total ${regular} EGP`}
          />
        </div>
        {pairing.bundlePrice !== null && (
          <Field label="Pair price" className="w-36">
            {(id) => (
              <NumberInput id={id} suffix="EGP" value={pairing.bundlePrice ?? 0} onChange={(bundlePrice) => patch({ bundlePrice })} />
            )}
          </Field>
        )}
        <div className="flex h-10 items-center">
          {pct > 0 ? <Pill tone="yellow">Save {pct}%</Pill> : <Pill>No savings chip</Pill>}
        </div>
        <IconBtn
          label="Remove pairing"
          tone="danger"
          onClick={() => update((m) => ({ ...m, pairings: m.pairings.filter((p) => p.id !== pairing.id) }))}
        >
          <Trash2 className="size-4" />
        </IconBtn>
      </div>
    </div>
  )
}

function Pairings() {
  const { menu, update } = useLoadedMenu()

  const addPairing = () => {
    const [a, b] = menu.products
    if (!a || !b) return
    update((m) => ({
      ...m,
      pairings: [...m.pairings, { id: `pair-${Date.now().toString(36)}`, items: [a.id, b.id], bundlePrice: null }],
    }))
  }

  return (
    <Card>
      <SectionTitle
        title="Perfect Pairings"
        description="Two-item combinations. The savings chip is worked out for you from the bundle price."
        action={
          <Button variant="primary" onClick={addPairing}>
            <Plus className="size-4" aria-hidden="true" />
            New pairing
          </Button>
        }
      />
      {menu.pairings.length === 0 ? (
        <EmptyState>No pairings yet.</EmptyState>
      ) : (
        <SortableList
          label="Pairings"
          items={menu.pairings}
          getKey={(p) => p.id}
          onReorder={(pairings) => update((m) => ({ ...m, pairings }))}
          renderItem={(p) => <PairingRow pairing={p} />}
        />
      )}
    </Card>
  )
}

export default function CurationTab() {
  return (
    <div className="flex flex-col gap-6">
      <Signatures />
      <Pairings />
    </div>
  )
}
