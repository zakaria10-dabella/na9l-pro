import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import './Na9lProAnimation.css'

gsap.registerPlugin(useGSAP, MotionPathPlugin)

function Na9lProAnimation({ theme = 'dark', loop = false, onComplete }) {
  const containerRef = useRef(null)
  const routeRef = useRef(null)
  const truckRef = useRef(null)
  const startPointRef = useRef(null)
  const endPointRef = useRef(null)
  const startPulseRef = useRef(null)
  const endPulseRef = useRef(null)

  useGSAP(
    () => {
      const route = routeRef.current
      const routeLength = route.getTotalLength()
      const routeDuration = loop ? 2.35 : 1.55
      const finishDelay = loop ? '+=0.8' : '+=0.15'

      gsap.set(route, {
        strokeDasharray: routeLength,
        strokeDashoffset: routeLength,
      })

      gsap.set([startPointRef.current, endPointRef.current], {
        scale: 0,
        transformOrigin: '50% 50%',
      })

      gsap.set([startPulseRef.current, endPulseRef.current], {
        scale: 0.45,
        opacity: 0,
        transformOrigin: '50% 50%',
      })

      gsap.set(truckRef.current, {
        opacity: 0,
        scale: 0.9,
        transformOrigin: '50% 50%',
      })

      const timeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        repeat: loop ? -1 : 0,
        repeatDelay: 1.6,
      })

      timeline
        .set(route, {
          opacity: 1,
          strokeDasharray: routeLength,
          strokeDashoffset: routeLength,
        })
        .set(truckRef.current, {
          opacity: 0,
          scale: 0.9,
        })
        .set([startPointRef.current, endPointRef.current], {
          opacity: 1,
          scale: 0,
        })
        .set([startPulseRef.current, endPulseRef.current], {
          scale: 0.45,
          opacity: 0,
        })
        .to(startPointRef.current, { scale: 1, duration: loop ? 0.45 : 0.25 })
        .to(startPulseRef.current, { opacity: 0.55, duration: 0.2 }, '<')
        .to(route, { strokeDashoffset: 0, duration: routeDuration, ease: 'power2.inOut' }, '-=0.08')
        .to(
          truckRef.current,
          {
            opacity: 1,
            scale: 1,
            duration: 0.2,
          },
          '<',
        )
        .to(
          truckRef.current,
          {
            duration: routeDuration,
            ease: 'power2.inOut',
            motionPath: {
              path: route,
              align: route,
              alignOrigin: [0.5, 0.5],
              autoRotate: true,
            },
          },
          '<',
        )
        .to(endPointRef.current, { scale: 1, duration: 0.45 }, '-=0.3')
        .to(endPulseRef.current, { opacity: 0.55, duration: 0.25 }, '<')
        .add(() => {
          if (!loop) onComplete?.()
        })
        .to(
          [startPulseRef.current, endPulseRef.current],
          {
            scale: 1.65,
            opacity: 0,
            duration: 1.5,
            ease: 'sine.out',
            repeat: 2,
          },
          '-=1',
        )
        .to(
          [
            route,
            truckRef.current,
            startPointRef.current,
            endPointRef.current,
          ],
          {
            opacity: 0,
            duration: 0.55,
            ease: 'power2.in',
          },
          finishDelay,
        )
    },
    { scope: containerRef },
  )

  return (
    <section className={`na9l-animation ${theme}`} ref={containerRef} aria-label="Na9l Pro logistics route animation">
      <div className="na9l-animation__backdrop" />

      <div className="na9l-animation__stage">
        <svg className="na9l-animation__map" viewBox="0 0 900 520" role="img" aria-labelledby="na9lRouteTitle">
          <title id="na9lRouteTitle">Truck moving on the Na9l Pro logo route</title>

          <defs>
            <filter id="routeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0.94  0 0.12 0 0 0.08  0 0 0.12 0 0.08  0 0 0 0.55 0"
              />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <image
            className="na9l-animation__logo-route"
            href="/logo.png"
            x="180"
            y="80"
            width="560"
            height="394"
            preserveAspectRatio="xMidYMid meet"
          />

          <path
            className="na9l-animation__route-shadow"
            d="M 369 307 C 399 293, 404 245, 419 213 C 430 182, 445 187, 444 218 L 443 328 C 443 376, 482 423, 496 372 L 528 188"
          />

          <path
            ref={routeRef}
            className="na9l-animation__route"
            d="M 369 307 C 399 293, 404 245, 419 213 C 430 182, 445 187, 444 218 L 443 328 C 443 376, 482 423, 496 372 L 528 188"
            filter="url(#routeGlow)"
          />

          <g className="na9l-animation__point" transform="translate(369 307)">
            <circle ref={startPulseRef} className="na9l-animation__pulse" r="42" />
            <circle ref={startPointRef} className="na9l-animation__pin na9l-animation__pin--start" r="21" />
          </g>

          <g className="na9l-animation__point" transform="translate(528 188)">
            <circle ref={endPulseRef} className="na9l-animation__pulse" r="62" />
            <circle ref={endPointRef} className="na9l-animation__pin na9l-animation__pin--end" r="36" />
          </g>

          <g ref={truckRef} className="na9l-animation__truck">
            <rect x="-23" y="-13" width="36" height="24" rx="5" />
            <path d="M 13 -8 H 28 L 36 1 V 11 H 13 Z" />
            <path d="M 19 -5 H 27 L 31 0 H 19 Z" className="na9l-animation__truck-window" />
            <circle cx="-12" cy="13" r="5" />
            <circle cx="24" cy="13" r="5" />
          </g>
        </svg>
      </div>
    </section>
  )
}

export default Na9lProAnimation
