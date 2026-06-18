import PageNavbar from '../components/navigation/PageNavbar'
import OpenStreetMapPanel from '../components/maps/OpenStreetMapPanel'
import { BookingSummary, ClientPageIntro, LoginRequiredPanel } from '../components/shared/ClientPanels'

export default function TrackPage({
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
    <div className="standalone-page client-page track-shell">
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
          label={t.clientSpace.trackLabel}
          title={t.clientSpace.trackTitle}
          text={t.clientSpace.trackText}
        />

        {clientSession ? (
          <div className="track-grid">
            <OpenStreetMapPanel booking={activeBooking} viewerRole="client" t={t.clientSpace} status={status} />
            <BookingSummary
              booking={activeBooking}
              contactLabel={t.clientSpace.callDriver}
              contactPerson={activeBooking?.driver}
              emptyText={t.clientSpace.noBooking}
            />
          </div>
        ) : (
          <LoginRequiredPanel t={t} onOpenLogin={onOpenLogin} />
        )}
      </section>
    </div>
  )
}
