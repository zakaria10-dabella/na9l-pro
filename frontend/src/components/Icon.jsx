function Icon({ name }) {
  if (name === 'language') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M3.6 9h16.8M3.6 15h16.8M12 3c2.4 2.6 3.6 5.6 3.6 9s-1.2 6.4-3.6 9M12 3C9.6 5.6 8.4 8.6 8.4 12s1.2 6.4 3.6 9" />
      </svg>
    )
  }

  if (name === 'sun') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    )
  }

  if (name === 'moon') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.2 15.7A8.5 8.5 0 0 1 8.3 3.8 8.7 8.7 0 1 0 20.2 15.7Z" />
      </svg>
    )
  }

  if (name === 'box') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m3.5 7.5 8.5-4 8.5 4-8.5 4-8.5-4Z" />
        <path d="M3.5 7.5v9l8.5 4 8.5-4v-9M12 11.5v9" />
      </svg>
    )
  }

  if (name === 'truck') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 7h11v9H3zM14 10h3l3 3v3h-6z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    )
  }

  if (name === 'route') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <path d="M8.5 6h3.2a3.8 3.8 0 0 1 0 7.6H9.8a3.2 3.2 0 0 0 0 6.4H15" />
      </svg>
    )
  }

  if (name === 'check') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12.2 2.6 2.7L16.8 9" />
      </svg>
    )
  }

  if (name === 'login') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" />
        <path d="M3 12h10M10 9l3 3-3 3" />
      </svg>
    )
  }

  if (name === 'user') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.6-4 4.2-6 8-6s6.4 2 8 6" />
      </svg>
    )
  }

  if (name === 'book') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
        <path d="M8 4v13a3 3 0 0 0 3 3M9 8h6M9 12h5" />
      </svg>
    )
  }

  if (name === 'map') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 18 3.8 20.5V6.5L9 4m0 14 6 2.5m-6-2.5V4m6 16.5 5.2-2.5V4L15 6.5m0 14V6.5M15 6.5 9 4" />
      </svg>
    )
  }

  if (name === 'dashboard') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 13a8 8 0 1 1 16 0v6H4z" />
        <path d="M12 13 16 8M7.5 14h.1M16.5 14h.1M12 6v1.5" />
      </svg>
    )
  }

  if (name === 'requests') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 4h12v16H6z" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      </svg>
    )
  }

  if (name === 'phone') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.6 4.8 9 4l2.1 5-1.5 1a10.8 10.8 0 0 0 4.4 4.4l1-1.5 5 2.1-.8 2.4c-.4 1.1-1.6 1.8-2.8 1.5A18 18 0 0 1 5.1 7.6c-.3-1.2.4-2.4 1.5-2.8Z" />
      </svg>
    )
  }

  if (name === 'logout') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 7V5a2 2 0 0 0-2-2H5v18h8a2 2 0 0 0 2-2v-2" />
        <path d="M10 12h10M17 9l3 3-3 3" />
      </svg>
    )
  }

  if (name === 'chevron') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m7 10 5 5 5-5" />
      </svg>
    )
  }

  if (name === 'close') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5V21H4z" />
      <path d="M9 21v-6h6v6" />
    </svg>
  )
}

export default Icon
