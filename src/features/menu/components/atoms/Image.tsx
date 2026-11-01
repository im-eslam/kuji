import { useState } from 'react'
import { cx } from '../../lib/cx'
import { categoryImageUrl, isLoaded, markLoaded } from '../../lib/images'

interface Props {
  /** Category id (e.g. "iced-coffee"). Every product in a category shares this one photo. */
  category: string
  alt?: string
  className?: string
  /** Above the fold: fetch now, at high priority, instead of waiting for the lazy-load threshold. */
  priority?: boolean
}

// One <img> per photo, no extension probing and no per-image placeholder artwork: a category photo is a single
// hashed file, so after the first card loads it every other card in the category is served from memory.
// A category with no photo uploaded yet keeps the plain gradient placeholder (and makes no request at all).
export function Img({ category, alt = '', className, priority }: Props) {
  const url = categoryImageUrl(category)
  // A photo already loaded this session shows at once (no fade, no flash of placeholder); only one that really
  // has to load fades in. `fade` is decided once at mount so the transition can play when the photo arrives.
  const [loaded, setLoaded] = useState(() => (url ? isLoaded(url) : false))
  const [fade] = useState(() => !loaded)
  const [broken, setBroken] = useState(false)

  return (
    <div className={cx('img-placeholder relative overflow-hidden', className)}>
      {url && !broken && (
        <img
          // Set as a plain attribute so it works on React 18 and 19 alike.
          ref={priority ? (el) => el?.setAttribute('fetchpriority', 'high') : undefined}
          src={url}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          onLoad={() => { markLoaded(url); setLoaded(true) }}
          onError={() => setBroken(true)}
          className={cx(
            'absolute inset-0 h-full w-full object-cover',
            loaded ? 'opacity-100' : 'opacity-0',
            fade && 'transition-opacity duration-200 ease-out',
          )}
        />
      )}
    </div>
  )
}
