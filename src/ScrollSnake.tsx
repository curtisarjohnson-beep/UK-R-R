import { useEffect, useRef } from 'react'
import './scroll-snake.css'

// A short, tapered ribbon follows a scroll-parametrised centreline. There is
// deliberately no clock: stopping or reversing scrolling stops or reverses it.
export default function ScrollSnake() {
  const svg = useRef<SVGSVGElement>(null)
  const body = useRef<SVGPathElement>(null)
  const markings = useRef<SVGPathElement>(null)
  const head = useRef<SVGGElement>(null)

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)')
    let frame = 0
    const draw = () => {
      frame = 0
      if (!media.matches || !svg.current) return
      const height = window.innerHeight
      const range = document.documentElement.scrollHeight - height
      const progress = range > 0 ? Math.max(0, Math.min(1, window.scrollY / range)) : 0
      const length = Math.min(210, height * .28)
      const tip = 150 + length + progress * (height - 185 - length)
      const phase = progress * Math.PI * 16
      const point = (t: number) => ({
        x: 19 + Math.sin(t * 7 - phase) * 7 + Math.sin(t * 3 + phase * .5) * 2,
        y: tip - length * (1 - t),
      })
      const left: string[] = [], right: string[] = [], bands: string[] = []
      for (let i = 0; i <= 64; i++) {
        const t = i / 64
        const p = point(t)
        const next = point(t + .001)
        const angle = Math.atan2(next.y - p.y, next.x - p.x)
        const width = 3.6 * Math.sin(Math.min(1, t * 2) * Math.PI / 2)
        const nx = Math.sin(angle) * width, ny = -Math.cos(angle) * width
        left.push(`${p.x + nx},${p.y + ny}`)
        right.unshift(`${p.x - nx},${p.y - ny}`)
        if (i > 12 && i % 7 === 0) bands.push(`M${p.x + nx * .75},${p.y + ny * .75} Q${p.x},${p.y + 3} ${p.x - nx * .75},${p.y - ny * .75}`)
      }
      const end = point(1), before = point(.99)
      svg.current.setAttribute('viewBox', `0 0 40 ${height}`)
      body.current?.setAttribute('d', `M${left.join(' L')} L${right.join(' L')} Z`)
      markings.current?.setAttribute('d', bands.join(' '))
      head.current?.setAttribute('transform', `translate(${end.x} ${end.y}) rotate(${Math.atan2(end.y - before.y, end.x - before.x) * 180 / Math.PI - 90})`)
      svg.current.style.visibility = 'visible'
    }
    const schedule = () => {
      if (!media.matches) {
        if (svg.current) svg.current.style.visibility = 'hidden'
        cancelAnimationFrame(frame)
        frame = 0
      } else if (!frame) frame = requestAnimationFrame(draw)
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    media.addEventListener('change', schedule)
    const observer = new ResizeObserver(schedule)
    observer.observe(document.documentElement)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      media.removeEventListener('change', schedule)
    }
  }, [])

  return <svg ref={svg} className="scroll-snake" aria-hidden="true" focusable="false" width="40" height="800" viewBox="0 0 40 800">
    <path ref={body} fill="#376342" stroke="#b5ae67" strokeWidth=".65" strokeLinejoin="round" />
    <path ref={markings} fill="none" stroke="#c6b86f" strokeWidth="1.25" strokeLinecap="round" opacity=".7" />
    <g ref={head}>
      <path d="M-3.3,-5 C-6,-1 -5,6 -2,9 Q0,11 2,9 C5,6 6,-1 3.3,-5Z" fill="#376342" stroke="#b5ae67" strokeWidth=".65" />
      <path d="M0,-3 Q-1,2 0,6" fill="none" stroke="#c6b86f" strokeWidth="1" opacity=".65" />
      <ellipse cx="-3" cy="3" rx="1" ry="1.3" fill="#ead9a0" />
      <ellipse cx="3" cy="3" rx="1" ry="1.3" fill="#ead9a0" />
      <path d="M-3,2.3v1.4 M3,2.3v1.4" stroke="#10281d" strokeWidth=".8" />
    </g>
  </svg>
}
