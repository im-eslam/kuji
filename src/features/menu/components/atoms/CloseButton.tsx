import { useLang } from '../../state/LangContext'
import { cx } from '../../lib/cx'
import { Icon } from './Icon'

interface Props {
  onClick: () => void
  /** 32px to the eye, outlined so it reads on a photo and on white. The tap target stays 48px either way. */
  small?: boolean
  className?: string
}

export function CloseButton({ onClick, small, className }: Props) {
  const { t } = useLang()
  return (
    <button type="button" aria-label={t('a11yClose')} onClick={onClick} className={cx('group flex h-12 w-12 items-center justify-center', className)}>
      <span
        className={cx(
          'flex items-center justify-center rounded-full bg-white transition-transform duration-150 ease-out group-active:scale-90',
          small ? 'h-8 w-8 ring-1 ring-arctic' : 'h-10 w-10',
        )}
      >
        <Icon name="x" size={small ? 16 : 20} />
      </span>
    </button>
  )
}
