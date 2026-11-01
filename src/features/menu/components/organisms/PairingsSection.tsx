import type { Ref } from "react";
import type { Pairing } from "../../types";
import { OfferCard } from "../molecules/OfferCard";
import { SectionHead } from "../molecules/SectionHead";

interface Props {
  pairings: Pairing[];
  title: string;
  sub: string;
  pick: (name: Pairing["items"][number]["name"]) => string;
  onOpen: (id: string) => void;
  sectionRef: Ref<HTMLDivElement>;
}

export function PairingsSection({ pairings, title, sub, pick, onOpen, sectionRef }: Props) {
  if (pairings.length === 0) return null;
  return (
    <div ref={sectionRef} className="flex flex-col gap-4 pt-6 pb-5">
      <SectionHead title={title} sub={sub} />
      {/* pb-1: the rail clips anything outside it, which shaved the cards' bottom corners. The section's bottom padding is 4px smaller to compensate. */}
      <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 scroll-ps-4">
        {pairings.map((pairing) => (
          <div key={pairing.id} className="w-[80%] min-w-72 shrink-0 snap-start">
            <OfferCard pairing={pairing} names={[pick(pairing.items[0].name), pick(pairing.items[1].name)]} onPress={onOpen} />
          </div>
        ))}
      </div>
    </div>
  );
}
