import { Icon } from './Icon'
import { Swap } from './Swap'
import { cx } from '../../lib/cx'

interface Props { label: string; onClick: () => void; small?: boolean; done?: boolean }

// 48px hit area around a 40px (32px small) circle. Negative margin keeps layout tight when small.
export function PlusButton({ label, onClick, small, done }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cx('group flex h-12 w-12 shrink-0 items-center justify-center', small && '-m-2')}
    >
      <span
        className={cx(
          'flex items-center justify-center rounded-full transition-[transform,background-color,color] duration-150 ease-out group-active:scale-90',
          small ? 'h-8 w-8' : 'h-10 w-10',
          done ? 'bg-navy text-yellow' : 'bg-yellow text-navy',
        )}
      >
        <Swap value={done}><Icon name={done ? 'check' : 'plus'} size={small ? 16 : 20} /></Swap>
      </span>
    </button>
  )
}
