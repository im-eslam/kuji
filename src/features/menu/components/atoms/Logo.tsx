import { useState } from 'react'
import avatar from '../../../assets/avatar.jpg'
import wordmark from '../../../assets/wordmark.jpg'
import { useLang } from '../../state/LangContext'

export function Logo() {
  const { t } = useLang()
  const [avatarOk, setAvatarOk] = useState(true)
  const [wordmarkOk, setWordmarkOk] = useState(true)
  return (
    <div className="flex items-center gap-2">
      {avatarOk && (
        <img src={avatar} alt="" onError={() => setAvatarOk(false)} className="h-10 w-10 rounded-full object-cover" />
      )}
      {wordmarkOk ? (
        <img src={wordmark} alt={t('a11yWordmark')} onError={() => setWordmarkOk(false)} className="h-6 w-auto" />
      ) : (
        <span role="img" aria-label={t('a11yWordmark')} className="flex h-6 items-center rounded-md border border-dashed border-arctic bg-mist px-2 text-caption font-medium text-navy-65">
          {t('a11yPlaceholderMark')}
        </span>
      )}
    </div>
  )
}
