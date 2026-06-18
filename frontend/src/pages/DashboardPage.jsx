import PageNavbar from '../components/navigation/PageNavbar'
import { ClientPageIntro, ContactButton, LoginRequiredPanel } from '../components/shared/ClientPanels'
import { getInitials, getPersonName } from '../utils/formatters'

export default function DashboardPage({
  clientSession,
  data,
  isArabic,
  isDark,
  status,
  t,
  onNavigate,
  onOpenRegister,
  onOpenLogin,
  onLogout,
  onToggleLanguage,
  onToggleTheme,
}) {
  return (
    <div className="standalone-page client-page dashboard-shell">
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

      <section className="client-workspace dashboard-page">
        <ClientPageIntro
          label={t.clientSpace.dashboardLabel}
          title={t.clientSpace.dashboardTitle}
          text={t.clientSpace.dashboardText}
        />

        {clientSession ? (
          <div className="dashboard-grid">
            <section className="dashboard-panel">
              <h2>{t.nav.book}</h2>
              {status.type === 'loading' && <p className="muted-line">{t.clientSpace.loading}</p>}
              {status.type === 'error' && <p className="form-message error">{status.message}</p>}
              {data.bookings.length ? (
                <div className="order-list">
                  {data.bookings.map((booking) => (
                    <article className="order-card" key={booking.id}>
                      <div>
                        <strong>{booking.pickup_address}</strong>
                        <span>{booking.destination_address}</span>
                      </div>
                      <div className="order-meta">
                        <span>{booking.vehicle_category}</span>
                        <span>{booking.weight_kg} KG</span>
                        <span>{booking.status}</span>
                      </div>
                      {booking.driver && (
                        <ContactButton label={t.clientSpace.callDriver} person={booking.driver} />
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="muted-line">{t.clientSpace.noOrders}</p>
              )}
            </section>

            <section className="dashboard-panel">
              <h2>Drivers</h2>
              {data.drivers.length ? (
                <div className="driver-list">
                  {data.drivers.map((driver) => (
                    <article className="driver-card" key={driver.id}>
                      <div className="driver-avatar">{getInitials(driver)}</div>
                      <div>
                        <strong>{getPersonName(driver)}</strong>
                        <span>{driver.vehicle_category} - {driver.vehicle_number}</span>
                      </div>
                      <ContactButton label={t.clientSpace.callDriver} person={driver} />
                    </article>
                  ))}
                </div>
              ) : (
                <p className="muted-line">{t.clientSpace.noDrivers}</p>
              )}
            </section>
          </div>
        ) : (
          <LoginRequiredPanel t={t} onOpenLogin={onOpenLogin} />
        )}
      </section>
    </div>
  )
}
