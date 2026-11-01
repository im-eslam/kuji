export function bump(el: Element | null, scale: number, ms: number) {
  if (!el || typeof el.animate !== "function") return;
  el.animate(
    [{ transform: "scale(1)" }, { transform: `scale(${scale})`, offset: 0.4 }, { transform: "scale(1)" }],
    { duration: ms, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
  );
}
