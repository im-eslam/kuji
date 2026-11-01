interface Props {
  edge?: "start" | "end";
  visible?: boolean;
}

// 16px white-to-transparent fade over one edge of a scrolling row. "start" is the leading edge in either direction.
export function EdgeFade({ edge = "start", visible = true }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 w-4 from-white to-transparent transition-opacity duration-200 ${
        edge === "start" ? "start-0 bg-linear-to-r rtl:bg-linear-to-l" : "end-0 bg-linear-to-l rtl:bg-linear-to-r"
      } ${visible ? "opacity-100" : "opacity-0"}`}
    />
  );
}
