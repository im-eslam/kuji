import { Button } from "react-aria-components";
import { Hairline } from "../atoms/Hairline";

interface Props {
  name: string;
  count: number;
  onPress: () => void;
}

export function SearchResultCategoryRow({ name, count, onPress }: Props) {
  return (
    <div>
      <Button onPress={onPress} className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-start data-pressed:bg-mist">
        <span className="text-body font-medium">{name}</span>
        <span className="text-caption font-medium text-navy/65">{count}</span>
      </Button>
      <Hairline />
    </div>
  );
}
