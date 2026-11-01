import { useLang } from '../../state/LangContext'
import { PrimaryButton } from '../atoms/PrimaryButton'
import { Rolling } from '../atoms/Rolling'
import { Stepper } from '../atoms/Stepper'

interface Props {
  /** Names the quantity control for screen readers. */
  title: string
  qty: number
  max: number
  onQty: (n: number) => void
  label: string
  /** Line total. Null when the price is set on selection: the button then shows the label alone. */
  total: number | null
  onSubmit: () => void
}

// The sheet footer: quantity and the primary action in one row. The total lives in the button, so the sheet
// itself does not repeat the price anywhere else.
export function AddToOrderBar({ title, qty, max, onQty, label, total, onSubmit }: Props) {
  const { money } = useLang()
  return (
    <div className="flex items-center gap-2 xs:gap-3">
      <Stepper size="lg" value={qty} min={1} max={max} title={title} onChange={onQty} />
      <PrimaryButton compact onClick={onSubmit} className="min-w-0 flex-1 gap-1.5 whitespace-nowrap">
        <span>{label}</span>
        {total !== null && (
          <>
            <span aria-hidden="true">·</span>
            <Rolling text={money(total)} />
          </>
        )}
      </PrimaryButton>
    </div>
  )
}
