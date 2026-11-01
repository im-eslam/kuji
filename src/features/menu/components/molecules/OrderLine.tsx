import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "react-aria-components";
import { useStrings } from "@/shared/i18n";
import { REMOVE_LINE_MS } from "../../config";
import { strings } from "../../strings";
import type { OrderLine as Line } from "../../types";
import { Chevron } from "../atoms/Chevron";
import { Hairline } from "../atoms/Hairline";
import { Price } from "../atoms/Price";
import { Stepper } from "../atoms/Stepper";

interface FrameProps {
  line: Line;
  title: string;
  thumb: ReactNode;
  /** Size and add-on chips. Null when the product has none, and the row is only as tall as its photo. */
  details: ReactNode;
  unit: number | null;
  regular: number | null;
  onEdit: (line: Line) => void;
  onSetQty: (line: Line, qty: number) => void;
  onRemove: (line: Line) => void;
}

// A photo on the start side and one column beside it: title (+ chips), then a footer with this line's total and
// the stepper. Photo, title and chips are one edit button; the stepper is a separate control.
export function OrderLineFrame({ line, title, thumb, details, unit, regular, onEdit, onSetQty, onRemove }: FrameProps) {
  const t = useStrings(strings);
  const total = unit === null ? null : unit * line.qty;
  const wasTotal = regular === null ? null : regular * line.qty;
  const [leaving, setLeaving] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const remove = () => {
    if (leaving) return;
    setLeaving(true);
    timer.current = window.setTimeout(() => onRemove(line), REMOVE_LINE_MS);
  };

  return (
    <div
      style={{ transitionDuration: `${REMOVE_LINE_MS}ms, 140ms` }}
      className={`grid transition-[grid-template-rows,opacity] ease-[var(--ease-smooth)] ${leaving ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}
    >
      <div className="min-h-0 overflow-hidden">
        <Hairline />
        <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-3 gap-y-1 px-4 py-3">
          <div aria-hidden="true" onClick={() => onEdit(line)} className="row-span-2 cursor-pointer self-start">
            {thumb}
          </div>
          <Button
            data-line-key={line.key}
            aria-label={t.a11yEdit(title)}
            onPress={() => onEdit(line)}
            className="flex min-w-0 flex-col gap-1 rounded-md text-start transition-colors duration-150 data-pressed:bg-mist"
          >
            <span className="flex items-start justify-between gap-2">
              <span className="text-body font-semibold">{title}</span>
              <Chevron small />
            </span>
            {details}
          </Button>
          <div className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
              {total !== null && <Price value={total} size="body" rolling />}
              {wasTotal !== null && <Price value={wasTotal} size="caption" struck />}
            </span>
            <Stepper size="sm" value={line.qty} min={1} max={99} title={title} onChange={(q) => onSetQty(line, q)} onRemove={remove} />
          </div>
        </div>
      </div>
    </div>
  );
}
