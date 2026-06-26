import Card from './Card.jsx'
import Icon from './Icon.jsx'

export default function Row({ title, items, icon }) {
  if (!items || items.length === 0) return null
  return (
    <section className="mb-9">
      <h2 className="flex items-center gap-2 text-lg md:text-2xl font-display font-bold mb-4">
        {icon && (
          <span className="text-brand-400">
            <Icon name={icon} size={22} />
          </span>
        )}
        <span className="neon-text">{title}</span>
        <span className="ml-2 h-px flex-1 bg-gradient-to-r from-brand-500/50 to-transparent" />
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-3 row-scroll">
        {items.map((it, i) => (
          <Card key={it.id + (it._progress ?? '')} item={it} index={i} />
        ))}
      </div>
    </section>
  )
}
