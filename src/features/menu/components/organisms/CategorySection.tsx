import { memo, useState, type CSSProperties, type ReactNode, type Ref } from "react";
import { useStrings } from "@/shared/i18n";
import { FIRST_VISIBLE, STAGGER_CAP } from "../../config";
import { useIdle } from "../../hooks/useIdle";
import { strings } from "../../strings";
import type { Category, Product } from "../../types";
import { SecondaryButton } from "../atoms/SecondaryButton";
import { ListCard } from "../molecules/ListCard";
import { SectionHead } from "../molecules/SectionHead";

// A grid row animating between 0fr and 1fr gives a smooth height change with no measuring.
function Collapse({ open, fade, children }: { open: boolean; fade?: number; children: ReactNode }) {
  return (
    <div
      aria-hidden={!open}
      {...(open ? {} : ({ inert: "" } as object))}
      style={fade ? { transitionDuration: `250ms, ${fade}ms` } : undefined}
      className={`grid transition-[grid-template-rows,opacity] duration-250 ease-[var(--ease-smooth)] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} ${
        fade ? (open ? "opacity-100" : "opacity-0") : ""
      }`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

interface Props {
  category: Category;
  pillLabel: string;
  title: string;
  products: Product[];
  pick: (name: Product["name"]) => string;
  onOpen: (id: string) => void;
  sectionRef: Ref<HTMLDivElement>;
}

export const CategorySection = memo(function CategorySection({ category, pillLabel, title, products, pick, onOpen, sectionRef }: Props) {
  void category;
  const t = useStrings(strings);
  const [all, setAll] = useState(false);
  const idle = useIdle();
  const first = products.slice(0, FIRST_VISIBLE);
  const rest = products.slice(FIRST_VISIBLE);
  const mountRest = idle || all;

  return (
    <div ref={sectionRef} className="flex flex-col gap-4 py-6">
      <SectionHead title={title} />
      <div className="flex flex-col px-4">
        <div className="flex flex-col gap-3">
          {first.map((p) => (
            <ListCard key={p.id} item={p} name={pick(p.name)} desc={pick(p.description)} onPress={onOpen} />
          ))}
        </div>
        {rest.length > 0 && (
          <>
            <Collapse open={all}>
              <div className="flex flex-col gap-3 pt-3">
                {mountRest &&
                  rest.map((p, n) => (
                    <div key={p.id} style={{ "--i": Math.min(n, STAGGER_CAP) } as CSSProperties} className={all ? "stagger animate-reveal-in" : ""}>
                      <ListCard item={p} name={pick(p.name)} desc={pick(p.description)} onPress={onOpen} />
                    </div>
                  ))}
              </div>
            </Collapse>
            <Collapse open={!all} fade={120}>
              <div className="pt-3">
                <SecondaryButton onPress={() => setAll(true)} className="w-full">
                  {t.showAll(pillLabel, products.length)}
                </SecondaryButton>
              </div>
            </Collapse>
          </>
        )}
      </div>
    </div>
  );
});
