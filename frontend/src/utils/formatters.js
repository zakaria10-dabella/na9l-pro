export function getPersonName(person) {
  return `${person?.first_name || ''} ${person?.last_name || ''}`.trim() || person?.email || 'Client'
}

export function getNavbarAccountName(person) {
  if (person?.role === 'admin') return person?.name?.split(' ')[0] || 'Zakaria'
  return getPersonName(person)
}

export function getInitials(person) {
  const first = person?.first_name?.[0] || ''
  const last = person?.last_name?.[0] || ''
  return `${first}${last}`.toUpperCase() || 'C'
}

export function formatMoney(value) {
  return Number(value || 0).toLocaleString('fr-FR', {
    maximumFractionDigits: 0,
  })
}

export function getWhatsappUrl(phone) {
  if (!phone) return ''

  let cleaned = String(phone).replace(/[^\d+]/g, '')

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1)
  }

  if (cleaned.startsWith('00')) {
    cleaned = cleaned.slice(2)
  }

  if (cleaned.startsWith('0')) {
    cleaned = `212${cleaned.slice(1)}`
  }

  return cleaned ? `https://wa.me/${cleaned}` : ''
}
