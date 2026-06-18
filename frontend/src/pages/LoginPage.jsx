import Icon from '../components/Icon'
import PageNavbar from '../components/PageNavbar'

function LoginPage({
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
  return (
    <div className="standalone-page login-shell">
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

      <section className="login-page">
        <div className="login-copy">
          <p>{t.loginPage.label}</p>
          <h1>{t.loginPage.title}</h1>
          <span>{t.loginPage.text}</span>
        </div>

        <div className="login-panel">
          <img className="login-logo" src="/logo.png" alt="Na9l Pro" />
          <form className="register-form login-form" onSubmit={onSubmit}>
            <label>
              <span>{t.registerForm.email}</span>
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
              <span>{t.registerForm.password}</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                autoComplete="current-password"
                required
              />
            </label>

            <div className="form-footer">
              <button type="submit" disabled={status.type === 'saving'}>
                <Icon name="login" />
                <span>{status.type === 'saving' ? t.loginPage.saving : t.loginPage.submit}</span>
              </button>
              {status.type !== 'idle' && status.type !== 'saving' && (
                <p className={`form-message ${status.type}`}>{status.message}</p>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

export default LoginPage
