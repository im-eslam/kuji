import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { strings } from "../localization/strings";
import type { Category } from "../data/types";
import { BottomSheet } from "./BottomSheet";

interface Props {
  isOpen: boolean;
  categories: Category[];
  /** The section currently on screen. It is highlighted in the list. */
  activeId: string;
  onClose: () => void;
  onPick: (categoryId: string) => void;
}

/** A list of all categories with their product counts. Picking one scrolls the menu to it. */
export function CategorySheet({ isOpen, categories, activeId, onClose, onPick }: Props) {
  const t = useStrings(strings);
  const locale = useLocale();

  return (
    <BottomSheet isOpen={isOpen} label={t.categoriesTitle} onClose={onClose}>
      <div className="flex min-h-12 items-center px-4">
        <h2 data-sheet-title className="text-title font-bold">
          {t.categoriesTitle}
        </h2>
      </div>
      <div className="flex flex-col gap-1 px-4 pt-4">
        {categories.map((category) => {
          const active = category.id === activeId;
          return (
            <Button
              key={category.id}
              aria-current={active ? "true" : undefined}
              onPress={() => onPick(category.id)}
              className={`flex h-12 w-full items-center justify-between gap-3 rounded-md px-3 text-start ${active ? "bg-yellow" : "data-pressed:bg-mist"}`}
            >
              <span className={`text-body ${active ? "font-semibold" : "font-medium"}`}>{category.name[locale]}</span>
              <span className="text-caption font-medium text-navy/65">{category.products.length}</span>
            </Button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
