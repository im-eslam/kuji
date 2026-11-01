import { cx } from '../../lib/cx'

interface Props { name: string; count: number; active: boolean; onClick: () => void }

export function CategoryRow({ name, count, active, onClick }: Props) {
  return (
    <button
      type="button"
      aria-current={active ? 'true' : undefined}
      onClick={onClick}
      className={cx('flex h-12 w-full items-center justify-between gap-3 rounded-md px-3 text-start', active ? 'bg-yellow' : 'active:bg-mist')}
    >
      <span className={cx('text-body', active ? 'font-semibold' : 'font-medium')}>{name}</span>
      <span className="text-caption font-medium text-navy-65">{count}</span>
    </button>
  )
}
