import { useEffect, useRef } from 'react'
import { useLang } from '../../state/LangContext'
import { ConfirmButton } from '../atoms/ConfirmButton'
import { SecondaryButton } from '../atoms/SecondaryButton'

interface Props { onKeep: () => void; onClear: () => void }

// Question and two buttons, nothing else. Its height (24 + 16 + 48) equals the footer it covers.
export function ClearConfirmation({ onKeep, onClear }: Props) {
  const { t } = useLang()
  const keepWrap = useRef<HTMLDivElement>(null)
  useEffect(() => { keepWrap.current?.querySelector('button')?.focus() }, [])
  return (
    <div className="flex animate-fade-in flex-col gap-4">
      <p className="text-body font-semibold">{t('clearQuestion')}</p>
      <div className="flex gap-2">
        <div ref={keepWrap} className="flex flex-1"><SecondaryButton onClick={onKeep} className="flex-1">{t('keepOrder')}</SecondaryButton></div>
        <ConfirmButton onClick={onClear} className="flex-1">{t('clearOrder')}</ConfirmButton>
      </div>
    </div>
  )
}
