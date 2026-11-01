import { useCatalog } from '../../lib/catalog'
import { useLang } from '../../state/LangContext'
import { useUI } from '../../state/UIContext'
import { CategoryRow } from '../molecules/CategoryRow'
import { SheetTitle } from '../molecules/SheetTitle'
import { BottomSheet } from './BottomSheet'

export function CategorySheet({ activeId, onPick }: { activeId: string; onPick: (id: string) => void }) {
  const { t, pick } = useLang()
  const { close } = useUI()
  const { sections } = useCatalog()
  return (
    <BottomSheet label={t('categoriesTitle')} onClose={close}>
      <div className="flex min-h-12 items-center ps-4 pe-14">
        <SheetTitle>{t('categoriesTitle')}</SheetTitle>
      </div>
      <div className="flex flex-col gap-1 px-4 pt-4">
        {sections.map((s) => (
          <CategoryRow
            key={s.id}
            name={pick(s.pill)}
            count={s.itemIds.length}
            active={s.id === activeId}
            onClick={() => { close(); window.setTimeout(() => onPick(s.id), 0) }}
          />
        ))}
      </div>
    </BottomSheet>
  )
}
