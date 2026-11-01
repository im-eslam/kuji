import type { Size } from '../../data/types'
import { useLang } from '../../state/LangContext'
import { SegmentedControl } from '../atoms/SegmentedControl'

interface Props { sizes: Size[]; value: string | undefined; onChange: (id: string) => void }

export function SizePicker({ sizes, value, onChange }: Props) {
  const { t, pick, money } = useLang()
  return (
    <div className="flex flex-col gap-2 px-4">
      <span className="text-body font-bold">{t('size')}</span>
      <SegmentedControl
        label={t('size')}
        value={value}
        onChange={onChange}
        options={sizes.map((s) => ({ id: s.id, label: s.upcharge > 0 ? `${pick(s.name)} ${money(s.upcharge, { plus: true })}` : pick(s.name) }))}
      />
    </div>
  )
}
