import { useMoney } from "../../lib/money";
import { Rolling } from "./Rolling";

interface Props {
  value: number;
  size?: "caption" | "small" | "body" | "heading";
  struck?: boolean;
  plus?: boolean;
  /** The value can change while on screen (a total, a subtotal): its digits roll. Menu prices never change, so stay plain. */
  rolling?: boolean;
  className?: string;
}

const SIZE = { caption: "text-caption", small: "text-small", body: "text-body", heading: "text-heading" };

export function Price({ value, size = "small", struck, plus, rolling, className = "" }: Props) {
  const money = useMoney();
  const text = money(value, { plus });
  const cls = `${SIZE[size]} ${struck ? "font-medium text-navy/65 line-through" : "font-bold"} ${className}`;
  return rolling && !struck ? <Rolling text={text} className={cls} /> : <span className={cls}>{text}</span>;
}
