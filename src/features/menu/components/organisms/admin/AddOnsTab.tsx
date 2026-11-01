import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { AddOn, AddOnScope } from '../../../data/types'
import { removeAddOn, resolveAddOns, slugify } from '../../../lib/menuLogic'
import { useLoadedMenu } from '../../../state/MenuContext'
import { Bilingual, Button, Card, ConfirmDialog, EmptyState, Field, IconBtn, Modal, NumberInput, Pill, SectionTitle, Select } from './ui'

const SCOPES: { id: AddOnScope; label: string; description: string }[] = [
  { id: 'drinks', label: 'Drinks only', description: 'Offered on every drink' },
  { id: 'bakery', label: 'Bakery only', description: 'Offered on cookies and desserts' },
  { id: 'all', label: 'Drinks and bakery', description: 'Offered everywhere' },
]

const BLANK: AddOn = { id: '', name: { en: '', ar: '' }, price: 0, scope: 'drinks' }

function AddOnEditor({
  initial,
  existingIds,
  onApply,
  onClose,
}: {
  initial: AddOn
  existingIds: string[]
  onApply: (next: AddOn) => void
  onClose: () => void
}) {
  const isNew = initial.id === ''
  const [draft, setDraft] = useState(initial)
  const id = isNew ? slugify(draft.name.en) : draft.id
  const duplicate = isNew && existingIds.includes(id)
  const valid = draft.name.en.trim() !== '' && id !== '' && !duplicate

  return (
    <Modal
      title={isNew ? 'New add-on' : 'Edit add-on'}
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
              onApply({ ...draft, id })
              onClose()
            }}
          >
            {isNew ? 'Add' : 'Apply'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Bilingual label="Name" value={draft.name} onChange={(name) => setDraft((d) => ({ ...d, name }))} />
        {duplicate && <p className="text-xs text-red-700">An add-on with this name already exists.</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Price">
            {(fid) => <NumberInput id={fid} suffix="EGP" value={draft.price} onChange={(price) => setDraft((d) => ({ ...d, price }))} />}
          </Field>
          <Field label="Where it applies" hint={SCOPES.find((s) => s.id === draft.scope)?.description}>
            {(fid) => (
              <Select id={fid} value={draft.scope} onChange={(e) => setDraft((d) => ({ ...d, scope: e.target.value as AddOnScope }))}>
                {SCOPES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </div>
    </Modal>
  )
}

export default function AddOnsTab() {
  const { menu, update } = useLoadedMenu()
  const [editing, setEditing] = useState<AddOn | null>(null)
  const [deleting, setDeleting] = useState<AddOn | null>(null)

  const kindOf = (categoryId: string) => menu.categories.find((c) => c.id === categoryId)?.kind ?? 'drink'
  const usage = (addOn: AddOn) =>
    menu.products.filter((p) => resolveAddOns(p, kindOf(p.categoryId), [addOn]).length > 0).length

  return (
    <section>
      <SectionTitle
        title="Add-on library"
        description="Add-ons are applied automatically to every product that matches their scope. Switch one off for a specific product from the Products tab."
        action={
          <Button variant="primary" onClick={() => setEditing(BLANK)}>
            <Plus className="size-4" aria-hidden="true" />
            New add-on
          </Button>
        }
      />
      <div className="flex flex-col gap-6">
        {SCOPES.map((scope) => {
          const list = menu.addOns.filter((a) => a.scope === scope.id)
          return (
            <Card key={scope.id}>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-semibold text-navy">{scope.label}</h3>
                <span className="text-xs text-navy/55">{scope.description}</span>
              </div>
              {list.length === 0 ? (
                <EmptyState>No add-ons here yet.</EmptyState>
              ) : (
                <ul className="divide-y divide-navy/10">
                  {list.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-navy">{a.name.en}</p>
                        <p className="truncate text-xs text-navy/55" dir="rtl" lang="ar">
                          {a.name.ar}
                        </p>
                      </div>
                      <span className="hidden text-xs text-navy/55 sm:block">{usage(a)} products</span>
                      <Pill tone="yellow">+{a.price} EGP</Pill>
                      <IconBtn label={`Edit ${a.name.en}`} onClick={() => setEditing(a)}>
                        <Pencil className="size-4" />
                      </IconBtn>
                      <IconBtn label={`Delete ${a.name.en}`} tone="danger" onClick={() => setDeleting(a)}>
                        <Trash2 className="size-4" />
                      </IconBtn>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )
        })}
      </div>

      {editing && (
        <AddOnEditor
          key={editing.id || 'new'}
          initial={editing}
          existingIds={menu.addOns.map((a) => a.id)}
          onClose={() => setEditing(null)}
          onApply={(next) =>
            update((m) => ({
              ...m,
              addOns: m.addOns.some((a) => a.id === next.id)
                ? m.addOns.map((a) => (a.id === next.id ? next : a))
                : [...m.addOns, next],
            }))
          }
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete add-on"
          message={`Remove "${deleting.name.en}" from the library? It will disappear from every product.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            update((m) => removeAddOn(m, deleting.id))
            setDeleting(null)
          }}
        />
      )}
    </section>
  )
}
