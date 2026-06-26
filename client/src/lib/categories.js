export const CATEGORIES = [
  { key: 'film', label: 'Film', icon: 'film' },
  { key: 'serie', label: 'Serie TV', icon: 'tv' },
  { key: 'anime', label: 'Anime', icon: 'anime' },
  { key: 'altro', label: 'Altro', icon: 'grid' },
]

export function catLabel(key) {
  return (CATEGORIES.find((c) => c.key === key) || { label: 'Altro' }).label
}

export function catIcon(key) {
  return (CATEGORIES.find((c) => c.key === key) || { icon: 'grid' }).icon
}
