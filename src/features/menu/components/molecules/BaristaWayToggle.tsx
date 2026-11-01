import { BARISTAS_WAY } from '../../data/addons'
import type { Profile } from '../../data/types'
import { useLang } from '../../state/LangContext'
import { baristaNames, baristaPrice } from '../../lib/options'
import { cx } from '../../lib/cx'
import { Icon } from '../atoms/Icon'

export function BaristaWayToggle({ on, onToggle, profile }: { on: boolean; onToggle: () => void; profile: Profile }) {
  const { t, pick, money } = useLang()
  const names = baristaNames(profile).map((n) => pick(n)).join(' + ')
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className={cx(
        'flex h-14 w-full items-center gap-3 rounded-lg px-4 text-start transition-[background-color,box-shadow] duration-200 ease-out',
        on ? 'bg-yellow ring-2 ring-inset ring-navy' : 'bg-arctic',
      )}
    >
      <Icon name="sparkle" size={24} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-small font-bold">{pick(BARISTAS_WAY.name)}</span>
        <span className="text-caption font-medium">{t('baristaSub', { names, price: money(baristaPrice(profile), { plus: true }) })}</span>
      </span>
      <span
        aria-hidden="true"
        className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-navy transition-colors duration-200', on && 'bg-navy text-yellow')}
      >
        <Icon name="check" size={16} className={cx('transition-[opacity,transform] duration-150 ease-out', on ? 'scale-100 opacity-100' : 'scale-50 opacity-0')} />
      </span>
    </button>
  )
}
