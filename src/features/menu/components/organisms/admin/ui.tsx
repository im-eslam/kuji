import {
  useEffect,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Info,
  Loader2,
  X,
} from 'lucide-react'
import { cx } from '../../../lib/cx'
import { moveItem } from '../../../lib/menuLogic'
import type { L10n } from '../../../data/types'
import { useMenu } from '../../../state/MenuContext'

const control =
  'w-full rounded-xl border border-navy/15 bg-white px-3 text-sm text-navy placeholder:text-navy/40 transition-colors hover:border-navy/30 focus:border-yellow/70 focus:outline-none focus:ring-2 focus:ring-yellow/20 disabled:opacity-50'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 aria-hidden="true" className={cx('size-4 animate-spin', className)} />
}

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md'
  loading?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-yellow text-navy hover:brightness-95',
  secondary: 'border border-navy/15 bg-white text-navy hover:border-navy/30 hover:bg-mist',
  ghost: 'text-navy/75 hover:bg-mist hover:text-navy',
  danger: 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
}

export function Button({ variant = 'secondary', size = 'md', loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold transition-all focus-visible:outline-yellow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

export function IconBtn({
  label,
  className,
  children,
  tone = 'default',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: 'default' | 'danger' }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-yellow disabled:cursor-not-allowed disabled:opacity-30',
        tone === 'danger'
          ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
          : 'text-navy/55 hover:bg-mist hover:text-navy',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Form controls
// ---------------------------------------------------------------------------
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: (id: string) => ReactNode
  className?: string
}) {
  const id = useId()
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-xs font-medium text-navy/65">
        {label}
      </label>
      {children(id)}
      {hint && <p className="text-xs text-navy/55">{hint}</p>}
    </div>
  )
}

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(control, 'h-10', className)} {...rest} />
}

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(control, 'resize-none py-2.5 leading-relaxed', className)} {...rest} />
}

/** Number box that lets the owner clear it while typing instead of snapping back to 0. */
export function NumberInput({
  value,
  onChange,
  min = 0,
  step = 1,
  suffix,
  id,
  className,
  disabled,
}: {
  value: number
  onChange: (n: number) => void
  min?: number
  step?: number
  suffix?: string
  id?: string
  className?: string
  disabled?: boolean
}) {
  const [text, setText] = useState<string | null>(null)
  return (
    <div className={cx('relative', className)}>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        disabled={disabled}
        value={text ?? String(value)}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          setText(e.target.value)
          const n = parseFloat(e.target.value)
          if (!Number.isNaN(n)) onChange(Math.max(min, n))
        }}
        onBlur={() => setText(null)}
        className={cx(control, 'h-10', suffix && 'pe-12')}
      />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs text-navy/55">
          {suffix}
        </span>
      )}
    </div>
  )
}

export function Select({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(control, 'h-10 appearance-none pe-8', className)} {...rest}>
      {children}
    </select>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  description?: string
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/70 bg-white/70 px-3 py-2.5 transition-colors hover:border-navy/20">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-navy">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-navy/55">{description}</span>}
      </span>
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="h-6 w-11 rounded-full bg-navy/20 transition-colors peer-checked:bg-yellow peer-focus-visible:ring-2 peer-focus-visible:ring-yellow/50" />
        <span className="absolute start-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5 peer-checked:bg-navy rtl:peer-checked:-translate-x-5" />
      </span>
    </label>
  )
}

/** English + Arabic pair of inputs. Arabic is right-to-left. */
export function Bilingual({
  label,
  value,
  onChange,
  multiline,
  maxLength,
  placeholder,
}: {
  label: string
  value: L10n
  onChange: (next: L10n) => void
  multiline?: boolean
  maxLength?: number
  placeholder?: L10n
}) {
  const shared = { maxLength }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label={`${label} (EN)`}>
        {(id) =>
          multiline ? (
            <TextArea id={id} rows={2} {...shared} placeholder={placeholder?.en} value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} />
          ) : (
            <TextInput id={id} {...shared} placeholder={placeholder?.en} value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} />
          )
        }
      </Field>
      <Field label={`${label} (AR)`}>
        {(id) =>
          multiline ? (
            <TextArea id={id} rows={2} dir="rtl" lang="ar" {...shared} placeholder={placeholder?.ar} value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} />
          ) : (
            <TextInput id={id} dir="rtl" lang="ar" {...shared} placeholder={placeholder?.ar} value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} />
          )
        }
      </Field>
    </div>
  )
}

/** Toggleable pills for picking several options from a list. */
export function PillPicker<T extends string>({
  options,
  selected,
  onToggle,
  emptyText = 'Nothing to choose from yet.',
}: {
  options: { id: T; label: string; hint?: string }[]
  selected: T[]
  onToggle: (id: T) => void
  emptyText?: string
}) {
  if (options.length === 0) return <p className="text-sm text-navy/55">{emptyText}</p>
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o.id)
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(o.id)}
            className={cx(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-yellow',
              on
                ? 'border-yellow/70 bg-yellow/25 text-navy'
                : 'border-navy/15 bg-white text-navy/65 hover:border-navy/30 hover:text-navy',
            )}
          >
            {o.label}
            {o.hint && <span className="ms-1.5 text-navy/50">{o.hint}</span>}
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('rounded-2xl border border-white/70 bg-white/80 p-4 sm:p-5', className)}>
      {children}
    </div>
  )
}

export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-navy">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-navy/65">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'yellow' | 'green' | 'red' }) {
  const tones = {
    neutral: 'bg-arctic text-navy/75',
    yellow: 'bg-yellow/25 text-navy',
    green: 'bg-emerald-100 text-emerald-800',
    red: 'bg-red-100 text-red-700',
  }
  return (
    <span className={cx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-navy/20 px-4 py-10 text-center text-sm text-navy/55">
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
export function Modal({
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  const titleId = useId()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/70 bg-white shadow-2xl sm:rounded-3xl',
          wide ? 'sm:max-w-3xl' : 'sm:max-w-md',
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-navy/10 px-5 py-4">
          <h2 id={titleId} className="text-base font-bold text-navy">
            {title}
          </h2>
          <IconBtn label="Close" onClick={onClose}>
            <X className="size-4" />
          </IconBtn>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-navy/10 px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-navy/75">{message}</p>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Sortable list: drag by the grip, or use the arrows.
// ---------------------------------------------------------------------------
export function SortableList<T>({
  items,
  getKey,
  onReorder,
  renderItem,
  label,
}: {
  items: T[]
  getKey: (item: T) => string
  onReorder: (next: T[]) => void
  renderItem: (item: T, index: number) => ReactNode
  label: string
}) {
  const [armed, setArmed] = useState<number | null>(null)
  const [dragging, setDragging] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)

  const finish = () => {
    setArmed(null)
    setDragging(null)
    setOver(null)
  }

  return (
    <ul aria-label={label} className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li
          key={getKey(item)}
          draggable={armed === index}
          onDragStart={(e) => {
            setDragging(index)
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', String(index))
          }}
          onDragOver={(e) => {
            if (dragging === null) return
            e.preventDefault()
            setOver(index)
          }}
          onDrop={(e) => {
            e.preventDefault()
            if (dragging !== null) onReorder(moveItem(items, dragging, index))
            finish()
          }}
          onDragEnd={finish}
          className={cx(
            'flex items-stretch gap-1 rounded-2xl border bg-white/70 transition-colors',
            dragging === index && 'opacity-40',
            over === index && dragging !== null && dragging !== index ? 'border-yellow/70' : 'border-white/70',
          )}
        >
          <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 border-e border-navy/10 px-1 py-1.5">
            <IconBtn label="Move up" className="size-6" disabled={index === 0} onClick={() => onReorder(moveItem(items, index, index - 1))}>
              <ChevronUp className="size-4" />
            </IconBtn>
            <span
              role="presentation"
              onPointerDown={() => setArmed(index)}
              onPointerUp={() => setArmed(null)}
              className="flex size-6 cursor-grab items-center justify-center text-navy/40 hover:text-navy/75 active:cursor-grabbing"
            >
              <GripVertical className="size-4" aria-hidden="true" />
            </span>
            <IconBtn label="Move down" className="size-6" disabled={index === items.length - 1} onClick={() => onReorder(moveItem(items, index, index + 1))}>
              <ChevronDown className="size-4" />
            </IconBtn>
          </div>
          <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
        </li>
      ))}
    </ul>
  )
}

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------
const toastIcon = {
  success: <CheckCircle2 className="size-4 text-emerald-700" />,
  error: <AlertCircle className="size-4 text-red-600" />,
  info: <Info className="size-4 text-navy/65" />,
}

export function Toaster() {
  const { toasts, dismissToast } = useMenu()
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm text-navy shadow-xl animate-[reveal_250ms_var(--ease-smooth)_both]"
        >
          <span className="mt-0.5">{toastIcon[t.kind]}</span>
          <span className="min-w-0 flex-1">{t.message}</span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => dismissToast(t.id)}
            className="text-navy/50 hover:text-navy"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
