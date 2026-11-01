import { cx } from '../../lib/cx'

export function CarouselDot({ active }: { active: boolean }) {
  return <span aria-hidden="true" className={cx('h-2 w-2 rounded-full transition-colors duration-200 ease-out', active ? 'bg-navy' : 'bg-arctic')} />
}
