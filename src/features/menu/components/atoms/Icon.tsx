import { cx } from '../../lib/cx'

const PATHS = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.3-4.3',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  x: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12l5 5L20 7',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  menu: 'M4 7h16M4 12h16M4 17h16',
  chev: 'M6 9l6 6 6-6',
  sparkle: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
} as const

export type IconName = keyof typeof PATHS

interface Props {
  name: IconName
  size?: 12 | 16 | 20 | 24
  /** Directional icons mirror in RTL. */
  directional?: boolean
  className?: string
}

export function Icon({ name, size = 24, directional, className }: Props) {
  const filled = name === 'star'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cx('shrink-0', directional && 'rtl:-scale-x-100', className)}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
