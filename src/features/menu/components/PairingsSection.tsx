import { Button } from "react-aria-components";
import { useLocale, useStrings } from "@/shared/i18n";
import { Icon } from "@/shared/icons";
import { strings, useMoney } from "../localization/strings";
import type { Pairing } from "../data/types";
import { Chevron, Chip, Img, Price, SectionHead } from "./ui";

interface Props {
  pairings: Pairing[];
  onOpen: (pairing: Pairing) => void;
}

/** "Perfect pairings": a row of cards, each offering two products together for less. */
export function PairingsSection({ pairings, onOpen }: Props) {
  const t = useStrings(strings);

  return (
    <section id="pairings" className="flex scroll-mt-26 flex-col gap-4 pt-6 pb-5">
      <SectionHead title={t.pairingsTitle} sub={t.pairingsSub} />
      {/* pb-1: the row clips anything outside it, which shaved the cards' bottom corners. The section's bottom padding is 4px smaller to make up for it. */}
      <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 scroll-ps-4">
        {pairings.map((pairing) => (
          <div key={pairing.id} className="w-[80%] min-w-72 shrink-0 snap-start">
            <PairingCard pairing={pairing} onOpen={onOpen} />
          </div>
        ))}
      </div>
    </section>
  );
}

function PairingCard({ pairing, onOpen }: { pairing: Pairing; onOpen: (pairing: Pairing) => void }) {
  const t = useStrings(strings);
  const locale = useLocale();
  const money = useMoney();
  const [first, second] = pairing.items;
  const { current, regular, savings, hasSavings } = pairing.pricing;

  return (
    <Button
      onPress={() => onOpen(pairing)}
      className="group flex h-full w-full flex-col gap-2 rounded-lg border border-arctic bg-white p-2 text-start transition-[transform,background-color] duration-150 ease-out data-pressed:scale-[0.98] data-pressed:bg-mist"
    >
      <span className="relative flex aspect-[2/1] w-full gap-1">
        <Img image={first.image} className="flex-1 rounded-md" />
        <Img image={second.image} className="flex-1 rounded-md" />
        <span aria-hidden="true" className="absolute inset-0 m-auto flex size-8 items-center justify-center rounded-full border-2 border-white bg-yellow text-navy">
          <Icon name="plus" className="size-4" />
        </span>
        {hasSavings && (
          <span className="absolute end-2 top-2">
            <Chip kind="savings" compact outlined>
              {t.saveChip(money(savings))}
            </Chip>
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-col px-2 text-small font-semibold">
        <span>{first.name[locale]}</span>
        <span>+ {second.name[locale]}</span>
      </span>
      <span className="mt-auto flex items-center gap-2 px-2 pb-2 pt-1">
        <Price value={current} size="small" />
        {regular !== null && <Price value={regular} size="caption" struck />}
        <span className="ms-auto">
          <Chevron small />
        </span>
      </span>
    </Button>
  );
}
