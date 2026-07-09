// Dati vetrina per la LANDING pubblica (pre-login).
// La landing non può chiamare /api/media/home (richiede auth), quindi usa
// questo catalogo dimostrativo con copertine neon procedurali. Puramente
// presentazionale: nessuna chiamata di rete, sempre bello a prescindere dal DB.

// item: { id, title, kind, genre, rating, duration, year, isNew, tags }
export const TRENDING = [
  { id: 't1', title: 'Neon Requiem', kind: 'Film', genre: 'Sci-Fi', rating: 9.1, duration: '2h 14m', year: 2026, isNew: true },
  { id: 't2', title: 'Violet Protocol', kind: 'Serie', genre: 'Thriller', rating: 8.7, duration: 'S2 · 16 ep', year: 2025, isNew: true },
  { id: 't3', title: 'Aurora Drift', kind: 'Anime', genre: 'Avventura', rating: 8.9, duration: 'S1 · 24 ep', year: 2026, isNew: true },
  { id: 't4', title: 'Midnight Circuit', kind: 'Film', genre: 'Azione', rating: 8.4, duration: '1h 58m', year: 2025 },
  { id: 't5', title: 'Echoes of Nova', kind: 'Serie', genre: 'Mystery', rating: 8.8, duration: 'S3 · 10 ep', year: 2026, isNew: true },
  { id: 't6', title: 'Solar Vanguard', kind: 'Film', genre: 'Sci-Fi', rating: 8.2, duration: '2h 06m', year: 2024 },
  { id: 't7', title: 'Crimson Lotus', kind: 'Anime', genre: 'Fantasy', rating: 9.0, duration: 'S1 · 12 ep', year: 2026, isNew: true },
  { id: 't8', title: 'Phantom Ledger', kind: 'Serie', genre: 'Crime', rating: 8.5, duration: 'S1 · 8 ep', year: 2025 },
]

export const CONTINUE = [
  { id: 'c1', title: 'Violet Protocol', kind: 'Serie', episode: 'S2 · E7', rating: 8.7, progress: 62, remaining: '18m' },
  { id: 'c2', title: 'Neon Requiem', kind: 'Film', episode: 'Film', rating: 9.1, progress: 34, remaining: '1h 28m' },
  { id: 'c3', title: 'Aurora Drift', kind: 'Anime', episode: 'S1 · E12', rating: 8.9, progress: 81, remaining: '5m' },
  { id: 'c4', title: 'Echoes of Nova', kind: 'Serie', episode: 'S3 · E2', rating: 8.8, progress: 12, remaining: '41m' },
]

export const RECOMMENDED = [
  { id: 'r1', title: 'Starlight Divide', kind: 'Film', genre: 'Drama', rating: 8.6, year: 2026, isNew: true },
  { id: 'r2', title: 'Quantum Bloom', kind: 'Anime', genre: 'Sci-Fi', rating: 9.2, year: 2026, isNew: true },
  { id: 'r3', title: 'Obsidian Vows', kind: 'Serie', genre: 'Romance', rating: 8.3, year: 2025 },
  { id: 'r4', title: 'Hollow Signal', kind: 'Film', genre: 'Horror', rating: 8.0, year: 2025 },
  { id: 'r5', title: 'Prism Reign', kind: 'Serie', genre: 'Fantasy', rating: 8.9, year: 2026, isNew: true },
  { id: 'r6', title: 'Velvet Machine', kind: 'Film', genre: 'Thriller', rating: 8.1, year: 2024 },
  { id: 'r7', title: 'Astral Kin', kind: 'Anime', genre: 'Avventura', rating: 8.7, year: 2025 },
  { id: 'r8', title: 'Lumen Fall', kind: 'Serie', genre: 'Sci-Fi', rating: 8.5, year: 2026, isNew: true },
  { id: 'r9', title: 'Nightglass', kind: 'Film', genre: 'Noir', rating: 8.4, year: 2025 },
  { id: 'r10', title: 'Ember Directive', kind: 'Anime', genre: 'Azione', rating: 8.8, year: 2026 },
]

export const HERO = {
  featured: { title: 'Neon Requiem', genre: 'Sci-Fi · Thriller', rating: 9.1, year: 2026, duration: '2h 14m' },
}
