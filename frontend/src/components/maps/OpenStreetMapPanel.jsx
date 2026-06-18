import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Icon from '../Icon'
import { getPersonName } from '../../utils/formatters'

const CASABLANCA = { lat: 33.5731, lng: -7.5898 }
const CASABLANCA_CENTER = [CASABLANCA.lat, CASABLANCA.lng]
const MOROCCO_BOUNDS = L.latLngBounds(
  [27.5, -13.5],
  [36.2, -0.8],
)
const EMPTY_BOOKINGS = []
const KNOWN_MOROCCO_PLACES = {
  lissasfa: [33.5167, -7.678],
  lisasfa: [33.5167, -7.678],
  'sidi maarouf': [33.5249, -7.6405],
  maarif: [33.5866, -7.6359],
  'sidi moumen': [33.5833, -7.5167],
  'sidi momen': [33.5833, -7.5167],
  'ain diab': [33.5911, -7.6896],
  anfa: [33.5928, -7.6606],
  bernoussi: [33.6147, -7.4976],
  bernousi: [33.6147, -7.4976],
  'sidi bernoussi': [33.6147, -7.4976],
  bernousssi: [33.6147, -7.4976],
}

export default function OpenStreetMapPanel({
  booking,
  bookings = EMPTY_BOOKINGS,
  status,
  t,
  viewerRole = 'overview',
}) {
  const mapNodeRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  const renderVersionRef = useRef(0)
  const lastMapSignatureRef = useRef('')
  const [mapError, setMapError] = useState('')
  const mapText = useMemo(() => ({
    loading: t.loading,
    mapFallback: t.mapFallback,
    noBooking: t.noBooking,
  }), [t.loading, t.mapFallback, t.noBooking])
  const mapSignature = useMemo(
    () => JSON.stringify({
      booking: serializeBookingForMap(booking),
      bookings: bookings.map(serializeBookingForMap),
      viewerRole,
    }),
    [booking, bookings, viewerRole],
  )

  useEffect(() => {
    if (!mapNodeRef.current || mapRef.current) return

    const map = L.map(mapNodeRef.current, {
      center: CASABLANCA_CENTER,
      zoom: 12,
      minZoom: 6,
      maxBounds: MOROCCO_BOUNDS,
      maxBoundsViscosity: 1,
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      noWrap: true,
      bounds: MOROCCO_BOUNDS,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    mapRef.current = map
    layerRef.current = L.layerGroup().addTo(map)
    window.setTimeout(() => map.invalidateSize(), 120)

    return () => {
      renderVersionRef.current += 1
      lastMapSignatureRef.current = ''
      layerRef.current?.clearLayers()
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current

    if (!map || !layer) return
    if (lastMapSignatureRef.current === mapSignature) return

    lastMapSignatureRef.current = mapSignature
    map.invalidateSize()

    const renderVersion = renderVersionRef.current + 1
    renderVersionRef.current = renderVersion
    layer.clearLayers()
    setMapError('')

    const mapItems = booking ? [booking] : bookings

    if (!mapItems.length) {
      map.setView(CASABLANCA_CENTER, 12)
      return
    }

    const renderContext = {
      isCurrent: () => renderVersionRef.current === renderVersion,
      layer,
      map,
      setMapError,
      t: mapText,
      viewerRole,
    }

    if (booking) {
      renderActiveBooking(booking, renderContext)
      return
    }

    renderCommandBookings(bookings, renderContext)
  }, [booking, bookings, mapSignature, mapText, viewerRole])

  return (
    <div className="map-panel live-map-panel">
      <div className="real-map" ref={mapNodeRef} aria-label="Delivery map" />
      {!booking && !bookings.length && (
        <div className="map-empty-overlay">
          <Icon name="map" />
          <p>{status.type === 'loading' ? mapText.loading : mapText.noBooking}</p>
        </div>
      )}
      {mapError && <p className="map-status-message">{mapError}</p>}
    </div>
  )
}

function serializeBookingForMap(booking) {
  if (!booking) return null

  return {
    id: booking.id,
    pickup_address: booking.pickup_address,
    pickup_latitude: serializeCoordinate(booking.pickup_latitude),
    pickup_longitude: serializeCoordinate(booking.pickup_longitude),
    destination_address: booking.destination_address,
    destination_latitude: serializeCoordinate(booking.destination_latitude),
    destination_longitude: serializeCoordinate(booking.destination_longitude),
    status: booking.status,
    client: serializePersonLocation(booking.client),
    driver: serializePersonLocation(booking.driver),
    nearby_drivers: (booking.nearby_drivers || []).map(serializePersonLocation),
  }
}

function serializePersonLocation(person) {
  if (!person) return null

  return {
    id: person.id,
    first_name: person.first_name,
    last_name: person.last_name,
    current_latitude: serializeCoordinate(person.current_latitude),
    current_longitude: serializeCoordinate(person.current_longitude),
  }
}

function serializeCoordinate(value) {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? Number(numberValue.toFixed(5)) : null
}

async function renderActiveBooking(booking, context) {
  const { isCurrent, layer, map, setMapError, t, viewerRole } = context
  const [pickupLocation, destinationLocation] = await Promise.all([
    resolveBookingPickupPoint(booking),
    resolveBookingDestinationPoint(booking),
  ])

  if (!isCurrent()) return

  const pickupPoint = pickupLocation.point
  const destinationPoint = destinationLocation.point
  const clientPoint = getClientPoint(booking) || pickupPoint
  const clientMarkerPoint = viewerRole === 'driver' ? pickupPoint : clientPoint
  const driverPoint = getDriverPoint(booking.driver)
  const bounds = []

  if (viewerRole === 'client') {
    addPointMarker(layer, clientMarkerPoint, 'client', 'box', getPersonName(booking.client) || booking.pickup_address, bounds)

    if (driverPoint) {
      addPointMarker(layer, driverPoint, 'driver', 'truck', getPersonName(booking.driver), bounds)
    } else {
      addNearbyDriverMarkers(layer, booking.nearby_drivers || [], bounds)
    }

    fitMapToBounds(map, bounds)
    return
  }

  addPointMarker(layer, clientMarkerPoint, 'client', 'box', getPersonName(booking.client) || booking.pickup_address, bounds)
  addPointMarker(layer, destinationPoint, 'destination', 'pin', booking.destination_address, bounds)

  if (driverPoint) {
    addPointMarker(layer, driverPoint, 'driver', 'truck', getPersonName(booking.driver), bounds)
  }

  const routeStops = getRouteStops({ pickupPoint, destinationPoint })
  const hasRoute = await drawRoute(layer, routeStops, isCurrent)

  if (!isCurrent()) return

  fitMapToBounds(map, bounds.length ? bounds : routeStops)

  if (!hasRoute) {
    setMapError(t.mapFallback || 'Carte chargee. Le trajet exact est indisponible.')
  }

  if (pickupLocation.approximate || destinationLocation.approximate) {
    setMapError(t.mapFallback || 'Carte chargee avec une position approximative.')
  }
}

async function renderCommandBookings(bookings, context) {
  const { isCurrent, layer, map, setMapError, t } = context
  const items = await Promise.all(
    bookings.map(async (booking) => {
      const pickupLocation = await resolveBookingPickupPoint(booking)

      return { booking, pickupLocation }
    }),
  )

  if (!isCurrent()) return

  const bounds = []
  let hasApproximatePoint = false

  for (const { booking, pickupLocation } of items) {
    const pickupPoint = pickupLocation.point
    hasApproximatePoint ||= pickupLocation.approximate

    addPointMarker(layer, pickupPoint, 'request', 'box', `${getPersonName(booking.client)} - ${booking.pickup_address}`, bounds)
  }

  if (bounds.length) {
    fitMapToBounds(map, bounds)
  } else {
    setMapError(t.noBooking || 'No requests located on the map.')
  }

  if (hasApproximatePoint) {
    setMapError(t.mapFallback || 'Carte chargee avec des positions approximatives.')
  }
}

function getRouteStops({ pickupPoint, destinationPoint }) {
  return [pickupPoint, destinationPoint].filter(Boolean)
}

async function drawRoute(layer, stops, isCurrent) {
  if (stops.length < 2) return false

  const routePoints = await fetchOsrmRoute(stops).catch(() => [])

  if (!isCurrent()) return true

  if (routePoints.length > 1) {
    L.polyline(routePoints, {
      color: '#ef1f1f',
      opacity: 0.94,
      weight: 5,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(layer)
    return true
  }

  drawStraightLine(layer, stops, false)
  return false
}

function drawStraightLine(layer, points, dashed) {
  const moroccoPoints = points.filter(isPointInMorocco)

  if (moroccoPoints.length < 2) return

  L.polyline(moroccoPoints, {
    color: '#ef1f1f',
    opacity: dashed ? 0.52 : 0.8,
    weight: dashed ? 3 : 4,
    dashArray: dashed ? '6 8' : null,
  }).addTo(layer)
}

function addNearbyDriverMarkers(layer, drivers, bounds) {
  drivers.forEach((driver) => {
    const point = getDriverPoint(driver)
    if (!point) return
    addPointMarker(layer, point, 'driver', 'truck', getPersonName(driver), bounds)
  })
}

function addPointMarker(layer, point, type, icon, title, bounds) {
  if (!point || !isPointInMorocco(point)) return null

  const marker = L.marker(point, {
    icon: L.divIcon({
      className: `na9l-map-pin na9l-map-pin-${type}`,
      html: `<span>${getMarkerSvg(icon)}</span>`,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    }),
  }).addTo(layer)

  marker.bindPopup(title || type)
  bounds.push(point)
  return marker
}

function getMarkerSvg(icon) {
  if (icon === 'truck') {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 7h11v9H3zM14 10h3l3 3v3h-6z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    `
  }

  if (icon === 'box') {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m3.5 7.5 8.5-4 8.5 4-8.5 4-8.5-4Z" />
        <path d="M3.5 7.5v9l8.5 4 8.5-4v-9M12 11.5v9" />
      </svg>
    `
  }

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2" />
    </svg>
  `
}

function fitMapToBounds(map, points) {
  const usablePoints = points.filter(isPointInMorocco)

  map.invalidateSize()

  if (usablePoints.length > 1) {
    map.fitBounds(L.latLngBounds(usablePoints), { padding: [48, 48], maxZoom: 15, animate: false })
    return
  }

  map.setView(usablePoints[0] || CASABLANCA_CENTER, usablePoints.length ? 14 : 12, { animate: false })
}

async function resolveBookingPickupPoint(booking) {
  const knownPoint = findKnownPlace(normalizePlaceName(booking.pickup_address))
  const storedPoint = getPointFromCoordinates(booking.pickup_latitude, booking.pickup_longitude)

  if (knownPoint) return { point: knownPoint, approximate: false }
  if (storedPoint) return { point: storedPoint, approximate: false }

  return resolveMapPoint(booking.pickup_address, booking.id || 1)
}

async function resolveBookingDestinationPoint(booking) {
  const knownPoint = findKnownPlace(normalizePlaceName(booking.destination_address))
  const storedPoint = getPointFromCoordinates(booking.destination_latitude, booking.destination_longitude)

  if (knownPoint) return { point: knownPoint, approximate: false }
  if (storedPoint) return { point: storedPoint, approximate: false }

  return resolveMapPoint(booking.destination_address, (booking.id || 1) + 20)
}

function getClientPoint(booking) {
  return getPointFromCoordinates(booking.client?.current_latitude, booking.client?.current_longitude)
}

function getDriverPoint(driver) {
  return getPointFromCoordinates(driver?.current_latitude, driver?.current_longitude)
}

function getPointFromCoordinates(latitude, longitude) {
  const lat = Number(latitude)
  const lng = Number(longitude)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  const point = [lat, lng]

  return isPointInMorocco(point) ? point : null
}

async function resolveMapPoint(address, fallbackSeed = 0) {
  const point = await geocodeMoroccoAddress(address)

  if (point) {
    return { point, approximate: false }
  }

  return {
    point: getApproximateCasablancaPoint(address, fallbackSeed),
    approximate: true,
  }
}

async function geocodeMoroccoAddress(address) {
  if (!address) return null

  const normalizedAddress = normalizePlaceName(address)
  const knownPlace = findKnownPlace(normalizedAddress)

  if (knownPlace) return knownPlace

  const cacheKey = `na9l_geocode_${normalizedAddress}`
  const cached = window.sessionStorage.getItem(cacheKey)

  if (cached) {
    return JSON.parse(cached)
  }

  const searchQueries = getGeocodeQueries(address)
  let match = null

  for (const query of searchQueries) {
    const params = new URLSearchParams({
      format: 'jsonv2',
      q: query,
      countrycodes: 'ma',
      limit: '1',
      addressdetails: '0',
    })

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    })

    const data = await response.json().catch(() => [])
    match = data[0]

    if (match) break
  }

  if (!match) return null

  const point = [Number(match.lat), Number(match.lon)]

  if (!isPointInMorocco(point)) return null

  window.sessionStorage.setItem(cacheKey, JSON.stringify(point))
  return point
}

function findKnownPlace(normalizedAddress) {
  if (KNOWN_MOROCCO_PLACES[normalizedAddress]) {
    return KNOWN_MOROCCO_PLACES[normalizedAddress]
  }

  const placeName = Object.keys(KNOWN_MOROCCO_PLACES)
    .find((name) => normalizedAddress.includes(name))

  return placeName ? KNOWN_MOROCCO_PLACES[placeName] : null
}

function getApproximateCasablancaPoint(address, seed = 0) {
  const normalizedAddress = normalizePlaceName(address || `adresse ${seed}`)
  let hash = seed * 101

  for (let index = 0; index < normalizedAddress.length; index += 1) {
    hash = (hash * 31 + normalizedAddress.charCodeAt(index)) % 100000
  }

  const latOffset = ((hash % 81) - 40) / 1000
  const lngOffset = (((Math.floor(hash / 81) % 81) - 40) / 1000)

  const point = [
    Number((CASABLANCA.lat + latOffset).toFixed(6)),
    Number((CASABLANCA.lng + lngOffset).toFixed(6)),
  ]

  return isPointInMorocco(point) ? point : CASABLANCA_CENTER
}

function getGeocodeQueries(address) {
  const normalized = normalizePlaceName(address)
  const collapsed = normalized.replace(/(.)\1{2,}/g, '$1$1')
  const candidates = [address, normalized, collapsed]

  return [...new Set(candidates.flatMap((candidate) => [
    candidate,
    `${candidate}, Casablanca, Morocco`,
    `${candidate}, Morocco`,
  ]))]
}

function normalizePlaceName(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
}

async function fetchOsrmRoute(points) {
  const moroccoPoints = points.filter(isPointInMorocco)

  if (moroccoPoints.length < 2) return []

  const coordinates = moroccoPoints
    .map(([lat, lng]) => `${lng},${lat}`)
    .join(';')

  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`,
    { headers: { Accept: 'application/json' } },
  )
  const data = await response.json().catch(() => ({}))
  const routeCoordinates = data.routes?.[0]?.geometry?.coordinates || []

  return routeCoordinates.map(([lng, lat]) => [lat, lng])
    .filter(isPointInMorocco)
}

function isPointInMorocco(point) {
  if (!point) return false

  const [lat, lng] = point

  return MOROCCO_BOUNDS.contains([lat, lng])
}
