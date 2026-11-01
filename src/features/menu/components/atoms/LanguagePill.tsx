import { useLang } from '../../state/LangContext'
import { cx } from '../../lib/cx'

export function LanguagePill() {
  const { lang, setLang, t } = useLang()
  return (
    <button
      type="button"
      aria-label={t('a11yLanguage')}
      onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
      className="flex h-12 shrink-0 items-center"
    >
      <span dir="ltr" className="flex h-10 items-center gap-1 rounded-full border border-arctic px-3 text-small">
        <span lang="en" className={cx(lang === 'en' ? 'font-bold' : 'font-medium text-navy-65')}>EN</span>
        <span aria-hidden="true" className="text-navy-65">|</span>
        <span lang="ar" className={cx('font-[Cairo,sans-serif]', lang === 'ar' ? 'font-bold' : 'font-medium text-navy-65')}>ع</span>
      </span>
    </button>
  )
}
