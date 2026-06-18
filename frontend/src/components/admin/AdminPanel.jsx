import Icon from '../Icon'
import { getPersonName } from '../../utils/formatters'

export default function AdminPanel({ adminEdit, drivers = [], items, title, type, t, onDelete, onEdit, onSave }) {
  const icon = type === 'booking' ? 'requests' : type === 'driver' ? 'truck' : 'user'

  return (
    <section className="dashboard-panel admin-panel" data-admin-type={type} id={`admin-${type}`}>
      <div className="admin-panel-head">
        <div className="admin-panel-title">
          <span><Icon name={icon} /></span>
          <div>
            <p>{type === 'booking' ? t.adminSpace.requests : title}</p>
            <h2>{title}</h2>
          </div>
        </div>
        <strong>{items.length}</strong>
      </div>
      {items.length ? (
        <div className="admin-list">
          {items.map((item) => (
            <AdminRow
              drivers={drivers}
              isEditing={adminEdit?.type === type && adminEdit?.item?.id === item.id}
              item={adminEdit?.type === type && adminEdit?.item?.id === item.id ? adminEdit.item : item}
              key={item.id}
              t={t}
              type={type}
              onCancel={() => onEdit(null)}
              onChange={(nextItem) => onEdit({ type, item: nextItem })}
              onDelete={() => onDelete(type, item)}
              onEdit={() => onEdit({ type, item: { ...item, password: '' } })}
              onSave={(nextItem) => onSave(type, nextItem)}
            />
          ))}
        </div>
      ) : (
        <p className="muted-line">No data</p>
      )}
    </section>
  )
}

function AdminRow({ drivers, isEditing, item, t, type, onCancel, onChange, onDelete, onEdit, onSave }) {
  const update = (field, value) => onChange({ ...item, [field]: value })
  const meta = getAdminItemMeta(item, type, t)
  const status = getAdminStatus(item, type, t)

  if (isEditing) {
    return (
      <article className="admin-row editing">
        <div className="admin-edit-grid">
          {type !== 'booking' ? (
            <>
              <input value={item.first_name || ''} onChange={(event) => update('first_name', event.target.value)} />
              <input value={item.last_name || ''} onChange={(event) => update('last_name', event.target.value)} />
              <input value={item.phone || ''} onChange={(event) => update('phone', event.target.value)} />
              <input value={item.email || ''} onChange={(event) => update('email', event.target.value)} />
              {type === 'driver' && (
                <>
                  <input value={item.vehicle_number || ''} onChange={(event) => update('vehicle_number', event.target.value)} />
                  <select value={item.vehicle_category || 'A'} onChange={(event) => update('vehicle_category', event.target.value)}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </>
              )}
              <input placeholder={t.registerForm.password} type="text" value={item.password || ''} onChange={(event) => update('password', event.target.value)} />
              <small>{t.adminSpace.passwordHint}</small>
            </>
          ) : (
            <>
              <input value={item.pickup_address || ''} onChange={(event) => update('pickup_address', event.target.value)} />
              <input value={item.destination_address || ''} onChange={(event) => update('destination_address', event.target.value)} />
              <select value={item.vehicle_category || 'A'} onChange={(event) => update('vehicle_category', event.target.value)}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
              <input type="number" value={item.weight_kg || ''} onChange={(event) => update('weight_kg', event.target.value)} />
              <select value={item.status || 'pending'} onChange={(event) => update('status', event.target.value)}>
                <option value="pending">pending</option>
                <option value="accepted">accepted</option>
                <option value="assigned">assigned</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </select>
              <select value={item.driver_id || ''} onChange={(event) => update('driver_id', event.target.value || null)}>
                <option value="">{t.adminSpace.noDriver}</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>{getPersonName(driver)}</option>
                ))}
              </select>
            </>
          )}
        </div>
        <div className="admin-actions">
          <button type="button" onClick={() => onSave(item)}>{t.adminSpace.save}</button>
          <button type="button" onClick={onCancel}>{t.adminSpace.cancel}</button>
        </div>
      </article>
    )
  }

  return (
    <article className={`admin-row admin-row-${type}`}>
      <div className="admin-row-main">
        <div className="admin-row-kicker">
          <span>{type === 'booking' ? `REQ-${item.id}` : `ID-${item.id}`}</span>
          {status && <strong className={`admin-status ${status.key}`}>{status.label}</strong>}
        </div>
        <h3>{getAdminItemTitle(item, type)}</h3>
        <p>{getAdminItemSubtitle(item, type, t)}</p>
        <div className="admin-meta-list">
          {meta.map((entry) => (
            <span key={entry.label}>
              <b>{entry.label}</b>
              {entry.value || '-'}
            </span>
          ))}
        </div>
      </div>
      <div className="admin-actions">
        <button type="button" onClick={onEdit}>{t.adminSpace.edit}</button>
        <button type="button" onClick={onDelete}>{t.adminSpace.delete}</button>
      </div>
    </article>
  )
}

function getAdminItemTitle(item, type) {
  if (type === 'booking') return item.pickup_address || `Request ${item.id}`
  return getPersonName(item)
}

function getAdminItemSubtitle(item, type, t) {
  if (type === 'booking') {
    return `${getPersonName(item.client)} -> ${item.destination_address || '-'}`
  }

  if (type === 'driver') {
    return `${item.vehicle_category || '-'} | ${item.vehicle_number || '-'}`
  }

  return item.email || t.adminSpace.clients
}

function getAdminStatus(item, type, t) {
  if (type !== 'booking') {
    return { key: type, label: type === 'driver' ? t.adminSpace.drivers : t.adminSpace.clients }
  }

  const key = item.status || 'pending'
  const labels = {
    pending: t.adminSpace.pending,
    accepted: t.adminSpace.accepted,
    assigned: t.adminSpace.accepted,
    delivered: t.adminSpace.delivered,
    cancelled: 'Annulee',
  }

  return { key, label: labels[key] || key }
}

function getAdminItemMeta(item, type, t) {
  if (type === 'booking') {
    return [
      { label: 'Client', value: getPersonName(item.client) },
      { label: 'Phone', value: item.client?.phone },
      { label: 'Destination', value: item.destination_address },
      { label: 'Driver', value: item.driver ? getPersonName(item.driver) : t.adminSpace.noDriver },
      { label: 'Vehicule', value: item.vehicle_category },
      { label: 'Poids', value: `${item.weight_kg || 0} KG` },
    ]
  }

  const base = [
    { label: 'Email', value: item.email },
    { label: 'Phone', value: item.phone },
    { label: t.adminSpace.passwordStatus, value: item.password_value || 'Non disponible - reset' },
  ]

  if (type === 'driver') {
    return [
      ...base,
      { label: 'Vehicule', value: `${item.vehicle_category || '-'} | ${item.vehicle_number || '-'}` },
    ]
  }

  return base
}
