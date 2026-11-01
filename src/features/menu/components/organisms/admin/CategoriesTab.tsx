import { useState } from 'react'
import { ImageOff, Pencil } from 'lucide-react'
import type { MenuCategory } from '../../../data/types'
import { useLoadedMenu } from '../../../state/MenuContext'
import { Bilingual, Button, Field, IconBtn, Modal, Pill, SectionTitle, SortableList, TextInput } from './ui'
import { previewImage } from './preview'

function Thumb({ src, alt }: { src?: string; alt: string }) {
  return src ? (
    <img src={src} alt={alt} className="size-14 shrink-0 rounded-xl bg-arctic/60 object-cover" />
  ) : (
    <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-arctic/60 text-navy/40">
      <ImageOff className="size-5" aria-hidden="true" />
    </span>
  )
}

function CategoryEditor({
  category,
  onApply,
  onClose,
}: {
  category: MenuCategory
  onApply: (next: MenuCategory) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(category)
  const set = (patch: Partial<MenuCategory>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <Modal
      wide
      title="Edit category"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onApply(draft)
              onClose()
            }}
          >
            Apply
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Bilingual label="Pill label" value={draft.pill} onChange={(pill) => set({ pill })} maxLength={24} />
        <Bilingual label="Title" value={draft.title} onChange={(title) => set({ title })} />
        <Bilingual label="Subtitle" value={draft.sub} onChange={(sub) => set({ sub })} />
        <div className="flex items-end gap-4">
          <Thumb src={previewImage(draft.image)} alt="" />
          <Field label="Image path" hint="A file path in the project or a full web link." className="flex-1">
            {(id) => <TextInput id={id} value={draft.image} onChange={(e) => set({ image: e.target.value })} />}
          </Field>
        </div>
      </div>
    </Modal>
  )
}

export default function CategoriesTab() {
  const { menu, update } = useLoadedMenu()
  const [editingId, setEditingId] = useState<string | null>(null)
  const editing = menu.categories.find((c) => c.id === editingId)

  return (
    <section>
      <SectionTitle
        title="Categories"
        description="The order here is the order of the pills at the top of the menu. Drag a row or use the arrows to change it."
      />
      <SortableList
        label="Categories"
        items={menu.categories}
        getKey={(c) => c.id}
        onReorder={(categories) => update((m) => ({ ...m, categories }))}
        renderItem={(c, index) => (
          <div className="flex items-center gap-3 p-2.5">
            <span className="w-5 shrink-0 text-center text-xs tabular-nums text-navy/45">{index + 1}</span>
            <Thumb src={previewImage(c.image)} alt="" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-navy">{c.title.en}</p>
              <p className="truncate text-xs text-navy/55" dir="rtl" lang="ar">
                {c.title.ar}
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <Pill>{c.kind === 'drink' ? 'Drinks' : 'Bakery'}</Pill>
            </div>
            <IconBtn label={`Edit ${c.title.en}`} onClick={() => setEditingId(c.id)}>
              <Pencil className="size-4" />
            </IconBtn>
          </div>
        )}
      />
      {editing && (
        <CategoryEditor
          key={editing.id}
          category={editing}
          onClose={() => setEditingId(null)}
          onApply={(next) =>
            update((m) => ({ ...m, categories: m.categories.map((c) => (c.id === next.id ? next : c)) }))
          }
        />
      )}
    </section>
  )
}
