import Icon from '../Icon'
import { routes } from '../../config/appConfig'
import { getNavbarAccountName } from '../../utils/formatters'

export default function PageNavbar({
  clientSession,
  isArabic,
  isDark,
  t,
  onNavigate,
  onOpenRegister,
  onOpenLogin,
  onLogout,
  onToggleLanguage,
  onToggleTheme,
}) {
  return (
    <nav className="page-navbar" aria-label="Page navigation">
      <a className="home-brand" href={routes.home} onClick={(event) => onNavigate('home', event)}>
        <img src="/logo.png" alt="Na9l Pro" />
      </a>

      <div className="home-navlinks">
        {clientSession ? (
          <ClientNavLinks account={clientSession} t={t} onNavigate={onNavigate} />
        ) : (
          <>
            <NavLink href={routes.home} icon="home" label={t.nav.home} onClick={(event) => onNavigate('home', event)} />
            <NavLink href={routes.client} icon="box" label={t.nav.client} onClick={(event) => onNavigate('client', event)} />
            <NavLink href={routes.driver} icon="truck" label={t.nav.driver} onClick={(event) => onNavigate('driver', event)} />
          </>
        )}
      </div>

      <div className="home-actions">
        {clientSession && <ClientBadge client={clientSession} t={t} onNavigate={onNavigate} />}
        <IconButton
          label={isArabic ? 'Passer au francais' : 'Passer en arabe'}
          onClick={onToggleLanguage}
          icon="language"
        />
        <IconButton
          label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
          onClick={onToggleTheme}
          icon={isDark ? 'sun' : 'moon'}
        />
        {clientSession ? (
          <IconButton label={t.nav.logout} onClick={onLogout} icon="logout" />
        ) : (
          <>
            <ActionIcon href={routes.login} icon="login" label={t.nav.login} onClick={onOpenLogin} />
            <a className="primary-action icon-action" href={routes.register} aria-label={t.nav.register} data-tooltip={t.nav.register} onClick={onOpenRegister}>
              <Icon name="user" />
            </a>
          </>
        )}
      </div>
    </nav>
  )
}

export function NavLink({ href, icon, label, onClick }) {
  return (
    <a href={href} aria-label={label} data-tooltip={label} onClick={onClick}>
      <Icon name={icon} />
    </a>
  )
}

export function ClientNavLinks({ account, t, onNavigate }) {
  if (account?.role === 'admin') {
    return (
      <>
        <NavLink href={routes.home} icon="home" label={t.nav.home} onClick={(event) => onNavigate('home', event)} />
        <NavLink href={routes.admin} icon="dashboard" label={t.nav.dashboard} onClick={(event) => onNavigate('admin', event)} />
      </>
    )
  }

  if (account?.role === 'driver') {
    return (
      <>
        <NavLink href={routes.home} icon="home" label={t.nav.home} onClick={(event) => onNavigate('home', event)} />
        <NavLink href={routes.driverCommands} icon="requests" label={t.nav.commands} onClick={(event) => onNavigate('driverCommands', event)} />
        <NavLink href={routes.driverDashboard} icon="dashboard" label={t.nav.dashboard} onClick={(event) => onNavigate('driverDashboard', event)} />
      </>
    )
  }

  return (
    <>
      <NavLink href={routes.home} icon="home" label={t.nav.home} onClick={(event) => onNavigate('home', event)} />
      <NavLink href={routes.book} icon="book" label={t.nav.book} onClick={(event) => onNavigate('book', event)} />
      <NavLink href={routes.track} icon="map" label={t.nav.track} onClick={(event) => onNavigate('track', event)} />
      <NavLink href={routes.dashboard} icon="dashboard" label={t.nav.dashboard} onClick={(event) => onNavigate('dashboard', event)} />
    </>
  )
}

export function ClientBadge({ client, t, onNavigate }) {
  const openProfileAction = (action) => {
    window.dispatchEvent(new CustomEvent('na9l-profile-action', { detail: action }))
  }
  const accountView = client?.role === 'admin' ? 'admin' : client?.role === 'driver' ? 'driverDashboard' : 'dashboard'

  return (
    <div className="client-profile">
      <button className="client-profile-trigger" type="button" aria-haspopup="menu">
        <img className="profile-avatar" src="/logo.png" alt="" />
        <span className="profile-name">{getNavbarAccountName(client)}</span>
        <Icon name="chevron" />
      </button>

      <div className="profile-menu" role="menu">
        <button type="button" role="menuitem" onClick={() => openProfileAction('profile')}>
          {t.profile.editProfile}
        </button>
        <button type="button" role="menuitem" onClick={() => openProfileAction('password')}>
          {t.profile.editPassword}
        </button>
        <button type="button" role="menuitem" onClick={(event) => onNavigate(accountView, event)}>
          {t.profile.manageAccount}
        </button>
      </div>
    </div>
  )
}

export function ActionIcon({ href, icon, label, onClick }) {
  return (
    <a className="icon-action" href={href} aria-label={label} data-tooltip={label} onClick={onClick}>
      <Icon name={icon} />
    </a>
  )
}

export function IconButton({ label, onClick, icon }) {
  return (
    <button type="button" aria-label={label} data-tooltip={label} onClick={onClick}>
      <Icon name={icon} />
    </button>
  )
}
