import PageNavbar from '../components/navigation/PageNavbar'
import { routes } from '../config/appConfig'

export default function JourneyPage({
  clientSession,
  isArabic,
  isDark,
  page,
  t,
  onNavigate,
  onOpenRegister,
  onOpenLogin,
  onLogout,
  onToggleLanguage,
  onToggleTheme,
}) {
  const content = t[page]
  const image = page === 'client' ? '/client backround image.jpg' : '/driver bachround image.jpg'

  return (
    <div className="standalone-page">
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

      <section className="journey-page">
        <div className="journey-copy">
          <p>{content.label}</p>
          <h1>{content.title}</h1>
          <div className="step-list page-step-list">
            {content.steps.map((step, index) => (
              <article key={step}>
                <strong>{String(index + 1).padStart(2, '0')}</strong>
                <span>{step}</span>
              </article>
            ))}
          </div>
          <a className="journey-action" href={routes.register} onClick={onOpenRegister}>{t.hero.primary}</a>
        </div>

        <div className="journey-media">
          <img src={image} alt={content.title} />
        </div>
      </section>
    </div>
  )
}
