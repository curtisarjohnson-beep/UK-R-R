import { useEffect, useState } from 'react'
import { site } from './config'
import './logo-reveal.css'

const layers = {
  green: 'images/logo-animation/green-chameleon.webp',
  flag: 'images/logo-animation/union-jack.webp',
}

// A theatrical dissolve accommodates the different illustrations without
// pretending their silhouettes are registered for a literal colour morph.
export default function LogoReveal() {
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
      <img className="logo-reveal-flag" src={layers.flag} alt="" width="1536" height="1024" />
      <img className="logo-reveal-green" src={layers.green} alt="" width="1536" height="1024" />
      <span className="logo-reveal-glow" />
      <span className="logo-reveal-spark spark-one" />
      <span className="logo-reveal-spark spark-two" />
      <span className="logo-reveal-spark spark-three" />
    </div>}
    <img className="hero-original-logo logo-reveal-final" src={site.logo} width="1402" height="1122" alt="" fetchPriority="high" />
  </div>
}
