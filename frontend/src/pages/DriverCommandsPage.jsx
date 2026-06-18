import Icon from '../components/Icon'
import PageNavbar from '../components/navigation/PageNavbar'
import OpenStreetMapPanel from '../components/maps/OpenStreetMapPanel'
import { ClientPageIntro, ContactButton, LoginRequiredPanel } from '../components/shared/ClientPanels'
import { formatMoney, getPersonName } from '../utils/formatters'

export default function DriverCommandsPage({
  commands,
  clientSession,
  isArabic,
  isDark,
  status,
  t,
  onAccept,
  onNavigate,
  onOpenRegister,
  onOpenLogin,
  onLogout,
  onToggleLanguage,
  onToggleTheme,
}) {
  return (
    <div className="standalone-page client-page driver-shell">
      <PageNavbar
        clientSession={clientSession}
        isArabic={isArabic}
        isDark={isDark}
        t={t}
        onNavigate={onNavigate}
        onOpenRegister={onOpenRegister}
        onOpenLogin={onOpenLogin}
        onLogout={onLogout}
        onToggleLanguage={onToggleLanguage}
        onToggleTheme={onToggleTheme}
      />

      <section className="client-workspace dashboard-page driver-commands-page">
        <ClientPageIntro
          label={t.driverSpace.commandsLabel}
          title={t.driverSpace.commandsTitle}
          text={t.driverSpace.commandsText}
        />

        {clientSession?.role === 'driver' ? (
          <div className="driver-request-layout">
            <OpenStreetMapPanel
              bookings={commands}
              status={status}
              t={{ ...t.clientSpace, noBooking: t.driverSpace.noCommands }}
            />

            <section className="dashboard-panel driver-command-panel">
              {status.type === 'loading' && <p className="muted-line">{t.clientSpace.loading}</p>}
              {status.type === 'error' && <p className="form-message error">{status.message}</p>}
              {status.type === 'success' && <p className="form-message success">{status.message}</p>}

              {commands.length ? (
                <div className="driver-command-list">
                  {commands.map((booking) => (
                    <article className="driver-command-card" key={booking.id}>
                      <div className="driver-command-main">
                        <div>
                          <p>{getPersonName(booking.client)}</p>
                          <h2>{booking.pickup_address}</h2>
                          <span>{booking.destination_address}</span>
                        </div>
                        <strong>{formatMoney(booking.earning_amount)} MAD</strong>
                      </div>

                      <div className="order-meta">
                        <span>{booking.vehicle_category}</span>
                        <span>{booking.weight_kg} KG</span>
                        <span>{booking.status}</span>
                      </div>
                      <ContactButton label={t.driverSpace.callClient} person={booking.client} />

                      <button
                        className="command-accept-button"
                        type="button"
                        disabled={status.type === 'saving'}
                        onClick={() => onAccept(booking)}
                      >
                        <Icon name="check" />
                        <span>{status.type === 'saving' ? t.driverSpace.accepting : t.driverSpace.accept}</span>
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                status.type !== 'loading' && <p className="muted-line">{t.driverSpace.noCommands}</p>
              )}
            </section>
          </div>
        ) : (
          <LoginRequiredPanel t={{ ...t, clientSpace: { ...t.clientSpace, loginRequired: t.driverSpace.loginRequired } }} onOpenLogin={onOpenLogin} />
        )}
      </section>
    </div>
  )
}
