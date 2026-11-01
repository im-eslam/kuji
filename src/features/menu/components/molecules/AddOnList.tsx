import type { AddOn } from '../../data/types'
import { useLang } from '../../state/LangContext'
import { CheckboxRow } from '../atoms/CheckboxRow'

interface Props { addOns: AddOn[]; selected: string[]; onToggle: (id: string) => void }

export function AddOnList({ addOns, selected, onToggle }: Props) {
  const { t, pick } = useLang()
  return (
    <div role="group" aria-label={t('addOns')}>
      <h3 className="px-4 pb-2 text-body font-bold">{t('addOns')}</h3>
      {addOns.map((a) => (
        <CheckboxRow key={a.id} label={pick(a.name)} price={a.price} checked={selected.includes(a.id)} onToggle={() => onToggle(a.id)} />
      ))}
    </div>
  )
}
