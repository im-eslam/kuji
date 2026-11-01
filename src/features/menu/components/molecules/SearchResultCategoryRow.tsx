import type { Section } from '../../data/types'
import { useLang } from '../../state/LangContext'
import { Hairline } from '../atoms/Hairline'

export function SearchResultCategoryRow({ section, onChoose }: { section: Section; onChoose: (id: string) => void }) {
  const { pick } = useLang()
  return (
    <div>
      <button type="button" onClick={() => onChoose(section.id)} className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-start active:bg-mist">
        <span className="text-body font-medium">{pick(section.pill)}</span>
        <span className="text-caption font-medium text-navy-65">{section.itemIds.length}</span>
      </button>
      <Hairline />
    </div>
  )
}
