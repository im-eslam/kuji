import { Icon, type IconName } from './Icon'

export function IconButton({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="flex h-12 w-12 shrink-0 items-center justify-center">
      <Icon name={icon} />
    </button>
  )
}
