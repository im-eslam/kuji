import { Button } from "react-aria-components";
import { Icon } from "@/shared/icons";
import { useStrings } from "@/shared/i18n";
import { strings } from "../../strings";

interface Props {
  onPress: () => void;
  /** 32px to the eye, outlined so it reads on a photo and on white. The tap target stays 48px either way. */
  small?: boolean;
  className?: string;
}

const styles = {
  button: "group flex size-12 items-center justify-center",
  visual: "flex items-center justify-center rounded-full bg-white transition group-data-pressed:scale-90",
};

export function CloseButton({ onPress, small, className = "" }: Props) {
  const t = useStrings(strings);
  return (
    <Button aria-label={t.a11yClose} onPress={onPress} className={`${styles.button} ${className}`}>
      <span className={`${styles.visual} ${small ? "size-8 ring-1 ring-arctic" : "size-10"}`}>
        <Icon name="close" className={small ? "size-4" : "size-5"} />
      </span>
    </Button>
  );
}
