import type { ReactNode } from 'react'

export function SectionHead({ title, sub }: { title: string; sub?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-4">
      <h2 className="text-title font-bold">{title}</h2>
      {sub && <p className="text-caption font-medium text-navy-65">{sub}</p>}
    </div>
  )
}
