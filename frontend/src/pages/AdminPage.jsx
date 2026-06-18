import { useState } from 'react'
import PageNavbar from '../components/navigation/PageNavbar'
import AdminPanel from '../components/admin/AdminPanel'
import Icon from '../components/Icon'
import { ClientPageIntro, LoginRequiredPanel } from '../components/shared/ClientPanels'

export default function AdminPage({
  adminEdit,
  clientSession,
  data,
  isArabic,
  isDark,
  status,
  t,
  onDelete,
  onEdit,
  onNavigate,
  onOpenRegister,
  onOpenLogin,
  onLogout,
  onSave,
  onToggleLanguage,
  onToggleTheme,
}) {
  const [activeSection, setActiveSection] = useState('overview')
  const statCards = [
    { key: 'clients', section: 'clients', label: t.adminSpace.clients, value: data.stats.clients || 0, icon: 'user' },
    { key: 'drivers', section: 'drivers', label: t.adminSpace.drivers, value: data.stats.drivers || 0, icon: 'truck' },
    { key: 'requests', section: 'requests', label: t.adminSpace.requests, value: data.stats.requests || 0, icon: 'requests' },
    { key: 'pending', section: 'requests', label: t.adminSpace.pending, value: data.stats.pending || 0, icon: 'dashboard' },
    { key: 'accepted', section: 'requests', label: t.adminSpace.accepted, value: data.stats.accepted || 0, icon: 'check' },
    { key: 'delivered', section: 'requests', label: t.adminSpace.delivered, value: data.stats.delivered || 0, icon: 'route' },
  ]
  const adminSections = [
    { key: 'overview', label: 'Overview', icon: 'dashboard' },
    { key: 'clients', label: t.adminSpace.clients, icon: 'user' },
    { key: 'drivers', label: t.adminSpace.drivers, icon: 'truck' },
    { key: 'requests', label: t.adminSpace.requests, icon: 'requests' },
  ]
  const chartBars = [
    data.stats.clients || 0,
    data.stats.drivers || 0,
    data.stats.requests || 0,
    data.stats.pending || 0,
    data.stats.accepted || 0,
    data.stats.delivered || 0,
  ]
  const maxChartValue = Math.max(...chartBars, 1)
  const activeAdminSection = adminSections.find((item) => item.key === activeSection)

  return (
    <div className="standalone-page admin-shell">
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

      <section className="admin-workspace">
        {clientSession?.role === 'admin' ? (
          <div className="admin-dashboard-frame">
            <aside className="admin-sidebar">
              <div className="admin-sidebar-brand">
                <img src="/logo.png" alt="" />
                <div>
                  <strong>Na9l Pro</strong>
                  <span>{t.adminSpace.label}</span>
                </div>
              </div>
              <nav aria-label="Admin sections">
                {adminSections.map((item) => (
                  <button
                    className={activeSection === item.key ? 'active' : ''}
                    key={item.key}
                    type="button"
                    onClick={() => setActiveSection(item.key)}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            <div className="admin-main-panel">
              {activeSection === 'overview' ? (
                <>
                  <div className="admin-platform-hero">
                    <ClientPageIntro label={t.adminSpace.label} title={t.adminSpace.title} text={t.adminSpace.text} />
                    <aside className="admin-profile-card">
                      <span>Admin</span>
                      <strong>{data.admin?.name || clientSession?.name || 'Zakaria Admin'}</strong>
                      <small>{data.admin?.email || clientSession?.email || 'zakaria@gmail.com'}</small>
                    </aside>
                  </div>

                  <div className="admin-overview-grid">
                    <div className="driver-stat-grid admin-stat-grid">
                      {statCards.map((item) => (
                        <button
                          className={activeSection === item.section ? 'active' : ''}
                          key={item.key}
                          type="button"
                          onClick={() => setActiveSection(item.section)}
                        >
                          <span className="admin-stat-icon"><Icon name={item.icon} /></span>
                          <strong>{item.value}</strong>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>

                    <section className="admin-chart-card" aria-label="Admin activity">
                      <div>
                        <p>{t.adminSpace.requests}</p>
                        <strong>{data.stats.requests || 0}</strong>
                        <span>{t.adminSpace.pending}: {data.stats.pending || 0}</span>
                      </div>
                      <div className="admin-chart-bars">
                        {chartBars.map((value, index) => (
                          <i key={`${value}-${index}`} style={{ '--bar-height': `${Math.max(16, (value / maxChartValue) * 100)}%` }} />
                        ))}
                      </div>
                    </section>
                  </div>
                </>
              ) : (
                <div className="admin-section-focus">
                  <button type="button" onClick={() => setActiveSection('overview')}>
                    <Icon name="dashboard" />
                    <span>Overview</span>
                  </button>
                  <div>
                    <p>{t.adminSpace.label}</p>
                    <h1>{activeAdminSection?.label}</h1>
                  </div>
                </div>
              )}

              {status.type !== 'idle' && status.type !== 'loading' && (
                <p className={`form-message ${status.type}`}>{status.message}</p>
              )}

              {activeSection !== 'overview' && (
                <div className="admin-panel-grid single-section">
                  {activeSection === 'clients' && (
                    <AdminPanel
                      adminEdit={adminEdit}
                      items={data.clients}
                      title={t.adminSpace.clients}
                      type="client"
                      t={t}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onSave={onSave}
                    />
                  )}
                  {activeSection === 'drivers' && (
                    <AdminPanel
                      adminEdit={adminEdit}
                      items={data.drivers}
                      title={t.adminSpace.drivers}
                      type="driver"
                      t={t}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onSave={onSave}
                    />
                  )}
                  {activeSection === 'requests' && (
                    <AdminPanel
                      adminEdit={adminEdit}
                      drivers={data.drivers}
                      items={data.bookings}
                      title={t.adminSpace.requests}
                      type="booking"
                      t={t}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onSave={onSave}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <LoginRequiredPanel t={{ ...t, clientSpace: { ...t.clientSpace, loginRequired: t.adminSpace.label } }} onOpenLogin={onOpenLogin} />
        )}
      </section>
    </div>
  )
}
