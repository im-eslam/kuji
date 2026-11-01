import { useEffect, useRef, useState, type Ref } from "react";
import type { Product } from "../../types";
import { CarouselDot } from "../atoms/CarouselDot";
import { SectionHead } from "../molecules/SectionHead";
import { SignatureCard } from "../molecules/SignatureCard";

interface Props {
  items: Product[];
  title: string;
  sub: string;
  pick: (name: Product["name"]) => string;
  onOpen: (id: string) => void;
  sectionRef: Ref<HTMLDivElement>;
}

export function SignaturesSection({ items, title, sub, pick, onOpen, sectionRef }: Props) {
  const rail = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [idx, setIdx] = useState(0);

  // Dots follow the scroll position (distance from the start edge / card width + gap), at most once per frame.
  // The gap is read from the rail itself, so the maths stays right if the spacing token or the card width changes.
  const onScroll = () => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const r = rail.current;
      const card = r?.querySelector<HTMLElement>("[data-carousel-card]");
      if (!r || !card) return;
      const gap = parseFloat(getComputedStyle(r).columnGap) || 16;
      const step = card.offsetWidth + gap;
      setIdx(Math.min(items.length - 1, Math.max(0, Math.round(Math.abs(r.scrollLeft) / step))));
    });
  };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  if (items.length === 0) return null;

  return (
    <div ref={sectionRef} className="flex flex-col gap-4 py-6">
      <SectionHead title={title} sub={sub} />
      <div ref={rail} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 scroll-ps-4">
        {items.map((item, i) => (
          <SignatureCard key={item.id} item={item} name={pick(item.name)} desc={pick(item.desc)} onPress={onOpen} priority={i === 0} />
        ))}
      </div>
      <div className="flex justify-center gap-2" aria-hidden="true">
        {items.map((item, i) => (
          <CarouselDot key={item.id} active={i === idx} />
        ))}
      </div>
    </div>
  );
}
