import Icon from '../components/Icon'
import PageNavbar from '../components/PageNavbar'

function RegisterPage({
  clientSession,
  form,
  isArabic,
  isDark,
  routes,
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
  const registerPageClass = `register-page register-page--${form.role}`

  return (
    <div className={registerPageClass}>
      <PageNavbar
        clientSession={clientSession}
        isArabic={isArabic}
        isDark={isDark}
        routes={routes}
        t={t}
        onNavigate={onNavigate}
        onOpenRegister={onOpenRegister}
        onOpenLogin={onOpenLogin}
        onLogout={onLogout}
        onToggleLanguage={onToggleLanguage}
        onToggleTheme={onToggleTheme}
      />

      <RegisterSection
        form={form}
        status={status}
        t={t.registerForm}
        onChange={onChange}
        onSubmit={onSubmit}
      />
    </div>
  )
}

function RegisterSection({ form, status, t, onChange, onSubmit }) {
  const isDriver = form.role === 'driver'

  return (
    <section className="register-section" id="register">
      <div className="register-copy">
        <p>{t.label}</p>
        <h2>{t.title}</h2>
        <span>{t.text}</span>
      </div>

      <form className="register-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label>
            <span>{t.firstName}</span>
            <input
              name="first_name"
              type="text"
              value={form.first_name}
              onChange={onChange}
              autoComplete="given-name"
              required
            />
          </label>

          <label>
            <span>{t.lastName}</span>
            <input
              name="last_name"
              type="text"
              value={form.last_name}
              onChange={onChange}
              autoComplete="family-name"
              required
            />
          </label>

          <label>
            <span>{t.phone}</span>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={onChange}
              autoComplete="tel"
              required
            />
          </label>

          <label>
            <span>{t.email}</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              required
            />
          </label>

          <label>
            <span>{t.password}</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              autoComplete="new-password"
              minLength="6"
              required
            />
          </label>
        </div>

        <fieldset className="role-choice">
          <legend>{t.role}</legend>
          <label>
            <input
              type="radio"
              name="role"
              value="client"
              checked={form.role === 'client'}
              onChange={onChange}
            />
            <span>{t.client}</span>
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="driver"
              checked={isDriver}
              onChange={onChange}
            />
            <span>{t.driver}</span>
          </label>
        </fieldset>

        {isDriver && (
          <div className="driver-fields">
            <label>
              <span>{t.vehicleNumber}</span>
              <input
                name="vehicle_number"
                type="text"
                value={form.vehicle_number}
                onChange={onChange}
                required
              />
            </label>

            <label>
              <span>{t.vehicleCategory}</span>
              <select
                name="vehicle_category"
                value={form.vehicle_category}
                onChange={onChange}
                required
              >
                <option value="A">{t.categories.A}</option>
                <option value="B">{t.categories.B}</option>
                <option value="C">{t.categories.C}</option>
              </select>
            </label>
          </div>
        )}

        <div className="form-footer">
          <button type="submit" disabled={status.type === 'saving'}>
            <Icon name="check" />
            <span>{status.type === 'saving' ? t.saving : t.submit}</span>
          </button>

          {status.type !== 'idle' && status.type !== 'saving' && (
            <p className={`form-message ${status.type}`}>{status.message}</p>
          )}
        </div>
      </form>
    </section>
  )
}

export default RegisterPage
