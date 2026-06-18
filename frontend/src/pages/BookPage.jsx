import Icon from '../components/Icon'
import PageNavbar from '../components/navigation/PageNavbar'
import { ClientPageIntro, LoginRequiredPanel } from '../components/shared/ClientPanels'

export default function BookPage({
  bookingForm,
  clientSession,
  isArabic,
  isDark,
  status,
  t,
  onChange,
  onNavigate,
  onOpenRegister,
  onOpenLogin,
  onLogout,
  onSubmit,
  onToggleLanguage,
  onToggleTheme,
}) {
  return (
    <div className="standalone-page client-page book-shell">
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

      <section className="client-workspace book-page">
        <ClientPageIntro
          label={t.clientSpace.bookingLabel}
          title={t.clientSpace.bookingTitle}
          text={t.clientSpace.bookingText}
        />

        {clientSession?.role === 'client' ? (
          <form className="register-form booking-form" onSubmit={onSubmit}>
            <label>
              <span>{t.clientSpace.pickup}</span>
              <input
                name="pickup_address"
                type="text"
                value={bookingForm.pickup_address}
                onChange={onChange}
                autoComplete="street-address"
                required
              />
            </label>

            <label>
              <span>{t.clientSpace.destination}</span>
              <input
                name="destination_address"
                type="text"
                value={bookingForm.destination_address}
                onChange={onChange}
                autoComplete="street-address"
                required
              />
            </label>

            <div className="form-grid">
              <label>
                <span>{t.clientSpace.category}</span>
                <select
                  name="vehicle_category"
                  value={bookingForm.vehicle_category}
                  onChange={onChange}
                  required
                >
                  <option value="A">{t.registerForm.categories.A}</option>
                  <option value="B">{t.registerForm.categories.B}</option>
                  <option value="C">{t.registerForm.categories.C}</option>
                </select>
              </label>

              <label>
                <span>{t.clientSpace.weight}</span>
                <input
                  name="weight_kg"
                  type="number"
                  min="1"
                  step="0.1"
                  value={bookingForm.weight_kg}
                  onChange={onChange}
                  required
                />
              </label>
            </div>

            <div className="form-footer">
              <button type="submit" disabled={status.type === 'saving'}>
                <Icon name="book" />
                <span>{status.type === 'saving' ? t.clientSpace.saving : t.clientSpace.submit}</span>
              </button>

              {status.type !== 'idle' && status.type !== 'saving' && (
                <p className={`form-message ${status.type}`}>{status.message}</p>
              )}
            </div>
          </form>
        ) : (
          <LoginRequiredPanel t={t} onOpenLogin={onOpenLogin} />
        )}
      </section>
    </div>
  )
}
