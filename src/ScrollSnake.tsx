import { useEffect, useRef } from 'react'
import './scroll-snake.css'

// A long, tapered ribbon follows a scroll-parametrised centreline. There is
// deliberately no clock: stopping or reversing scrolling stops or reverses it.
export default function ScrollSnake() {
  const svg = useRef<SVGSVGElement>(null)
  const body = useRef<SVGPathElement>(null)
  const markings = useRef<SVGPathElement>(null)
  const head = useRef<SVGGElement>(null)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: no-preference)')
    const hero = document.querySelector<HTMLElement>('.hero')
    const finish = document.querySelector<HTMLElement>('.support-section')
    const allSections = Array.from(document.querySelectorAll<HTMLElement>('#main > section:not(.hero)'))
    const finishIndex = finish ? allSections.indexOf(finish) : allSections.length - 1
    const sections = allSections.slice(0, finishIndex + 1)
    let frame = 0
    const draw = () => {
      frame = 0
      if (!media.matches || !svg.current) return
      const height = window.innerHeight
      const viewportWidth = document.documentElement.clientWidth
      const mobile = viewportWidth < 768
      const heroBottom = hero?.getBoundingClientRect().bottom ?? 0
      const finishBottom = finish?.getBoundingClientRect().bottom ?? height
      const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom ?? 90
      const top = Math.max(headerBottom + 12, heroBottom)
      const bottom = Math.min(height, finishBottom)
      // Clip between the hero and Make a difference. The head parks at its
      // end and scrolls away, keeping the values and contact sections clear.
      if (top >= bottom) {
        svg.current.style.visibility = 'hidden'
        return
      }
      const start = (hero?.offsetTop ?? 0) + (hero?.offsetHeight ?? 0)
      const range = Math.max(1, ((finish?.offsetTop ?? 0) + (finish?.offsetHeight ?? document.documentElement.scrollHeight)) - start - height)
      const progress = Math.max(0, Math.min(1, (window.scrollY - start + height * .3) / range))
      const length = Math.min(mobile ? 560 : 760, height * .76)
      const tip = Math.min(height * .89 + Math.sin(progress * Math.PI * 2) * height * .04, finishBottom - 18)
      const amplitude = Math.min(mobile ? 90 : 280, viewportWidth * .24)
      // Measure actual responsive section bounds once per frame. One complete
      // wave spans each section, including taller stacked mobile sections.
      const bounds = sections.map(section => {
        const rect = section.getBoundingClientRect()
        return { top: rect.top, height: rect.height }
      })
      const point = (t: number) => {
        const y = tip - length * (1 - t)
        const index = bounds.findIndex(section => y < section.top + section.height)
        const section = bounds[index < 0 ? bounds.length - 1 : index]
        const local = section ? Math.max(0, Math.min(1, (y - section.top) / section.height)) : 0
        // Ease at section joins so differently sized sections meet smoothly.
        const phase = (local * local * (3 - 2 * local)) * Math.PI * 2
        return { x: viewportWidth / 2 + Math.sin(phase) * amplitude, y }
      }
      const left: string[] = [], right: string[] = [], diamonds: string[] = []
      for (let i = 0; i <= 96; i++) {
        const t = i / 96
        const p = point(t)
        const next = point(t + .001)
        const angle = Math.atan2(next.y - p.y, next.x - p.x)
        const width = (mobile ? 3 : 4.5) * Math.sin(Math.min(1, t * 2) * Math.PI / 2)
        const nx = Math.sin(angle) * width, ny = -Math.cos(angle) * width
        left.push(`${p.x + nx},${p.y + ny}`)
        right.unshift(`${p.x - nx},${p.y - ny}`)
        if (i > 18 && i % 5 === 0) diamonds.push(`M${p.x - Math.cos(angle) * 5},${p.y - Math.sin(angle) * 5} L${p.x + nx * .8},${p.y + ny * .8} L${p.x + Math.cos(angle) * 5},${p.y + Math.sin(angle) * 5} L${p.x - nx * .8},${p.y - ny * .8}Z`)
      }
      const end = point(1), before = point(.99)
      svg.current.setAttribute('viewBox', `0 0 ${viewportWidth} ${height}`)
      svg.current.style.clipPath = `inset(${top}px 0 ${Math.max(0, height - bottom)}px 0)`
      body.current?.setAttribute('d', `M${left.join(' L')} L${right.join(' L')} Z`)
      markings.current?.setAttribute('d', diamonds.join(' '))
      head.current?.setAttribute('transform', `translate(${end.x} ${end.y}) rotate(${Math.atan2(end.y - before.y, end.x - before.x) * 180 / Math.PI - 90}) scale(${mobile ? .85 : 1.2})`)
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
    <path ref={markings} fill="#c6b86f" stroke="#234b35" strokeWidth=".5" opacity=".85" />
    <g ref={head}>
      <path d="M-3.3,-5 C-6,-1 -5,6 -2,9 Q0,11 2,9 C5,6 6,-1 3.3,-5Z" fill="#376342" stroke="#b5ae67" strokeWidth=".65" />
      <path d="M0,-3 Q-1,2 0,6" fill="none" stroke="#c6b86f" strokeWidth="1" opacity=".65" />
      <ellipse cx="-3" cy="3" rx="1" ry="1.3" fill="#ead9a0" />
      <ellipse cx="3" cy="3" rx="1" ry="1.3" fill="#ead9a0" />
      <path d="M-3,2.3v1.4 M3,2.3v1.4" stroke="#10281d" strokeWidth=".8" />
    </g>
  </svg>
}
