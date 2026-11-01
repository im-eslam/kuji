import { Price } from "./Price";

interface Props {
  value: number;
  regular: number | null;
  size?: "caption" | "small" | "body" | "heading";
}

export function PriceWithDiscount({ value, regular, size = "small" }: Props) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <Price value={value} size={size} />
      {regular !== null && value < regular && <Price value={regular} size="caption" struck />}
    </span>
  );
}
