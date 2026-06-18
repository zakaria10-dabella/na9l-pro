import PageNavbar from '../components/navigation/PageNavbar'
import { ClientPageIntro, ContactButton, LoginRequiredPanel } from '../components/shared/ClientPanels'
import { formatMoney, getInitials, getPersonName } from '../utils/formatters'

export default function DriverDashboardPage({
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
  const driver = data.driver || clientSession

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

      <section className="client-workspace dashboard-page">
        <ClientPageIntro
          label={t.driverSpace.dashboardLabel}
          title={t.driverSpace.dashboardTitle}
          text={t.driverSpace.dashboardText}
        />

        {clientSession?.role === 'driver' ? (
          <>
            <div className="driver-stat-grid">
              <article>
                <strong>{data.stats.jobs}</strong>
                <span>{t.driverSpace.jobs}</span>
              </article>
              <article>
                <strong>{formatMoney(data.stats.earnings)} MAD</strong>
                <span>{t.driverSpace.earnings}</span>
              </article>
              <article>
                <strong>{data.stats.clients}</strong>
                <span>{t.driverSpace.clients}</span>
              </article>
            </div>

            <div className="dashboard-grid">
              <section className="dashboard-panel">
                <h2>{t.nav.commands}</h2>
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
                          <span>{getPersonName(booking.client)}</span>
                          <span>{formatMoney(booking.earning_amount)} MAD</span>
                          <span>{booking.status}</span>
                        </div>
                        <ContactButton label={t.driverSpace.callClient} person={booking.client} />
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="muted-line">{t.driverSpace.noMission}</p>
                )}
              </section>

              <section className="dashboard-panel">
                <h2>{t.driverSpace.driverInfo}</h2>
                <div className="driver-info-list">
                  <p><strong>{getPersonName(driver)}</strong><span>{driver?.email}</span></p>
                  <p><strong>{driver?.phone}</strong><span>{t.driverSpace.driverInfo}</span></p>
                  <p><strong>{driver?.vehicle_number}</strong><span>{t.driverSpace.vehicleInfo} {driver?.vehicle_category}</span></p>
                </div>

                <h2>{t.driverSpace.clients}</h2>
                {data.clients.length ? (
                  <div className="driver-list">
                    {data.clients.map((client) => (
                      <article className="driver-card" key={client.id}>
                        <div className="driver-avatar">{getInitials(client)}</div>
                        <div>
                          <strong>{getPersonName(client)}</strong>
                          <span>{client.email}</span>
                        </div>
                        <ContactButton label={t.driverSpace.callClient} person={client} />
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="muted-line">{t.clientSpace.noDrivers}</p>
                )}
              </section>
            </div>
          </>
        ) : (
          <LoginRequiredPanel t={{ ...t, clientSpace: { ...t.clientSpace, loginRequired: t.driverSpace.loginRequired } }} onOpenLogin={onOpenLogin} />
        )}
      </section>
    </div>
  )
}
