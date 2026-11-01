import { useDeferredValue, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { search } from '../../lib/search'
import { useLang } from '../../state/LangContext'
import { useUI } from '../../state/UIContext'
import { CloseButton } from '../atoms/CloseButton'
import { Icon } from '../atoms/Icon'
import { SearchGroupHeading } from '../molecules/SearchGroupHeading'
import { SearchResultCategoryRow } from '../molecules/SearchResultCategoryRow'
import { SearchResultOfferRow } from '../molecules/SearchResultOfferRow'
import { SearchResultRow } from '../molecules/SearchResultRow'

export function SearchOverlay({ onGoToSection }: { onGoToSection: (id: string) => void }) {
  const { t } = useLang()
  const ui = useUI()
  const { closing } = ui
  const [q, setQ] = useState('')
  const input = useRef<HTMLInputElement>(null)
  // The input updates at once; the result list follows on the next idle frame, so typing never waits on rendering rows.
  const dq = useDeferredValue(q)
  const res = useMemo(() => search(dq), [dq])
  const total = res.categories.length + res.offers.length + res.items.length
  const hasQuery = dq.trim().length > 0

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    input.current?.focus()
    return () => { document.body.style.overflow = '' }
  }, [])

  const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') ui.close() }

  return (
    <div role="dialog" aria-modal="true" aria-label={t('a11ySearch')} onKeyDown={onKeyDown} className={`fixed inset-0 z-50 flex animate-fade-in justify-center bg-scrim transition-opacity duration-200 ease-(--ease-exit) ${closing ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex h-full w-full max-w-120 flex-col bg-white">
        <div className="flex items-center gap-1 border-b border-arctic ps-4 pe-2">
          <label className="relative flex h-12 flex-1 items-center my-2">
            <span className="sr-only">{t('a11ySearch')}</span>
            <span className="pointer-events-none absolute start-4"><Icon name="search" size={20} /></span>
            <input
              ref={input}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-12 w-full appearance-none rounded-full border border-arctic bg-mist ps-12 pe-4 text-body outline-none transition-colors duration-150 focus:bg-white focus:outline-none"
            />
          </label>
          <CloseButton onClick={ui.close} />
        </div>
        <p className="sr-only" aria-live="polite">{hasQuery ? t('itemsCount', { n: total }) : ''}</p>
        <div className="min-h-0 flex-1 overflow-y-auto pb-6">
          {!hasQuery && <p className="px-4 py-8 text-center text-small font-medium text-navy-65">{t('searchPrompt')}</p>}
          {hasQuery && total === 0 && <p className="px-4 py-8 text-center text-small font-medium text-navy-65">{t('searchNoMatch', { q: dq.trim() })}</p>}
          {res.categories.length > 0 && (
            <section>
              <SearchGroupHeading>{t('groupCategories')}</SearchGroupHeading>
              {res.categories.map((s) => (
                <SearchResultCategoryRow key={s.id} section={s} onChoose={(id) => { ui.close(); window.setTimeout(() => onGoToSection(id), 0) }} />
              ))}
            </section>
          )}
          {res.offers.length > 0 && (
            <section>
              <SearchGroupHeading>{t('groupOffers')}</SearchGroupHeading>
              {res.offers.map((o) => <SearchResultOfferRow key={o.id} offer={o} onChoose={ui.openOffer} />)}
            </section>
          )}
          {res.items.length > 0 && (
            <section>
              <SearchGroupHeading>{t('groupItems')}</SearchGroupHeading>
              {res.items.map((i) => <SearchResultRow key={i.id} item={i} onChoose={ui.openItem} />)}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
