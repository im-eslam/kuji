import { useLang } from '../../state/LangContext'
import { cx } from '../../lib/cx'
import { Icon } from './Icon'
import { Rolling } from './Rolling'
import { Swap } from './Swap'

interface Props {
  value: number
  min: number
  max: number
  title: string
  onChange: (next: number) => void
  /** Order sheet: at the minimum the minus becomes a trash icon and calls onRemove. */
  onRemove?: () => void
  /** md: 48px. lg: 56px, level with the primary button in a sheet footer. sm: 36px to the eye, still a 48px tap target (rows in a list). */
  size?: 'sm' | 'md' | 'lg'
}

const SIZE = {
  sm: { box: 'h-9', btn: 'relative h-9 w-10 after:absolute after:inset-x-0 after:-inset-y-1.5', count: 'min-w-5', icon: 16 },
  md: { box: 'h-12', btn: 'h-12 w-12', count: 'min-w-6', icon: 20 },
  lg: { box: 'h-14', btn: 'h-14 w-10 xs:w-11', count: 'min-w-5 xs:min-w-6', icon: 20 },
} as const

export function Stepper({ value, min, max, title, onChange, onRemove, size = 'md' }: Props) {
  const { t } = useLang()
  const trash = !!onRemove && value <= min
  const decDisabled = !trash && value <= min
  const incDisabled = value >= max
  const s = SIZE[size]
  const btn = cx('flex items-center justify-center transition-transform duration-150 ease-out active:scale-90 disabled:opacity-40', s.btn)
  return (
    <div role="group" aria-label={title} className={cx('box-content flex shrink-0 items-center rounded-full border border-arctic', s.box)}>
      <button
        type="button"
        className={cx(btn, 'rounded-s-full')}
        disabled={decDisabled}
        aria-label={trash ? t('a11yRemove', { title }) : t('a11yDecrease', { title })}
        onClick={() => (trash ? onRemove?.() : onChange(value - 1))}
      >
        <Swap value={trash}><Icon name={trash ? 'trash' : 'minus'} size={s.icon} /></Swap>
      </button>
      <span aria-live="polite" aria-atomic="true" className={cx('text-center text-body font-bold', s.count)}><Rolling text={String(value)} /></span>
      <button
        type="button"
        className={cx(btn, 'rounded-e-full')}
        disabled={incDisabled}
        aria-label={t('a11yIncrease', { title })}
        onClick={() => onChange(value + 1)}
      >
        <Icon name="plus" size={s.icon} />
      </button>
    </div>
  )
}
