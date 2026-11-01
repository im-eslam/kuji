import { Button } from "react-aria-components";
import { Icon } from "@/shared/icons";
import { Swap } from "./Swap";

interface Props {
  label: string;
  onPress: () => void;
  small?: boolean;
  done?: boolean;
}

const styles = {
  button: "group flex size-12 shrink-0 items-center justify-center",
  visual: "flex items-center justify-center rounded-full transition-[transform,background-color,color] duration-150 ease-out group-data-pressed:scale-90",
};

// 48px hit area around a 40px (32px small) circle.
export function PlusButton({ label, onPress, small, done }: Props) {
  return (
    <Button aria-label={label} onPress={onPress} className={`${styles.button} ${small ? "-m-2" : ""}`}>
      <span className={`${styles.visual} ${small ? "size-8" : "size-10"} ${done ? "bg-navy text-yellow" : "bg-yellow text-navy"}`}>
        <Swap value={done}>
          <Icon name={done ? "check" : "plus"} className={small ? "size-4" : "size-5"} />
        </Swap>
      </span>
    </Button>
  );
}
