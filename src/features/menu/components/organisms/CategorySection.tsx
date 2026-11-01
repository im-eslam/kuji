import { memo, useMemo, useState, type CSSProperties } from 'react'
import { useIdle } from '../../hooks/useIdle'
import { getItem } from '../../lib/catalog'
import type { Section } from '../../data/types'
import { FIRST_VISIBLE, sortCategory } from '../../lib/sort'
import { cx } from '../../lib/cx'
import { useLang } from '../../state/LangContext'
import { useUI } from '../../state/UIContext'
import { SecondaryButton } from '../atoms/SecondaryButton'
import { ListCard } from '../molecules/ListCard'
import { SectionHead } from '../molecules/SectionHead'

// A grid row animating between 0fr and 1fr gives a smooth height change with no measuring.
// `fade` sets how the opacity moves relative to the height (ms): the button fades out quicker than its row closes,
// so it is gone before the list reaches it. Without `fade` only the height moves (the list's cards fade themselves).
function Collapse({ open, fade, children }: { open: boolean; fade?: number; children: React.ReactNode }) {
  return (
    <div
      aria-hidden={!open}
      // `inert` keeps hidden cards out of the tab order; spread so it type-checks on React 18 and 19.
      {...(open ? {} : ({ inert: '' } as object))}
      style={fade ? { transitionDuration: `250ms, ${fade}ms` } : undefined}
      className={cx(
        'grid transition-[grid-template-rows,opacity] duration-250 ease-(--ease-smooth)',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        fade ? (open ? 'opacity-100' : 'opacity-0') : undefined,
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}

// Cards that join the list on Show all: they rise in one after another (40ms apart, capped at 6 steps so a long
// list never drags), starting as the row opens. Before that they sit still, clipped, so nothing plays on page load.
const STAGGER_CAP = 6

export const CategorySection = memo(function CategorySection({ section }: { section: Section }) {
  const { pick, t } = useLang()
  const { openItem } = useUI()
  const [all, setAll] = useState(false)
  const idle = useIdle()
  const items = useMemo(() => sortCategory(section.itemIds.flatMap((id) => { const i = getItem(id); return i ? [i] : [] })), [section])
  const first = items.slice(0, FIRST_VISIBLE)
  const rest = items.slice(FIRST_VISIBLE)
  // The cards behind "Show all" are hidden, so they mount just after the first paint (a third to a half fewer
  // nodes to build up front) and are long since in place by the time anyone taps the button.
  const mountRest = idle || all
  return (
    <div className="flex flex-col gap-4 py-6">
      <SectionHead title={pick(section.title)} />
      <div className="flex flex-col px-4">
        <div className="flex flex-col gap-3">
          {first.map((i) => <ListCard key={i.id} item={i} onOpen={openItem} />)}
        </div>
        {rest.length > 0 && (
          <>
            <Collapse open={all}>
              <div className="flex flex-col gap-3 pt-3">
                {mountRest && rest.map((i, n) => (
                  <div key={i.id} style={{ '--i': Math.min(n, STAGGER_CAP) } as CSSProperties} className={all ? 'stagger animate-reveal' : undefined}>
                    <ListCard item={i} onOpen={openItem} />
                  </div>
                ))}
              </div>
            </Collapse>
            <Collapse open={!all} fade={120}>
              <div className="pt-3">
                <SecondaryButton onClick={() => setAll(true)} className="w-full">
                  {t('showAll', { category: pick(section.pill), count: items.length })}
                </SecondaryButton>
              </div>
            </Collapse>
          </>
        )}
      </div>
    </div>
  )
})
