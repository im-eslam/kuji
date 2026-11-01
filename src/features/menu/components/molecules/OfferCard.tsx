import { memo } from "react";
import { Button } from "react-aria-components";
import { Icon } from "@/shared/icons";
import { useStrings } from "@/shared/i18n";
import { strings } from "../../strings";
import { useMoney } from "../../lib/money";
import type { Pairing } from "../../types";
import { Chevron } from "../atoms/Chevron";
import { Chip } from "../atoms/Chip";
import { Img } from "../atoms/Image";
import { Price } from "../atoms/Price";

interface Props {
  pairing: Pairing;
  names: [string, string];
  onPress: (id: string) => void;
}

// The card fills its slot in the rail (the rail sets the width), and the photo pair keeps a 2:1 shape.
export const OfferCard = memo(function OfferCard({ pairing, names, onPress }: Props) {
  const t = useStrings(strings);
  const money = useMoney();
  const [a, b] = pairing.items;
  return (
    <Button
      onPress={() => onPress(pairing.id)}
      className="group flex h-full w-full flex-col gap-2 rounded-lg border border-arctic bg-white p-2 text-start transition-[transform,background-color] duration-150 ease-out data-pressed:scale-[0.98] data-pressed:bg-mist"
    >
      <span className="relative flex aspect-[2/1] w-full gap-1">
        <Img productImage={a.image} categoryId={a.categoryId} className="flex-1 rounded-md" />
        <Img productImage={b.image} categoryId={b.categoryId} className="flex-1 rounded-md" />
        <span aria-hidden="true" className="absolute inset-0 m-auto flex size-8 items-center justify-center rounded-full border-2 border-white bg-yellow text-navy">
          <Icon name="plus" className="size-4" />
        </span>
        {pairing.savings > 0 && (
          <span className="absolute end-2 top-2">
            <Chip kind="savings" compact outlined>
              {t.saveChip(money(pairing.savings))}
            </Chip>
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-col px-2 text-small font-semibold">
        <span>{names[0]}</span>
        <span>+ {names[1]}</span>
      </span>
      <span className="mt-auto flex items-center gap-2 px-2 pb-2 pt-1">
        <Price value={pairing.bundlePrice} size="small" />
        {pairing.savings > 0 && <Price value={pairing.regularPrice} size="caption" struck />}
        <span className="ms-auto">
          <Chevron small />
        </span>
      </span>
    </Button>
  );
});
