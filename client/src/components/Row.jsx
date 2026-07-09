import Card from './Card.jsx'
import Icon from './Icon.jsx'

export default function Row({ title, items, icon, subtitle }) {
  if (!items || items.length === 0) return null
  return (
    <section className="mb-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2.5 text-xl md:text-2xl font-hero font-bold tracking-tight">
            {icon && (
              <span className="text-glow drop-shadow-[0_0_10px_rgba(192,132,252,0.7)]">
                <Icon name={icon} size={22} />
              </span>
            )}
            <span className="text-white">{title}</span>
          </h2>
          {subtitle && <p className="mt-1 text-sm text-mute">{subtitle}</p>}
        </div>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-3 hide-scrollbar snap-x -mx-4 px-4 md:mx-0 md:px-0">
        {items.map((it, i) => (
          <Card key={it.id + (it._progress ?? '')} item={it} index={i} />
        ))}
      </div>
    </section>
  )
}
