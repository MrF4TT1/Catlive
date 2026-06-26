// Helpers per generare "copertine" neon procedurali quando non c'è un poster caricato.
export function hashInt(str) {
  let h = 0
  for (const c of String(str || 'x')) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

export function hue(str) {
  return hashInt(str) % 360
}

// Sfondo gradiente in palette viola/rosa/neon, deterministico dal titolo.
export function coverGradient(title) {
  const h = hue(title)
  const h2 = (h + 40) % 360
  return `linear-gradient(150deg,
    hsl(${270 + (h % 40)} 70% 24%),
    hsl(${300 + (h2 % 50)} 75% 16%) 55%,
    #0c0618)`
}

// Colore neon di accento (per bordi/monogrammi).
export function accent(str) {
  const palette = ['#a855f7', '#ec4899', '#d946ef', '#7c3aed', '#22d3ee', '#f472b6']
  return palette[hashInt(str) % palette.length]
}

export function initials(name) {
  return String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function formatTime(sec) {
  sec = Math.max(0, Math.floor(sec || 0))
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}
