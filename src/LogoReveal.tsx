import { useEffect, useId, useState } from 'react'
import { site } from './config'
import './logo-reveal.css'

const layers = {
  green: 'images/logo-animation/green-chameleon.webp',
  flag: 'images/logo-animation/union-jack-glossy.svg',
}

// Reuse the supplied artwork for a stationary body and a gently articulated
// head. The original full emblem remains the final frame and error fallback.
export default function LogoReveal() {
  const artworkId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const headId = `${artworkId}-head`
  const bodyId = `${artworkId}-body`
  const headOutline = 'M980 60H1536V660H1110L1040 590L1010 470L990 330Z'
  const [phase, setPhase] = useState<'loading' | 'playing' | 'complete'>('loading')

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let active = true
    let finishTimer: ReturnType<typeof setTimeout>
    const finish = () => { if (active) setPhase('complete') }
    const onPreferenceChange = () => { if (reducedMotion.matches) finish() }
    reducedMotion.addEventListener('change', onPreferenceChange)
    const loadTimer = setTimeout(finish, 5000)

    if (reducedMotion.matches) finish()
    else {
      Promise.all([site.logo, layers.green, layers.flag].map(src => {
        const image = new Image()
        image.src = src
        return image.decode()
      })).then(() => {
        if (!active) return
        clearTimeout(loadTimer)
        if (reducedMotion.matches) { finish(); return }
        // A timeout/failure fallback must never restart the animation late.
        setPhase(current => current === 'loading' ? 'playing' : current)
        finishTimer = setTimeout(finish, 4200)
      }).catch(finish)
    }

    return () => {
      active = false
      clearTimeout(loadTimer)
      clearTimeout(finishTimer)
      reducedMotion.removeEventListener('change', onPreferenceChange)
    }
  }, [])

  return <div className={`logo-reveal is-${phase}`} role="img" aria-label={site.name}>
    {phase !== 'complete' && <div className="logo-reveal-layers" aria-hidden="true">
      <img className="logo-reveal-flag" src={layers.flag} alt="" width="640" height="380" />
      <svg className="logo-reveal-green" viewBox="0 0 1536 1024" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={headId}><path d={headOutline} /></clipPath>
          <mask id={bodyId} maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024">
            <rect width="1536" height="1024" fill="white" />
            <path d={headOutline} fill="black" />
          </mask>
        </defs>
        <image href={layers.green} width="1536" height="1024" mask={`url(#${bodyId})`} />
        <g className="logo-reveal-head">
          <image href={layers.green} width="1536" height="1024" clipPath={`url(#${headId})`} />
          <g className="logo-reveal-tongue" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1458 480Q1515 482 1580 479M1580 479L1606 466M1580 479L1608 489" stroke="#452a2b" strokeWidth="12" />
            <path d="M1458 480Q1515 482 1580 479M1580 479L1606 466M1580 479L1608 489" stroke="#f0a09a" strokeWidth="6" />
          </g>
        </g>
      </svg>
    </div>}
    <img className="hero-original-logo logo-reveal-final" src={site.logo} width="1402" height="1122" alt="" fetchPriority="high" />
  </div>
}
