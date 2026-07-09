import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import LandingNav from '../components/landing/LandingNav.jsx'
import Footer from '../components/landing/Footer.jsx'
import PosterCard from '../components/landing/PosterCard.jsx'
import ContinueCard from '../components/landing/ContinueCard.jsx'
import RecommendedCard from '../components/landing/RecommendedCard.jsx'
import Poster from '../components/landing/Poster.jsx'
import { TRENDING, CONTINUE, RECOMMENDED, HERO } from '../lib/showcase.js'

export default function Landing() {
  return (
    <div className="relative min-h-full overflow-x-hidden bg-void text-white">
      {/* Bagliori neon ambientali di sfondo */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-32 w-[38rem] h-[38rem] rounded-full bg-royal/25 blur-[120px] animate-pulseglow" />
        <div className="absolute top-1/4 -right-40 w-[34rem] h-[34rem] rounded-full bg-neon-pink/15 blur-[120px] animate-floaty" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-0 left-1/3 w-[30rem] h-[30rem] rounded-full bg-brand-600/15 blur-[120px] animate-pulseglow" style={{ animationDelay: '3s' }} />
      </div>

      <LandingNav />

      <main id="home">
        <Hero />

        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <Rail id="trending" title="Trending Now" icon="trending" subtitle="Ciò che tutti stanno guardando adesso">
            {TRENDING.map((it, i) => (
              <PosterCard key={it.id} item={it} index={i} />
            ))}
          </Rail>

          <Rail id="continue" title="Continue Watching" icon="restart" subtitle="Riprendi da dove avevi lasciato">
            {CONTINUE.map((it, i) => (
              <ContinueCard key={it.id} item={it} index={i} />
            ))}
          </Rail>

          <Recommended />
        </div>
      </main>

      <Footer />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
function Hero() {
  const f = HERO.featured
  return (
    <section className="relative isolate grain min-h-[92vh] flex items-center pt-28 md:pt-24 pb-16 overflow-hidden">
      {/* Sfondo cinematografico */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 70% 20%, rgba(123,44,255,0.28), transparent 55%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(90% 80% at 15% 90%, rgba(236,72,153,0.14), transparent 55%)' }} />
        {/* illuminazione neon dai bordi */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow/50 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-royal/40 to-transparent" />
        {/* overlay nero sfumato verso il basso */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void/30 to-void" />
      </div>

      <div className="mx-auto max-w-7xl w-full px-5 md:px-10 grid lg:grid-cols-12 gap-10 items-center">
        {/* Colonna testo */}
        <div className="lg:col-span-7 animate-fadeup">
          <span className="inline-flex items-center gap-2 rounded-full glass-panel px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-lilac">
            <span className="w-2 h-2 rounded-full bg-glow animate-glow shadow-neon-sm" />
            Nuova stagione · 4K Dolby Vision
          </span>

          <h1 className="font-hero font-bold mt-6 text-[2.75rem] leading-[1.02] sm:text-6xl md:text-7xl tracking-tight">
            <span className="block text-gradient">Unlimited Movies.</span>
            <span className="block text-gradient">Unlimited Series.</span>
            <span className="block text-white neon-text">Unlimited Emotion.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base md:text-lg text-mute leading-relaxed">
            Discover thousands of premium movies, TV shows and exclusive originals in stunning quality.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link to="/login" className="btn-primary text-base">
              <Icon name="play" size={20} /> Guarda ora
            </Link>
            <a href="#trending" className="btn-secondary text-base">
              <Icon name="info" size={20} /> Scopri di più
            </a>
          </div>

          {/* prove sociali */}
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-mute">
            <Stat value="12K+" label="Titoli" />
            <span className="hidden sm:block w-px h-8 bg-white/10" />
            <Stat value="4K HDR" label="Qualità" />
            <span className="hidden sm:block w-px h-8 bg-white/10" />
            <Stat value="∞" label="Streaming" />
          </div>
        </div>

        {/* Colonna poster in evidenza */}
        <div className="lg:col-span-5 hidden lg:block animate-fadeup" style={{ animationDelay: '120ms' }}>
          <div className="relative mx-auto w-72 xl:w-80 animate-floaty">
            <div className="absolute -inset-6 bg-radial-violet blur-2xl opacity-70" />
            <div className="relative aspect-[2/3] rounded-3xl overflow-hidden ring-1 ring-glow/30 shadow-glow-strong">
              <Poster title={f.title} kind="Film" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-lg glass-panel ring-1 ring-glow/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-lilac">
                <Icon name="spark" size={11} className="text-glow" /> Featured
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="font-hero text-2xl font-bold neon-text">{f.title}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-mute">
                  <span className="flex items-center gap-1 text-lilac font-bold">
                    <Icon name="star" size={13} className="text-glow" /> {f.rating}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span>{f.genre}</span>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span>{f.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="font-hero text-2xl font-bold text-white">{value}</div>
      <div className="text-xs uppercase tracking-wider text-mute/80">{label}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Rail orizzontale riutilizzabile                                     */
/* ------------------------------------------------------------------ */
function Rail({ id, title, subtitle, icon, children }) {
  return (
    <section id={id} className="scroll-mt-24 py-8 md:py-10">
      <SectionHeader title={title} subtitle={subtitle} icon={icon} />
      <div className="flex gap-5 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory -mx-5 px-5 md:mx-0 md:px-0">
        {children}
      </div>
    </section>
  )
}

function SectionHeader({ title, subtitle, icon }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-2.5 font-hero text-2xl md:text-3xl font-bold tracking-tight">
          {icon && (
            <span className="text-glow drop-shadow-[0_0_10px_rgba(192,132,252,0.7)]">
              <Icon name={icon} size={24} />
            </span>
          )}
          <span className="text-white">{title}</span>
        </h2>
        {subtitle && <p className="mt-1 text-sm text-mute">{subtitle}</p>}
      </div>
      <Link to="/login" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-glow hover:text-lilac transition-colors">
        Vedi tutto <Icon name="chevronRight" size={16} />
      </Link>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Recommended (griglia)                                               */
/* ------------------------------------------------------------------ */
function Recommended() {
  return (
    <section id="recommended" className="scroll-mt-24 py-8 md:py-10">
      <SectionHeader title="Recommended For You" subtitle="Selezionati dal nostro algoritmo neurale" icon="spark" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6">
        {RECOMMENDED.map((it, i) => (
          <RecommendedCard key={it.id} item={it} index={i} />
        ))}
      </div>
    </section>
  )
}
