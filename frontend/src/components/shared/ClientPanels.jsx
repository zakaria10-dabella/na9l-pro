import Icon from '../Icon'
import { routes } from '../../config/appConfig'
import { getPersonName, getWhatsappUrl } from '../../utils/formatters'

export function ClientPageIntro({ label, title, text }) {
  return (
    <div className="client-page-intro">
      <p>{label}</p>
      <h1>{title}</h1>
      <span>{text}</span>
    </div>
  )
}

export function LoginRequiredPanel({ t, onOpenLogin }) {
  return (
    <div className="dashboard-panel auth-panel">
      <Icon name="login" />
      <p>{t.clientSpace.loginRequired}</p>
      <a href={routes.login} onClick={onOpenLogin}>{t.nav.login}</a>
    </div>
  )
}

export function BookingSummary({ booking, contactLabel, contactPerson, emptyText }) {
  if (!booking) {
    return (
      <aside className="booking-summary">
        <p className="muted-line">{emptyText}</p>
      </aside>
    )
  }

  return (
    <aside className="booking-summary">
      <h2>{booking.status}</h2>
      <dl>
        <div>
          <dt>Depart</dt>
          <dd>{booking.pickup_address}</dd>
        </div>
        <div>
          <dt>Destination</dt>
          <dd>{booking.destination_address}</dd>
        </div>
        <div>
          <dt>Vehicule</dt>
          <dd>{booking.vehicle_category} - {booking.weight_kg} KG</dd>
        </div>
        <div>
          <dt>Driver</dt>
          <dd>{booking.driver ? getPersonName(booking.driver) : 'En attente'}</dd>
        </div>
      </dl>
      {contactPerson && <ContactButton label={contactLabel} person={contactPerson} />}
    </aside>
  )
}

export function ContactButton({ label, person }) {
  const whatsappUrl = getWhatsappUrl(person?.phone)

  if (!whatsappUrl) {
    return null
  }

  return (
    <a className="contact-button" href={whatsappUrl} target="_blank" rel="noreferrer">
      <Icon name="phone" />
      <span>{label}</span>
    </a>
  )
}
