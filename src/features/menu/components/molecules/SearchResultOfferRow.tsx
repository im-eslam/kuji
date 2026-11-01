import { Button } from "react-aria-components";
import type { Pairing } from "../../types";
import { Hairline } from "../atoms/Hairline";
import { Img } from "../atoms/Image";
import { Price } from "../atoms/Price";

interface Props {
  pairing: Pairing;
  names: [string, string];
  onPress: (id: string) => void;
}

export function SearchResultOfferRow({ pairing, names, onPress }: Props) {
  const [a, b] = pairing.items;
  return (
    <div>
      <Button onPress={() => onPress(pairing.id)} className="flex min-h-18 w-full items-center gap-3 px-4 py-2 text-start data-pressed:bg-mist">
        <span className="flex shrink-0 gap-1"><Img image={a.image} className="size-8 rounded-md" /><Img image={b.image} className="size-8 rounded-md" /></span>
        <span className="min-w-0 flex-1 text-body font-medium">{names[0]} + {names[1]}</span>
        <Price value={pairing.pricing.current} size="small" />
      </Button>
      <Hairline />
    </div>
  );
}
