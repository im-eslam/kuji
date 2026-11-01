import { cx } from '../../lib/cx'

// 16px white-to-transparent fade over one edge of a scrolling row.
// "start" is left in LTR and right in RTL; "end" is the opposite edge.
export function EdgeFade({ edge = 'start', visible = true }: { edge?: 'start' | 'end'; visible?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        'pointer-events-none absolute inset-y-0 w-4 from-white to-transparent transition-opacity duration-200',
        edge === 'start' ? 'start-0 bg-linear-to-r rtl:bg-linear-to-l' : 'end-0 bg-linear-to-l rtl:bg-linear-to-r',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    />
  )
}
