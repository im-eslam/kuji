import { useEffect } from "react";
import { useStrings } from "@/shared/i18n";
import { strings } from "../localization/strings";

export function usePageMeta(title: string) {
  const s = useStrings(strings);
  const fullTitle = `${title} · ${s.brandName}`;

  useEffect(() => {
    const previous = document.title;
    document.title = fullTitle;
    return () => {
      document.title = previous;
    };
  }, [fullTitle]);

  useEffect(() => {
    const existing = document.querySelector<HTMLMetaElement>(
      'meta[name="robots"]',
    );
    const meta = existing ?? document.createElement("meta");
    const previous = existing?.content;
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    if (!existing) document.head.appendChild(meta);
    return () => {
      if (existing && previous !== undefined) existing.content = previous;
      else meta.remove();
    };
  }, []);
}
