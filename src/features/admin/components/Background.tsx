const MARK_STROKES = [
  "M313 815 L580 268",
  "M330 812 C440 590 600 470 790 487 L797 519 C700 575 620 635 566 700",
  "M520 710 C620 700 700 735 703 822",
];

const styles = {
  backdrop:
    "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-linear-to-bl rtl:bg-linear-to-br from-arctic via-mist to-yellow/40",
  mark: "absolute -end-40 -bottom-32 w-[min(34rem,130vw)] max-w-none text-navy opacity-[0.07]",
};

export function Background() {
  return (
    <div aria-hidden="true" className={styles.backdrop}>
      <svg
        viewBox="0 0 1080 1080"
        fill="none"
        stroke="currentColor"
        strokeWidth="64"
        className={styles.mark}
      >
        {MARK_STROKES.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </div>
  );
}
