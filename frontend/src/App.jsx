import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import Na9lProAnimation from './components/Na9lProAnimation'
import ProfileSettingsModal from './components/ProfileSettingsModal'
import Icon from './components/Icon'
import { ActionIcon, ClientBadge, ClientNavLinks, IconButton, NavLink } from './components/navigation/PageNavbar'
import { WorkflowCard } from './components/home/WorkflowCard'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import JourneyPage from './pages/JourneyPage'
import BookPage from './pages/BookPage'
import TrackPage from './pages/TrackPage'
import DashboardPage from './pages/DashboardPage'
import DriverCommandsPage from './pages/DriverCommandsPage'
import DriverMapPage from './pages/DriverMapPage'
import DriverDashboardPage from './pages/DriverDashboardPage'
import AdminPage from './pages/AdminPage'
import { apiFetch } from './services/api'
import {
  copy,
  getViewFromPath,
  initialAdminProfileForm,
  initialBookingForm,
  initialLoginForm,
  initialPasswordForm,
  initialRegisterForm,
  readStoredClient,
  routes,
} from './config/appConfig'
import './App.css'

function App() {
  const pageRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState('dark')
  const [language, setLanguage] = useState('fr')
  const [view, setView] = useState(getViewFromPath)
  const [registerForm, setRegisterForm] = useState(initialRegisterForm)
  const [registerStatus, setRegisterStatus] = useState({ type: 'idle', message: '' })
  const [loginForm, setLoginForm] = useState(initialLoginForm)
  const [loginStatus, setLoginStatus] = useState({ type: 'idle', message: '' })
  const [clientSession, setClientSession] = useState(readStoredClient)
  const [bookingForm, setBookingForm] = useState(initialBookingForm)
  const [bookingStatus, setBookingStatus] = useState({ type: 'idle', message: '' })
  const [dashboardData, setDashboardData] = useState({ client: null, bookings: [], drivers: [] })
  const [dashboardStatus, setDashboardStatus] = useState({ type: 'idle', message: '' })
  const [activeBooking, setActiveBooking] = useState(null)
  const [trackStatus, setTrackStatus] = useState({ type: 'idle', message: '' })
  const [driverCommands, setDriverCommands] = useState([])
  const [driverCommandsStatus, setDriverCommandsStatus] = useState({ type: 'idle', message: '' })
  const [activeDriverBooking, setActiveDriverBooking] = useState(null)
  const [driverTrackStatus, setDriverTrackStatus] = useState({ type: 'idle', message: '' })
  const [driverDashboardData, setDriverDashboardData] = useState({
    driver: null,
    bookings: [],
    clients: [],
    stats: { jobs: 0, earnings: 0, clients: 0 },
  })
  const [driverDashboardStatus, setDriverDashboardStatus] = useState({ type: 'idle', message: '' })
  const [profilePanel, setProfilePanel] = useState(null)
  const [profileForm, setProfileForm] = useState({
    first_name: clientSession?.first_name || '',
    last_name: clientSession?.last_name || '',
    phone: clientSession?.phone || '',
    email: clientSession?.email || '',
    vehicle_number: clientSession?.vehicle_number || '',
    vehicle_category: clientSession?.vehicle_category || 'A',
  })
  const [profileStatus, setProfileStatus] = useState({ type: 'idle', message: '' })
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm)
  const [passwordStatus, setPasswordStatus] = useState({ type: 'idle', message: '' })
  const [adminData, setAdminData] = useState({
    admin: null,
    stats: {},
    clients: [],
    drivers: [],
    bookings: [],
  })
  const [adminStatus, setAdminStatus] = useState({ type: 'idle', message: '' })
  const [adminEdit, setAdminEdit] = useState(null)
  const [adminProfileForm, setAdminProfileForm] = useState(initialAdminProfileForm)

  const isDark = theme === 'dark'
  const isArabic = language === 'ar'
  const t = copy[language]

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')
  const toggleLanguage = () => setLanguage(isArabic ? 'fr' : 'ar')

  useEffect(() => {
    const handlePopState = () => {
      setView(getViewFromPath())
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const handleProfileAction = (event) => {
      if (!clientSession) return

      if (event.detail === 'profile') {
        if (clientSession.role === 'admin') {
          setAdminProfileForm({
            name: clientSession.name || '',
            email: clientSession.email || '',
          })
        } else {
          setProfileForm({
            first_name: clientSession.first_name || '',
            last_name: clientSession.last_name || '',
            phone: clientSession.phone || '',
            email: clientSession.email || '',
            vehicle_number: clientSession.vehicle_number || '',
            vehicle_category: clientSession.vehicle_category || 'A',
          })
        }
        setProfileStatus({ type: 'idle', message: '' })
        setProfilePanel('profile')
      }

      if (event.detail === 'password') {
        setPasswordForm(initialPasswordForm)
        setPasswordStatus({ type: 'idle', message: '' })
        setProfilePanel('password')
      }
    }

    window.addEventListener('na9l-profile-action', handleProfileAction)
    return () => window.removeEventListener('na9l-profile-action', handleProfileAction)
  }, [clientSession])

  useEffect(() => {
    if (!clientSession || !['client', 'driver'].includes(clientSession.role) || !navigator.geolocation) {
      return
    }

    let isCurrent = true
    let lastSentAt = 0
    const locationPath = clientSession.role === 'driver'
      ? `/drivers/${clientSession.id}/location`
      : `/clients/${clientSession.id}/location`

    const sendAccountLocation = (position) => {
      const now = Date.now()
      const nextLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }

      if (now - lastSentAt < 10000) {
        return
      }

      lastSentAt = now

      apiFetch(locationPath, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextLocation),
      }).catch(() => {
        if (isCurrent) lastSentAt = 0
      })
    }

    const watchId = navigator.geolocation.watchPosition(
      sendAccountLocation,
      () => {},
      {
        enableHighAccuracy: true,
        maximumAge: 8000,
        timeout: 15000,
      },
    )

    return () => {
      isCurrent = false
      navigator.geolocation.clearWatch(watchId)
    }
  }, [clientSession])

  useEffect(() => {
    if (!clientSession || clientSession.role !== 'admin' || view !== 'admin') {
      return
    }

    let isCurrent = true
    apiFetch(`/admin/dashboard`, {
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.message || t.adminSpace.error)
        return data
      })
      .then((data) => {
        if (!isCurrent) return
        setAdminData({
          admin: data.admin || clientSession,
          stats: data.stats || {},
          clients: data.clients || [],
          drivers: data.drivers || [],
          bookings: data.bookings || [],
        })
        setAdminStatus({ type: 'idle', message: '' })
      })
      .catch((error) => {
        if (!isCurrent) return
        setAdminStatus({ type: 'error', message: error.message || t.adminSpace.error })
      })

    return () => {
      isCurrent = false
    }
  }, [clientSession, t.adminSpace.error, view])

  useEffect(() => {
    if (!clientSession || clientSession.role !== 'client' || view !== 'dashboard') {
      return
    }

    let isCurrent = true

    apiFetch(`/clients/${clientSession.id}/dashboard`, {
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(data.message || t.clientSpace.error)
        }
        return data
      })
      .then((data) => {
        if (!isCurrent) return
        setDashboardData({
          client: data.client || clientSession,
          bookings: data.bookings || [],
          drivers: data.drivers || [],
        })
        setDashboardStatus({ type: 'idle', message: '' })
      })
      .catch((error) => {
        if (!isCurrent) return
        setDashboardStatus({ type: 'error', message: error.message || t.clientSpace.error })
      })

    return () => {
      isCurrent = false
    }
  }, [clientSession, t.clientSpace.error, view])

  useEffect(() => {
    if (!clientSession || clientSession.role !== 'client' || view !== 'track') {
      return
    }

    let isCurrent = true

    const loadActiveBooking = () => {
      apiFetch(`/clients/${clientSession.id}/active-booking`, {
        headers: { Accept: 'application/json' },
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}))
          if (!response.ok) {
            throw new Error(data.message || t.clientSpace.error)
          }
          return data
        })
        .then((data) => {
          if (!isCurrent) return
          setActiveBooking(data.booking || null)
          setTrackStatus({ type: 'idle', message: '' })
        })
        .catch((error) => {
          if (!isCurrent) return
          setTrackStatus({ type: 'error', message: error.message || t.clientSpace.error })
        })
    }

    loadActiveBooking()
    const refreshTimer = window.setInterval(loadActiveBooking, 5000)

    return () => {
      isCurrent = false
      window.clearInterval(refreshTimer)
    }
  }, [clientSession, t.clientSpace.error, view])

  useEffect(() => {
    if (!clientSession || clientSession.role !== 'driver' || view !== 'driverCommands') {
      return
    }

    let isCurrent = true

    const loadDriverCommands = () => {
      apiFetch(`/drivers/${clientSession.id}/commands`, {
        headers: { Accept: 'application/json' },
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}))
          if (!response.ok) {
            throw new Error(data.message || t.driverSpace.error)
          }
          return data
        })
        .then((data) => {
          if (!isCurrent) return
          setDriverCommands(data.bookings || [])
          setDriverCommandsStatus((current) => (
            current.type === 'saving' ? current : { type: 'idle', message: '' }
          ))
        })
        .catch((error) => {
          if (!isCurrent) return
          setDriverCommandsStatus({ type: 'error', message: error.message || t.driverSpace.error })
        })
    }

    loadDriverCommands()
    const refreshTimer = window.setInterval(loadDriverCommands, 5000)

    return () => {
      isCurrent = false
      window.clearInterval(refreshTimer)
    }
  }, [clientSession, t.driverSpace.error, view])

  useEffect(() => {
    if (!clientSession || clientSession.role !== 'driver' || view !== 'driverMap') {
      return
    }

    let isCurrent = true

    const loadActiveDriverBooking = () => {
      apiFetch(`/drivers/${clientSession.id}/active-booking`, {
        headers: { Accept: 'application/json' },
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}))
          if (!response.ok) {
            throw new Error(data.message || t.driverSpace.error)
          }
          return data
        })
        .then((data) => {
          if (!isCurrent) return
          setActiveDriverBooking(data.booking || null)
          setDriverTrackStatus({ type: 'idle', message: '' })
        })
        .catch((error) => {
          if (!isCurrent) return
          setDriverTrackStatus({ type: 'error', message: error.message || t.driverSpace.error })
        })
    }

    loadActiveDriverBooking()
    const refreshTimer = window.setInterval(loadActiveDriverBooking, 5000)

    return () => {
      isCurrent = false
      window.clearInterval(refreshTimer)
    }
  }, [clientSession, t.driverSpace.error, view])

  useEffect(() => {
    if (!clientSession || clientSession.role !== 'driver' || view !== 'driverDashboard') {
      return
    }

    let isCurrent = true
    apiFetch(`/drivers/${clientSession.id}/dashboard`, {
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(data.message || t.driverSpace.error)
        }
        return data
      })
      .then((data) => {
        if (!isCurrent) return
        setDriverDashboardData({
          driver: data.driver || clientSession,
          bookings: data.bookings || [],
          clients: data.clients || [],
          stats: data.stats || { jobs: 0, earnings: 0, clients: 0 },
        })
        setDriverDashboardStatus({ type: 'idle', message: '' })
      })
      .catch((error) => {
        if (!isCurrent) return
        setDriverDashboardStatus({ type: 'error', message: error.message || t.driverSpace.error })
      })

    return () => {
      isCurrent = false
    }
  }, [clientSession, t.driverSpace.error, view])

  const navigateTo = (nextView, event) => {
    event?.preventDefault()
    if (nextView === 'dashboard' && clientSession) {
      setDashboardStatus({ type: 'loading', message: '' })
    }
    if (nextView === 'track' && clientSession) {
      setTrackStatus({ type: 'loading', message: '' })
    }
    if (nextView === 'driverCommands' && clientSession?.role === 'driver') {
      setDriverCommandsStatus({ type: 'loading', message: '' })
    }
    if (nextView === 'driverMap' && clientSession?.role === 'driver') {
      setDriverTrackStatus({ type: 'loading', message: '' })
    }
    if (nextView === 'driverDashboard' && clientSession?.role === 'driver') {
      setDriverDashboardStatus({ type: 'loading', message: '' })
    }
    window.history.pushState(null, '', routes[nextView])
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const openRegisterPage = (event) => {
    event?.preventDefault()
    setRegisterStatus({ type: 'idle', message: '' })
    setView('register-loading')
    window.history.pushState(null, '', routes.register)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const openLoginPage = (event) => {
    event?.preventDefault()
    setLoginStatus({ type: 'idle', message: '' })
    setView('login-loading')
    window.history.pushState(null, '', routes.login)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const openHomePage = (event) => {
    navigateTo('home', event)
  }

  const updateRegisterForm = (event) => {
    const { name, value } = event.target

    setRegisterForm((current) => {
      const next = { ...current, [name]: value }

      if (name === 'role' && value === 'client') {
        next.vehicle_number = ''
        next.vehicle_category = 'A'
      }

      return next
    })

    if (registerStatus.type !== 'idle') {
      setRegisterStatus({ type: 'idle', message: '' })
    }
  }

  const updateLoginForm = (event) => {
    const { name, value } = event.target
    setLoginForm((current) => ({ ...current, [name]: value }))

    if (loginStatus.type !== 'idle') {
      setLoginStatus({ type: 'idle', message: '' })
    }
  }

  const submitLoginForm = async (event) => {
    event.preventDefault()
    setLoginStatus({ type: 'saving', message: '' })

    try {
      const loginPayload = {
        email: loginForm.email.trim(),
        password: loginForm.password,
      }
      const loginRequest = (path) => apiFetch(`${path}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      })

      let response = await loginRequest('/admin/login')
      let data = await response.json().catch(() => ({}))

      if (!response.ok) {
        response = await loginRequest('/login')
        data = await response.json().catch(() => ({}))
      }

      if (!response.ok) {
        const firstError = data.errors ? Object.values(data.errors).flat()[0] : null
        throw new Error(firstError || data.message || t.loginPage.error)
      }

      const account = { ...(data.account || data.client), role: data.role || 'client' }
      window.localStorage.setItem('na9l_account', JSON.stringify(account))
      window.localStorage.removeItem('na9l_client')
      setClientSession(account)
      setLoginForm(initialLoginForm)
      setLoginStatus({ type: 'success', message: t.loginPage.success })
      navigateTo(account.role === 'admin' ? 'admin' : account.role === 'driver' ? 'driverCommands' : 'home')
    } catch (error) {
      setLoginStatus({ type: 'error', message: error.message || t.loginPage.error })
    }
  }

  const updateBookingForm = (event) => {
    const { name, value } = event.target
    setBookingForm((current) => ({ ...current, [name]: value }))

    if (bookingStatus.type !== 'idle') {
      setBookingStatus({ type: 'idle', message: '' })
    }
  }

  const submitBookingForm = async (event) => {
    event.preventDefault()

    if (!clientSession || clientSession.role !== 'client') {
      setBookingStatus({ type: 'error', message: t.clientSpace.loginRequired })
      return
    }

    setBookingStatus({ type: 'saving', message: '' })

    try {
      const pickupAddress = bookingForm.pickup_address.trim()
      const destinationAddress = bookingForm.destination_address.trim()
      const [pickupPoint, destinationPoint] = await Promise.all([
        geocodeBookingAddress(pickupAddress),
        geocodeBookingAddress(destinationAddress),
      ])

      const response = await apiFetch(`/bookings`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientSession.id,
          pickup_address: pickupAddress,
          pickup_latitude: pickupPoint?.latitude || null,
          pickup_longitude: pickupPoint?.longitude || null,
          destination_address: destinationAddress,
          destination_latitude: destinationPoint?.latitude || null,
          destination_longitude: destinationPoint?.longitude || null,
          vehicle_category: bookingForm.vehicle_category,
          weight_kg: Number(bookingForm.weight_kg),
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const firstError = data.errors ? Object.values(data.errors).flat()[0] : null
        throw new Error(firstError || data.message || t.clientSpace.error)
      }

      setBookingForm(initialBookingForm)
      setActiveBooking(data.booking || null)
      setBookingStatus({ type: 'success', message: t.clientSpace.success })
      navigateTo('track')
    } catch (error) {
      setBookingStatus({ type: 'error', message: error.message || t.clientSpace.error })
    }
  }

  const closeProfilePanel = () => {
    setProfilePanel(null)
    setProfileStatus({ type: 'idle', message: '' })
    setPasswordStatus({ type: 'idle', message: '' })
  }

  const updateProfileForm = (event) => {
    const { name, value } = event.target
    setProfileForm((current) => ({ ...current, [name]: value }))

    if (profileStatus.type !== 'idle') {
      setProfileStatus({ type: 'idle', message: '' })
    }
  }

  const updatePasswordForm = (event) => {
    const { name, value } = event.target
    setPasswordForm((current) => ({ ...current, [name]: value }))

    if (passwordStatus.type !== 'idle') {
      setPasswordStatus({ type: 'idle', message: '' })
    }
  }

  const updateAdminProfileForm = (event) => {
    const { name, value } = event.target
    setAdminProfileForm((current) => ({ ...current, [name]: value }))

    if (profileStatus.type !== 'idle') {
      setProfileStatus({ type: 'idle', message: '' })
    }
  }

  const submitProfileForm = async (event) => {
    event.preventDefault()
    if (!clientSession) return

    setProfileStatus({ type: 'saving', message: '' })

    try {
      if (clientSession.role === 'admin') {
        const response = await apiFetch(`/admin/profile`, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: adminProfileForm.name.trim(),
            email: adminProfileForm.email.trim(),
          }),
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          const firstError = data.errors ? Object.values(data.errors).flat()[0] : null
          throw new Error(firstError || data.message || t.profile.profileError)
        }

        const updatedAccount = { ...data.admin, role: 'admin' }
        window.localStorage.setItem('na9l_account', JSON.stringify(updatedAccount))
        setClientSession(updatedAccount)
        setAdminData((current) => ({ ...current, admin: updatedAccount }))
        setProfileStatus({ type: 'success', message: t.profile.profileSuccess })
        return
      }

      const isDriver = clientSession.role === 'driver'
      const endpoint = isDriver
        ? `/drivers/${clientSession.id}/profile`
        : `/clients/${clientSession.id}/profile`
      const payload = {
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        phone: profileForm.phone.trim(),
        email: profileForm.email.trim(),
      }

      if (isDriver) {
        payload.vehicle_number = profileForm.vehicle_number.trim()
        payload.vehicle_category = profileForm.vehicle_category
      }

      const response = await apiFetch(endpoint, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const firstError = data.errors ? Object.values(data.errors).flat()[0] : null
        throw new Error(firstError || data.message || t.profile.profileError)
      }

      const updatedAccount = { ...(isDriver ? data.driver : data.client), role: clientSession.role }
      window.localStorage.setItem('na9l_account', JSON.stringify(updatedAccount))
      window.localStorage.removeItem('na9l_client')
      setClientSession(updatedAccount)
      if (isDriver) {
        setDriverDashboardData((current) => ({ ...current, driver: updatedAccount }))
      } else {
        setDashboardData((current) => ({ ...current, client: updatedAccount }))
      }
      setProfileStatus({ type: 'success', message: t.profile.profileSuccess })
    } catch (error) {
      setProfileStatus({ type: 'error', message: error.message || t.profile.profileError })
    }
  }

  const submitPasswordForm = async (event) => {
    event.preventDefault()
    if (!clientSession) return

    setPasswordStatus({ type: 'saving', message: '' })

    try {
      const endpoint = clientSession.role === 'admin'
        ? `/admin/password`
        : clientSession.role === 'driver'
        ? `/drivers/${clientSession.id}/password`
        : `/clients/${clientSession.id}/password`

      const response = await apiFetch(endpoint, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordForm),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const firstError = data.errors ? Object.values(data.errors).flat()[0] : null
        throw new Error(firstError || data.message || t.profile.passwordError)
      }

      setPasswordForm(initialPasswordForm)
      setPasswordStatus({ type: 'success', message: t.profile.passwordSuccess })
    } catch (error) {
      setPasswordStatus({ type: 'error', message: error.message || t.profile.passwordError })
    }
  }

  const logoutClient = () => {
    window.localStorage.removeItem('na9l_account')
    window.localStorage.removeItem('na9l_client')
    setClientSession(null)
    setProfilePanel(null)
    setDashboardData({ client: null, bookings: [], drivers: [] })
    setActiveBooking(null)
    setDriverCommands([])
    setActiveDriverBooking(null)
    setDriverDashboardData({ driver: null, bookings: [], clients: [], stats: { jobs: 0, earnings: 0, clients: 0 } })
    setAdminData({ admin: null, stats: {}, clients: [], drivers: [], bookings: [] })
    setAdminEdit(null)
    navigateTo('home')
  }

  const refreshAdminDashboard = async () => {
    const response = await apiFetch(`/admin/dashboard`, {
      headers: { Accept: 'application/json' },
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.message || t.adminSpace.error)
    setAdminData({
      admin: data.admin || clientSession,
      stats: data.stats || {},
      clients: data.clients || [],
      drivers: data.drivers || [],
      bookings: data.bookings || [],
    })
  }

  const saveAdminItem = async (type, item) => {
    setAdminStatus({ type: 'saving', message: '' })

    try {
      const endpoint = type === 'client'
        ? `/admin/clients/${item.id}`
        : type === 'driver'
        ? `/admin/drivers/${item.id}`
        : `/admin/bookings/${item.id}`

      const response = await apiFetch(endpoint, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        const firstError = data.errors ? Object.values(data.errors).flat()[0] : null
        throw new Error(firstError || data.message || t.adminSpace.error)
      }

      await refreshAdminDashboard()
      setAdminEdit(null)
      setAdminStatus({ type: 'success', message: t.adminSpace.success })
    } catch (error) {
      setAdminStatus({ type: 'error', message: error.message || t.adminSpace.error })
    }
  }

  const deleteAdminItem = async (type, item) => {
    if (!window.confirm(t.adminSpace.confirmDelete)) return
    setAdminStatus({ type: 'saving', message: '' })

    try {
      const endpoint = type === 'client'
        ? `/admin/clients/${item.id}`
        : type === 'driver'
        ? `/admin/drivers/${item.id}`
        : `/admin/bookings/${item.id}`

      const response = await apiFetch(endpoint, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || t.adminSpace.error)

      await refreshAdminDashboard()
      setAdminStatus({ type: 'success', message: t.adminSpace.success })
    } catch (error) {
      setAdminStatus({ type: 'error', message: error.message || t.adminSpace.error })
    }
  }

  const acceptDriverCommand = async (booking) => {
    if (!clientSession || clientSession.role !== 'driver') {
      setDriverCommandsStatus({ type: 'error', message: t.driverSpace.loginRequired })
      return
    }

    setDriverCommandsStatus({ type: 'saving', message: '' })

    try {
      const response = await apiFetch(`/drivers/${clientSession.id}/bookings/${booking.id}/accept`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (response.status === 409) {
          setDriverCommands((current) => current.filter((item) => item.id !== booking.id))
        }
        throw new Error(data.message || t.driverSpace.error)
      }

      setActiveDriverBooking(data.booking || null)
      setDriverCommands((current) => current.filter((item) => item.id !== booking.id))
      setDriverCommandsStatus({ type: 'success', message: t.driverSpace.success })
      navigateTo('driverMap')
    } catch (error) {
      setDriverCommandsStatus({ type: 'error', message: error.message || t.driverSpace.error })
    }
  }

  const submitRegisterForm = async (event) => {
    event.preventDefault()
    setRegisterStatus({ type: 'saving', message: '' })

    const payload = {
      first_name: registerForm.first_name.trim(),
      last_name: registerForm.last_name.trim(),
      phone: registerForm.phone.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password,
      role: registerForm.role,
      vehicle_number: registerForm.role === 'driver' ? registerForm.vehicle_number.trim() : null,
      vehicle_category: registerForm.role === 'driver' ? registerForm.vehicle_category : null,
    }

    try {
      const response = await apiFetch(`/register`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const firstError = data.errors ? Object.values(data.errors).flat()[0] : null
        throw new Error(firstError || data.message || t.registerForm.error)
      }

      setRegisterForm(initialRegisterForm)
      setRegisterStatus({ type: 'success', message: t.registerForm.success })
      const account = { ...(data.account || data.client || data.driver), role: data.role || payload.role }
      window.localStorage.setItem('na9l_account', JSON.stringify(account))
      window.localStorage.removeItem('na9l_client')
      setClientSession(account)
      navigateTo(account.role === 'driver' ? 'driverCommands' : 'home')
    } catch (error) {
      setRegisterStatus({ type: 'error', message: error.message || t.registerForm.error })
    }
  }

  useGSAP(
    () => {
      if (loading || view !== 'home' || !pageRef.current) {
        return
      }

      const isCompact = window.matchMedia('(max-width: 760px)').matches
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      timeline
        .from('.home-navbar', { y: -18, opacity: 0, duration: 0.6 })
        .from('.home-hero > *', { y: 22, opacity: 0, duration: 0.62, stagger: 0.08 }, '-=0.25')
        .from('.hero-stats article', { y: 16, opacity: 0, duration: 0.48, stagger: 0.08 }, '-=0.28')

      if (isCompact) {
        gsap.set('.steps-heading > *, .steps-visual, .workflow-card', { opacity: 1, clearProps: 'transform,visibility' })
      } else {
        timeline
          .from('.steps-heading > *', { y: 18, opacity: 0, duration: 0.48, stagger: 0.08 }, '-=0.15')
          .from('.steps-visual', { y: 30, opacity: 0, duration: 0.7 }, '-=0.1')
          .from('.workflow-card', { y: 24, opacity: 0, duration: 0.58, stagger: 0.1 }, '-=0.45')
      }

      const workflowCards = gsap.utils.toArray('.workflow-card')
      const positions = isCompact
        ? [
            { y: 0, x: 0, scale: 1, autoAlpha: 1, filter: 'blur(0px)', zIndex: 4 },
            { y: 190, x: 0, scale: 0.94, autoAlpha: 0, filter: 'blur(1px)', zIndex: 2 },
            { y: 260, x: 0, scale: 0.86, autoAlpha: 0, filter: 'blur(3px)', zIndex: 0 },
            { y: -130, x: 0, scale: 0.91, autoAlpha: 0, filter: 'blur(1px)', zIndex: 1 },
          ]
        : [
            { y: 0, x: 0, scale: 1, autoAlpha: 1, filter: 'blur(0px)', zIndex: 4 },
            { y: 222, x: 40, scale: 0.92, autoAlpha: 0.28, filter: 'blur(1px)', zIndex: 2 },
            { y: 326, x: 70, scale: 0.86, autoAlpha: 0, filter: 'blur(3px)', zIndex: 0 },
            { y: -176, x: 36, scale: 0.9, autoAlpha: 0.24, filter: 'blur(1px)', zIndex: 1 },
          ]

      if (workflowCards.length) {
        let activeIndex = 0
        const getPosition = (cardIndex, nextActiveIndex = activeIndex) => {
          const delta = (cardIndex - nextActiveIndex + workflowCards.length) % workflowCards.length
          if (delta === 0) return positions[0]
          if (delta === 1) return positions[1]
          if (delta === workflowCards.length - 1) return positions[3]
          return positions[2]
        }

        workflowCards.forEach((card, index) => {
          gsap.set(card, getPosition(index))
        })

        const stackTimeline = gsap.timeline({ repeat: -1, repeatDelay: 0.7 })

        workflowCards.forEach(() => {
          const nextIndex = (activeIndex + 1) % workflowCards.length

          stackTimeline.to(
            workflowCards,
            {
              duration: 0.8,
              ease: 'power3.inOut',
              y: (index) => getPosition(index, nextIndex).y,
              x: (index) => getPosition(index, nextIndex).x,
              scale: (index) => getPosition(index, nextIndex).scale,
              autoAlpha: (index) => getPosition(index, nextIndex).autoAlpha,
              filter: (index) => getPosition(index, nextIndex).filter,
              zIndex: (index) => getPosition(index, nextIndex).zIndex,
            },
            '+=1.7',
          )

          activeIndex = nextIndex
        })
      }
    },
    { scope: pageRef, dependencies: [loading, language, view] },
  )

  useGSAP(
    () => {
      if (loading || view !== 'admin' || !document.querySelector('.admin-workspace')) {
        return
      }

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.admin-workspace .client-page-intro > *', { y: 20, opacity: 0, duration: 0.5, stagger: 0.08 })
        .from('.admin-stat-grid button', { y: 18, opacity: 0, duration: 0.45, stagger: 0.05 }, '-=0.25')
        .from('.admin-panel', { y: 24, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.18')
        .from('.admin-row', { x: -14, opacity: 0, duration: 0.36, stagger: 0.025 }, '-=0.28')
    },
    { dependencies: [loading, view] },
  )

  const profileSettingsModal = (
    <ProfileSettingsModal
      accountRole={clientSession?.role || 'client'}
      adminProfileForm={adminProfileForm}
      mode={profilePanel}
      passwordForm={passwordForm}
      passwordStatus={passwordStatus}
      profileForm={profileForm}
      profileStatus={profileStatus}
      t={t}
      onChangePassword={updatePasswordForm}
      onChangeProfile={updateProfileForm}
      onChangeAdminProfile={updateAdminProfileForm}
      onClose={closeProfilePanel}
      onSubmitPassword={submitPasswordForm}
      onSubmitProfile={submitProfileForm}
    />
  )

  if (!loading && view === 'register-loading') {
    return (
      <main className={`app-shell ${theme}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="floating-controls" aria-label="Display controls">
          <IconButton
            label={isArabic ? 'Passer au francais' : 'Passer en arabe'}
            onClick={toggleLanguage}
            icon="language"
          />
          <IconButton
            label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
            onClick={toggleTheme}
            icon={isDark ? 'sun' : 'moon'}
          />
        </div>

        <Na9lProAnimation theme={theme} onComplete={() => setView('register')} />
      </main>
    )
  }

  if (!loading && view === 'login-loading') {
    return (
      <main className={`app-shell ${theme}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="floating-controls" aria-label="Display controls">
          <IconButton
            label={isArabic ? 'Passer au francais' : 'Passer en arabe'}
            onClick={toggleLanguage}
            icon="language"
          />
          <IconButton
            label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
            onClick={toggleTheme}
            icon={isDark ? 'sun' : 'moon'}
          />
        </div>

        <Na9lProAnimation theme={theme} onComplete={() => setView('login')} />
      </main>
    )
  }

  if (!loading && view === 'register') {
    return (
      <main className={`app-shell ${theme}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <RegisterPage
          clientSession={clientSession}
          form={registerForm}
          isDark={isDark}
          isArabic={isArabic}
          routes={routes}
          status={registerStatus}
          t={t}
          onChange={updateRegisterForm}
          onNavigate={navigateTo}
          onOpenRegister={openRegisterPage}
          onOpenLogin={openLoginPage}
          onLogout={logoutClient}
          onSubmit={submitRegisterForm}
          onToggleLanguage={toggleLanguage}
          onToggleTheme={toggleTheme}
        />
        {profileSettingsModal}
      </main>
    )
  }

  if (!loading && (view === 'client' || view === 'driver')) {
    return (
      <main className="app-shell light" dir={isArabic ? 'rtl' : 'ltr'}>
        <JourneyPage
          isDark={false}
          isArabic={isArabic}
          clientSession={clientSession}
          page={view}
          t={t}
          onNavigate={navigateTo}
          onOpenRegister={openRegisterPage}
          onOpenLogin={openLoginPage}
          onLogout={logoutClient}
          onToggleLanguage={toggleLanguage}
          onToggleTheme={toggleTheme}
        />
        {profileSettingsModal}
      </main>
    )
  }

  if (!loading && view === 'book') {
    return (
      <main className={`app-shell ${theme}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <BookPage
          bookingForm={bookingForm}
          clientSession={clientSession}
          isArabic={isArabic}
          isDark={isDark}
          status={bookingStatus}
          t={t}
          onChange={updateBookingForm}
          onNavigate={navigateTo}
          onOpenRegister={openRegisterPage}
          onOpenLogin={openLoginPage}
          onLogout={logoutClient}
          onSubmit={submitBookingForm}
          onToggleLanguage={toggleLanguage}
          onToggleTheme={toggleTheme}
        />
        {profileSettingsModal}
      </main>
    )
  }

  if (!loading && view === 'track') {
    return (
      <main className={`app-shell ${theme}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <TrackPage
          activeBooking={activeBooking}
          clientSession={clientSession}
          isArabic={isArabic}
          isDark={isDark}
          status={trackStatus}
          t={t}
          onNavigate={navigateTo}
          onOpenRegister={openRegisterPage}
          onOpenLogin={openLoginPage}
          onLogout={logoutClient}
          onToggleLanguage={toggleLanguage}
          onToggleTheme={toggleTheme}
        />
        {profileSettingsModal}
      </main>
    )
  }

  if (!loading && view === 'dashboard') {
    return (
      <main className={`app-shell ${theme}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <DashboardPage
          clientSession={clientSession}
          data={dashboardData}
          isArabic={isArabic}
          isDark={isDark}
          status={dashboardStatus}
          t={t}
          onNavigate={navigateTo}
          onOpenRegister={openRegisterPage}
          onOpenLogin={openLoginPage}
          onLogout={logoutClient}
          onToggleLanguage={toggleLanguage}
          onToggleTheme={toggleTheme}
        />
        {profileSettingsModal}
      </main>
    )
  }

  if (!loading && view === 'driverCommands') {
    return (
      <main className={`app-shell ${theme}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <DriverCommandsPage
          commands={driverCommands}
          clientSession={clientSession}
          isArabic={isArabic}
          isDark={isDark}
          status={driverCommandsStatus}
          t={t}
          onAccept={acceptDriverCommand}
          onNavigate={navigateTo}
          onOpenRegister={openRegisterPage}
          onOpenLogin={openLoginPage}
          onLogout={logoutClient}
          onToggleLanguage={toggleLanguage}
          onToggleTheme={toggleTheme}
        />
        {profileSettingsModal}
      </main>
    )
  }

  if (!loading && view === 'driverMap') {
    return (
      <main className={`app-shell ${theme}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <DriverMapPage
          activeBooking={activeDriverBooking}
          clientSession={clientSession}
          isArabic={isArabic}
          isDark={isDark}
          status={driverTrackStatus}
          t={t}
          onNavigate={navigateTo}
          onOpenRegister={openRegisterPage}
          onOpenLogin={openLoginPage}
          onLogout={logoutClient}
          onToggleLanguage={toggleLanguage}
          onToggleTheme={toggleTheme}
        />
        {profileSettingsModal}
      </main>
    )
  }

  if (!loading && view === 'driverDashboard') {
    return (
      <main className={`app-shell ${theme}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <DriverDashboardPage
          clientSession={clientSession}
          data={driverDashboardData}
          isArabic={isArabic}
          isDark={isDark}
          status={driverDashboardStatus}
          t={t}
          onNavigate={navigateTo}
          onOpenRegister={openRegisterPage}
          onOpenLogin={openLoginPage}
          onLogout={logoutClient}
          onToggleLanguage={toggleLanguage}
          onToggleTheme={toggleTheme}
        />
        {profileSettingsModal}
      </main>
    )
  }

  if (!loading && view === 'admin') {
    return (
      <main className={`app-shell ${theme}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <AdminPage
          adminEdit={adminEdit}
          clientSession={clientSession}
          data={adminData}
          isArabic={isArabic}
          isDark={isDark}
          status={adminStatus}
          t={t}
          onDelete={deleteAdminItem}
          onEdit={setAdminEdit}
          onNavigate={navigateTo}
          onOpenRegister={openRegisterPage}
          onOpenLogin={openLoginPage}
          onLogout={logoutClient}
          onSave={saveAdminItem}
          onToggleLanguage={toggleLanguage}
          onToggleTheme={toggleTheme}
        />
        {profileSettingsModal}
      </main>
    )
  }

  if (!loading && view === 'login') {
    return (
      <main className={`app-shell ${theme}`} dir={isArabic ? 'rtl' : 'ltr'}>
        <LoginPage
          clientSession={clientSession}
          form={loginForm}
          isDark={isDark}
          isArabic={isArabic}
          routes={routes}
          status={loginStatus}
          t={t}
          onChange={updateLoginForm}
          onNavigate={navigateTo}
          onOpenRegister={openRegisterPage}
          onOpenLogin={openLoginPage}
          onLogout={logoutClient}
          onSubmit={submitLoginForm}
          onToggleLanguage={toggleLanguage}
          onToggleTheme={toggleTheme}
        />
        {profileSettingsModal}
      </main>
    )
  }

  return (
    <main className={`app-shell ${theme}`} dir={isArabic ? 'rtl' : 'ltr'}>
      {loading ? (
        <>
          <div className="floating-controls" aria-label="Display controls">
            <IconButton
              label={isArabic ? 'Passer au francais' : 'Passer en arabe'}
              onClick={toggleLanguage}
              icon="language"
            />
            <IconButton
              label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
              onClick={toggleTheme}
              icon={isDark ? 'sun' : 'moon'}
            />
          </div>

          <Na9lProAnimation theme={theme} onComplete={() => setLoading(false)} />
        </>
      ) : (
        <div ref={pageRef}>
          <section className="home-page" id="home">
            <nav className="home-navbar" aria-label="Main navigation">
              <a className="home-brand" href={routes.home} onClick={openHomePage}>
                <img src="/logo.png" alt="Na9l Pro" />
              </a>

            <div className="home-navlinks">
              {clientSession ? (
                <ClientNavLinks account={clientSession} t={t} onNavigate={navigateTo} />
              ) : (
                <>
                  <NavLink href={routes.home} icon="home" label={t.nav.home} onClick={(event) => navigateTo('home', event)} />
                  <NavLink href={routes.client} icon="box" label={t.nav.client} onClick={(event) => navigateTo('client', event)} />
                  <NavLink href={routes.driver} icon="truck" label={t.nav.driver} onClick={(event) => navigateTo('driver', event)} />
                </>
              )}
            </div>

            <div className="home-actions">
              {clientSession && <ClientBadge client={clientSession} t={t} onNavigate={navigateTo} />}
                <IconButton
                  label={isArabic ? 'Passer au francais' : 'Passer en arabe'}
                  onClick={toggleLanguage}
                  icon="language"
                />
              <IconButton
                label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
                onClick={toggleTheme}
                icon={isDark ? 'sun' : 'moon'}
              />
              {clientSession ? (
                <IconButton label={t.nav.logout} onClick={logoutClient} icon="logout" />
              ) : (
                <>
                  <ActionIcon href={routes.login} icon="login" label={t.nav.login} onClick={openLoginPage} />
                  <a
                    className="primary-action icon-action"
                    href={routes.register}
                    aria-label={t.nav.register}
                    data-tooltip={t.nav.register}
                    onClick={openRegisterPage}
                  >
                    <Icon name="user" />
                  </a>
                </>
              )}
            </div>
            </nav>

            <div className="home-hero">
              <p>{t.hero.eyebrow}</p>
              <h1>{t.hero.title}</h1>
              <span>{t.hero.text}</span>

            <div className="hero-actions">
              <a href={routes.register} onClick={openRegisterPage}>{t.hero.primary}</a>
              <a href={routes.client} onClick={(event) => navigateTo('client', event)}>{t.hero.secondary}</a>
            </div>

            <div className="hero-badges">
              {t.badges.map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </div>
          </div>

          <div className="hero-stats" aria-label="Na9l Pro highlights">
            {t.stats.map((stat) => (
              <article key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
          </section>

          <section className="steps-section" id="steps">
            <div className="steps-heading">
              <p>{t.process.label}</p>
              <h2>{t.process.title}</h2>
            </div>

            <div className="steps-visual">
              <img src="/section steps.png" alt="Na9l Pro delivery workflow" />
              <div className="workflow-stack" aria-label={t.process.title}>
                {t.workflow.map((card) => (
                  <WorkflowCard key={card.title} card={card} />
                ))}
              </div>
            </div>
          </section>

        </div>
      )}
      {profileSettingsModal}
    </main>
  )
}

async function geocodeBookingAddress(address) {
  if (!address) return null

  const knownPoint = getKnownMoroccoPlace(address)

  if (knownPoint) {
    return {
      latitude: knownPoint[0],
      longitude: knownPoint[1],
    }
  }

  const params = new URLSearchParams({
    format: 'jsonv2',
    q: `${address}, Casablanca, Morocco`,
    countrycodes: 'ma',
    limit: '1',
    addressdetails: '0',
  })

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    })
    const data = await response.json()
    const match = data?.[0]

    if (!match) return null

    return {
      latitude: Number(match.lat),
      longitude: Number(match.lon),
    }
  } catch {
    return null
  }
}

const KNOWN_BOOKING_PLACES = {
  maarif: [33.5866, -7.6359],
  'sidi moumen': [33.5833, -7.5167],
  'sidi momen': [33.5833, -7.5167],
  'sidi maarouf': [33.5249, -7.6405],
  lissasfa: [33.5167, -7.678],
  lisasfa: [33.5167, -7.678],
}

function getKnownMoroccoPlace(address) {
  const normalizedAddress = String(address)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')

  const placeName = Object.keys(KNOWN_BOOKING_PLACES)
    .find((name) => normalizedAddress.includes(name))

  return placeName ? KNOWN_BOOKING_PLACES[placeName] : null
}

export default App
