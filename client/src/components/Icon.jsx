// Set di icone SVG (niente emoji). Ereditano il colore da `currentColor`.
const paths = {
  home: <path d="M3 11.5 12 4l9 7.5M5 10v10h14V10" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  library: <path d="M4 5h16M4 12h16M4 19h10" />,
  film: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4" />
    </>
  ),
  tv: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="m8 3 4 3 4-3" />
    </>
  ),
  anime: (
    <>
      <path d="M12 3l2.2 5.5L20 9l-4.5 3.4L17 18l-5-3-5 3 1.5-5.6L4 9l5.8-.5z" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  play: <path d="M7 5v14l12-7z" />,
  restart: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  upload: <path d="M12 16V4m0 0L8 8m4-4 4 4M5 20h14" />,
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 16-5-5L5 21" />
    </>
  ),
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  back: <path d="M15 6l-6 6 6 6" />,
  check: <path d="M5 12l5 5 9-11" />,
  logout: <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2M9 12h11m0 0-3-3m3 3-3 3" />,
  spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />,
  star: <path d="M12 3.4l2.6 5.3 5.8.9-4.2 4.1 1 5.8L12 16.8 6.8 19.5l1-5.8-4.2-4.1 5.8-.9z" />,
  bell: (
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 1.9" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  chevronRight: <path d="M9 6l6 6-6 6" />,
  heart: <path d="M12 20s-7-4.4-9.2-8.5C1.3 8.6 2.8 5.4 6 5.4c1.9 0 3.2 1.1 4 2.4.8-1.3 2.1-2.4 4-2.4 3.2 0 4.7 3.2 3.2 6.1C19 15.6 12 20 12 20z" />,
  trending: <path d="M3 17l6-6 4 4 7-8M21 7h-5m5 0v5" />,
  bookmark: <path d="M6 4h12v16l-6-4-6 4z" />,
}

export default function Icon({ name, size = 22, className = '', strokeWidth = 1.8, fill = false }) {
  const isFill = fill || name === 'play' || name === 'anime' || name === 'star' || name === 'heart'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFill ? 'currentColor' : 'none'}
      stroke={isFill ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name] || null}
    </svg>
  )
}
