import { cx } from '../../lib/cx'
import { Icon } from './Icon'

interface Props { small?: boolean; compact?: boolean }

// "Open" affordance: navy arrow on a yellow circle (yellow = act here). 24 / 28 / 32px.
// Static on purpose: the card around it already answers a press (scale + tint), so the arrow does not move too.
export function Chevron({ small, compact }: Props) {
  return (
    <span aria-hidden="true" className={cx('flex shrink-0 items-center justify-center rounded-full bg-yellow text-navy', small ? 'h-6 w-6' : compact ? 'h-7 w-7' : 'h-8 w-8')}>
      <Icon name="arrow" size={small ? 12 : 16} directional />
    </span>
  )
}
