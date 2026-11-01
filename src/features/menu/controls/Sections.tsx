import { Fragment } from "react";
import { useLocale, useStrings } from "@/shared/i18n";
import { CategorySection, PairingsSection, SectionDivider, SignaturesSection } from "../components";
import { useMenuState } from "../hooks/useMenuState";
import { strings } from "../strings";

interface Props {
  register: (id: string) => (el: HTMLElement | null) => void;
}

/** Renders the backend-prepared sections in page order: signatures, pairings, then categories. */
export function MenuSections({ register }: Props) {
  const { menu, openItem, openOffer } = useMenuState();
  const locale = useLocale();
  const t = useStrings(strings);
  const pick = (text: { en: string; ar: string }) => text[locale];

  return (
    <>
      {menu.signatures.length > 0 && (
        <>
          <SignaturesSection
            items={menu.signatures}
            title={t.signaturesTitle}
            sub={t.signaturesSub}
            pick={pick}
            onOpen={openItem}
            sectionRef={register("signatures")}
          />
          <SectionDivider />
        </>
      )}
      {menu.pairings.length > 0 && (
        <>
          <PairingsSection
            pairings={menu.pairings}
            title={t.pairingsTitle}
            sub={t.pairingsSub}
            pick={pick}
            onOpen={openOffer}
            sectionRef={register("pairings")}
          />
          <SectionDivider />
        </>
      )}
      {menu.categories.map((category, index) => (
        <Fragment key={category.id}>
          <CategorySection
            category={category}
            pillLabel={pick(category.name)}
            title={pick(category.name)}
            products={category.products}
            pick={pick}
            onOpen={openItem}
            sectionRef={register(category.id)}
          />
          {index < menu.categories.length - 1 && <SectionDivider />}
        </Fragment>
      ))}
    </>
  );
}
