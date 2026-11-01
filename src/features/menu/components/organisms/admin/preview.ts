import { POPUP } from '../../../data/popup'
import { categoryImageUrl } from '../../../lib/images'

/**
 * Turns an image path stored in menu.json into something the dashboard can display.
 * Bundled photos are stored as their source path, so they map back to the build's hashed URL here.
 */
export function previewImage(path: string): string | undefined {
  const value = path.trim()
  if (!value) return undefined
  if (/^(https?:)?\/\//.test(value) || value.startsWith('data:')) return value

  const category = value.match(/^(?:src\/)?assets\/categories\/([\w-]+)\.\w+$/)
  if (category) return categoryImageUrl(category[1]) ?? undefined
  if (/^(?:src\/)?assets\/popup\/popup\.\w+$/.test(value)) return POPUP.image

  return value.startsWith('/') ? value : `${import.meta.env.BASE_URL}${value}`
}
