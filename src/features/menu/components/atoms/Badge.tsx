import type { ReactNode } from 'react'
import { useLang } from '../../state/LangContext'
import { cx } from '../../lib/cx'
import { Icon } from './Icon'

interface Props { kind: 'top' | 'new' | 'count'; compact?: boolean; children?: ReactNode }

// Height is a minimum and the line is tight (leading-none), so the label sits dead-centre and a larger user
// font size grows the pill instead of clipping it. The star carries its own optical padding, so a badge with an
// icon takes less start padding than one without (the icon reads as part of the edge, not as an inset).
export function Badge({ kind, compact, children }: Props) {
  const { t } = useLang()
  const label = children ?? (kind === 'top' ? t('badgeTop') : t('badgeNew'))
  const icon = kind === 'top'
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full text-caption leading-none font-semibold ring-1 ring-white',
        compact ? 'min-h-5' : 'min-h-6',
        compact ? (icon ? 'ps-1 pe-2' : 'px-2') : icon ? 'ps-2 pe-3' : 'px-3',
        kind === 'top' ? 'bg-yellow text-navy' : 'bg-navy text-white',
      )}
    >
      {icon && <Icon name="star" size={12} />}
      {label}
    </span>
  )
}
