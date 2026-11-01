import { useState } from "react";
import { resolveProductImage } from "../../lib/images";

interface Props {
  image: string | null;
  alt?: string;
  className?: string;
  /** Above the fold: fetch now, at high priority, instead of waiting for the lazy-load threshold. */
  priority?: boolean;
}

/** Displays this product's own image, or a neutral placeholder when it has no image. */
export function Img({ image, alt = "", className = "", priority }: Props) {
  const url = resolveProductImage(image);
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-linear-to-br from-arctic to-mist ${className}`}>
      {url && !broken && (
        <img
          src={url}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-200 ease-out ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
