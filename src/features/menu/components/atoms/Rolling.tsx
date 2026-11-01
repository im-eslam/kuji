import { useEffect, useRef } from 'react'
import { cx } from '../../lib/cx'

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const NUMBER = /(\d[\d,.]*)/

// One digit column: a strip of 0-9, one line tall window, slid to the right digit. Changing the digit slides the
// strip, so 129 -> 130 turns only the last two columns, and a fast tap-tap-tap just retargets the slide.
// overflow-clip (not hidden) keeps the text baseline where plain text would have it.
function Slot({ n, enter }: { n: number; enter: boolean }) {
  return (
    <span className={cx('inline-block h-[1lh] overflow-clip', enter && 'animate-digit-in')}>
      <span className="flex flex-col transition-transform duration-300 ease-(--ease-smooth)" style={{ transform: `translateY(${-n}lh)` }}>
        {DIGITS.map((d) => <span key={d} className="block h-[1lh]">{d}</span>)}
      </span>
    </span>
  )
}

// A run of digits (with its separators). Always left-to-right, so Arabic layouts still read 1,240 and not 0421.
// Digits are keyed by place from the right (ones, tens...), so 99 -> 100 keeps its two columns and adds a third.
function Group({ text, enter }: { text: string; enter: boolean }) {
  const chars = [...text]
  let place = chars.filter((c) => /\d/.test(c)).length
  return (
    <span dir="ltr" className="inline-flex">
      {chars.map((c, i) =>
        /\d/.test(c)
          ? <Slot key={`d${--place}`} n={Number(c)} enter={enter} />
          : <span key={`s${chars.length - i}`} className="whitespace-pre">{c}</span>,
      )}
    </span>
  )
}

interface Props { text: string; className?: string }

// Text with numbers in it that changes while you watch: prices, counts, "3 items". Only the digits that changed move;
// everything else (EGP, commas, words) stays put. Nothing plays on first render. Screen readers get the plain text.
export function Rolling({ text, className }: Props) {
  const ready = useRef(false)
  useEffect(() => { ready.current = true }, [])
  return (
    <span className={cx('relative inline-flex items-baseline tabular-nums', className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex items-baseline">
        {text.split(NUMBER).map((part, i) => {
          if (part === '') return null
          return i % 2 === 1
            ? <Group key={`n${i}`} text={part} enter={ready.current} />
            : <span key={`t${i}`} className="whitespace-pre">{part}</span>
        })}
      </span>
    </span>
  )
}
