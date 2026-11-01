import { Button } from "react-aria-components";
import { Icon, type IconName } from "@/shared/icons";

export function IconButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Button aria-label={label} onPress={onPress} className="flex size-12 shrink-0 items-center justify-center">
      <Icon name={icon} className="size-6" />
    </Button>
  );
}
