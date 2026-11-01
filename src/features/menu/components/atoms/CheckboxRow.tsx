import { cx } from '../../lib/cx'
import { Icon } from './Icon'
import { Price } from './Price'

interface Props { label: string; price: number; checked: boolean; onToggle: () => void }

export function CheckboxRow({ label, price, checked, onToggle }: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="flex h-14 w-full items-center gap-4 border-b border-mist px-4 text-start transition-colors duration-150 active:bg-mist"
    >
      <span
        aria-hidden="true"
        className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border-2 border-navy transition-colors duration-150', checked && 'bg-yellow')}
      >
        <Icon name="check" size={16} className={cx('transition-[opacity,transform] duration-150 ease-out', checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0')} />
      </span>
      <span className={cx('flex-1 text-body', checked ? 'font-semibold' : 'font-medium')}>{label}</span>
      <span className="min-w-20 text-end"><Price value={price} plus size="small" /></span>
    </button>
  )
}
