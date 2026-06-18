import Icon from '../Icon'

export function WorkflowCard({ card }) {
  return (
    <article className="workflow-card">
      <div className="workflow-card__icon">
        <Icon name={card.icon} />
      </div>
      <div>
        <p>{card.label}</p>
        <h3>{card.title}</h3>
      </div>
      <span>{card.text}</span>
    </article>
  )
}
