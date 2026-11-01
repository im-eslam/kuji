import { useLang } from '../../state/LangContext'
import { cx } from '../../lib/cx'
import { Rolling } from './Rolling'

interface Props {
  value: number | null
  size?: 'small' | 'body' | 'caption' | 'heading'
  struck?: boolean
  plus?: boolean
  /** The value changes while it is on screen (a total, a subtotal): its digits roll. Menu prices never change, so they stay plain. */
  rolling?: boolean
  className?: string
}

const SIZE = { caption: 'text-caption', small: 'text-small', body: 'text-body', heading: 'text-heading' }

export function Price({ value, size = 'small', struck, plus, rolling, className }: Props) {
  const { money, t } = useLang()
  if (value === null) return <span className={cx(SIZE[size], 'font-bold', className)}>{t('priceOnSelection')}</span>
  const text = money(value, { plus })
  const cls = cx(SIZE[size], struck ? 'font-medium text-navy-65 line-through' : 'font-bold', className)
  return rolling && !struck ? <Rolling text={text} className={cls} /> : <span className={cls}>{text}</span>
}
