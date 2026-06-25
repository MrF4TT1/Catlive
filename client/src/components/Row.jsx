import Card from './Card.jsx'

export default function Row({ title, items }) {
  if (!items || items.length === 0) return null
  return (
    <section className="mb-8">
      <h2 className="text-lg md:text-xl font-bold mb-3">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 row-scroll">
        {items.map((it) => (
          <Card key={it.id + (it._progress ?? '')} item={it} />
        ))}
      </div>
    </section>
  )
}
