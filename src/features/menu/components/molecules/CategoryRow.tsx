import { Button } from "react-aria-components";

interface Props {
  name: string;
  count: number;
  active: boolean;
  onPress: () => void;
}

export function CategoryRow({ name, count, active, onPress }: Props) {
  return (
    <Button
      aria-current={active ? "true" : undefined}
      onPress={onPress}
      className={`flex h-12 w-full items-center justify-between gap-3 rounded-md px-3 text-start ${active ? "bg-yellow" : "data-pressed:bg-mist"}`}
    >
      <span className={`text-body ${active ? "font-semibold" : "font-medium"}`}>{name}</span>
      <span className="text-caption font-medium text-navy/65">{count}</span>
    </Button>
  );
}
