const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const NUMBER = /(\d[\d,.]*)/;

// ==== Styles ====

const styles = {
  wrap: "relative inline-flex items-baseline tabular-nums",
  group: "inline-flex",
  slot: "inline-block h-[1lh] overflow-clip",
  slotInner: "flex flex-col transition-transform duration-300 ease-[var(--ease-smooth)]",
  digit: "block h-[1lh]",
  sep: "whitespace-pre",
};

// ==== Digit column ====

function Slot({ n }: { n: number }) {
  return (
    <span className={styles.slot}>
      <span className={styles.slotInner} style={{ transform: `translateY(${-n}lh)` }}>
        {DIGITS.map((d) => (
          <span key={d} className={styles.digit}>
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

function Group({ text }: { text: string }) {
  const chars = [...text];
  let place = chars.filter((c) => /\d/.test(c)).length;
  return (
    <span dir="ltr" className={styles.group}>
      {chars.map((c, i) =>
        /\d/.test(c) ? <Slot key={`d${--place}`} n={Number(c)} /> : <span key={`s${chars.length - i}`} className={styles.sep}>{c}</span>,
      )}
    </span>
  );
}

// ==== Rolling ====

interface Props {
  text: string;
  className?: string;
}

/** Text containing numbers that changes while on screen: only the digits that changed slide; everything else stays put. */
export function Rolling({ text, className = "" }: Props) {
  return (
    <span className={`${styles.wrap} ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex items-baseline">
        {text.split(NUMBER).map((part, i) =>
          part === "" ? null : i % 2 === 1 ? <Group key={`n${i}`} text={part} /> : <span key={`t${i}`} className={styles.sep}>{part}</span>,
        )}
      </span>
    </span>
  );
}
