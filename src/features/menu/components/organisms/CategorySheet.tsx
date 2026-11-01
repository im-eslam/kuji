import { useStrings } from "@/shared/i18n";
import { strings } from "../../strings";
import type { Category } from "../../types";
import { CategoryRow } from "../molecules/CategoryRow";
import { SheetTitle } from "../molecules/SheetTitle";
import { BottomSheet } from "./BottomSheet";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Array<{ category: Category; label: string; count: number }>;
  activeId: string;
  onPick: (id: string) => void;
}

export function CategorySheet({ isOpen, onClose, categories, activeId, onPick }: Props) {
  const t = useStrings(strings);
  return (
    <BottomSheet isOpen={isOpen} label={t.categoriesTitle} onClose={onClose}>
      <div className="flex min-h-12 items-center px-4">
        <SheetTitle>{t.categoriesTitle}</SheetTitle>
      </div>
      <div className="flex flex-col gap-1 px-4 pt-4">
        {categories.map(({ category, label, count }) => (
          <CategoryRow
            key={category.id}
            name={label}
            count={count}
            active={category.id === activeId}
            onPress={() => {
              onClose();
              window.setTimeout(() => onPick(category.id), 0);
            }}
          />
        ))}
      </div>
    </BottomSheet>
  );
}
