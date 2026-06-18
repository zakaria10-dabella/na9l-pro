import PageNavbar from '../components/navigation/PageNavbar'
import OpenStreetMapPanel from '../components/maps/OpenStreetMapPanel'
import { BookingSummary, ClientPageIntro, LoginRequiredPanel } from '../components/shared/ClientPanels'

export default function DriverMapPage({
  activeBooking,
  clientSession,
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

      <section className="client-workspace track-page">
        <ClientPageIntro
          label={t.driverSpace.mapLabel}
          title={t.driverSpace.mapTitle}
          text={t.driverSpace.mapText}
        />

        {clientSession?.role === 'driver' ? (
          <div className="track-grid">
            <OpenStreetMapPanel booking={activeBooking} viewerRole="driver" t={{ ...t.clientSpace, noBooking: t.driverSpace.noMission }} status={status} />
            <BookingSummary
              booking={activeBooking}
              contactLabel={t.driverSpace.callClient}
              contactPerson={activeBooking?.client}
              emptyText={t.driverSpace.noMission}
            />
          </div>
        ) : (
          <LoginRequiredPanel t={{ ...t, clientSpace: { ...t.clientSpace, loginRequired: t.driverSpace.loginRequired } }} onOpenLogin={onOpenLogin} />
        )}
      </section>
    </div>
  )
}
