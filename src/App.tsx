import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, Check, ChevronUp, Heart, Leaf, Mail, MapPin, Menu, MessageCircle, PackageOpen, Phone, ShieldCheck, Sprout, Users, X } from 'lucide-react'
import { navigation, photos, site } from './config'

function Brand({ footer = false }: { footer?: boolean }) {
  return <a href="#home" className={`brand ${footer ? 'brand-footer' : ''}`} aria-label={`${site.name} home`}>
    {site.logo && footer ? <img src={site.logo} alt={site.name} width="180" height="80" className="original-logo" /> : <>
      <span className="brand-name">UK R<span>&</span>R<span className="brand-dot">.</span></span>
      <span className="brand-sub">REPTILES & RECOVERY</span>
    </>}
  </a>
}

function Photo({ id, className = '', eager = false }: { id: string; className?: string; eager?: boolean }) {
  const photo = photos[id]
  return <div className={`photo photo-${id} ${className}`}>
    {photo.src ? <img src={photo.src} alt={photo.alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" /> : <div className="photo-placeholder" role="img" aria-label={`Photo placeholder: ${photo.alt}`}>
      <div className="botanical botanical-one" aria-hidden="true"><Leaf strokeWidth={0.6} /></div>
      <div className="botanical botanical-two" aria-hidden="true"><Sprout strokeWidth={0.6} /></div>
      <span className="photo-caption"><span className="tiny-line" />{photo.label}<small>PHOTOGRAPH TO FOLLOW</small></span>
    </div>}
  </div>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const header = useRef<HTMLElement>(null)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuButton.current?.focus() }
    }
    const closeOutside = (event: PointerEvent) => {
      if (menuOpen && !header.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const media = window.matchMedia('(min-width: 1100px)')
    const onResize = () => { if (media.matches) setMenuOpen(false) }
    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOutside)
    media.addEventListener('change', onResize)
    return () => { document.removeEventListener('keydown', closeOnEscape); document.removeEventListener('pointerdown', closeOutside); media.removeEventListener('change', onResize) }
  }, [menuOpen])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) }
    }), { threshold: 0.08 })
    document.querySelectorAll('.reveal').forEach(element => { element.classList.add('will-reveal'); observer.observe(element) })
    return () => observer.disconnect()
  }, [])

  const structuredData = {
    '@context': 'https://schema.org', '@type': 'Organization', name: site.name,
    email: site.email, foundingDate: String(site.established), sameAs: [site.facebook],
    areaServed: { '@type': 'AdministrativeArea', name: 'Northamptonshire, United Kingdom' },
  }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <script type="application/ld+json">{JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>
    <header className="site-header" ref={header}>
      <div className="nav-shell">
        <Brand />
        <button ref={menuButton} className="menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        <nav id="main-navigation" aria-label="Main navigation" className={menuOpen ? 'main-nav open' : 'main-nav'}>
          {navigation.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <a href="#contact" className="button button-small" onClick={() => setMenuOpen(false)}>Get in Touch <ArrowRight size={16} /></a>
        </nav>
      </div>
    </header>

    <main id="main">
      <section className="hero" id="home" aria-labelledby="hero-title">
        <div className={`hero-art jungle-scene ${photos.hero.src ? 'has-artwork' : 'awaiting-artwork'}`}>
          {photos.hero.src && <img className="jungle-background" src={photos.hero.src} width="1672" height="941" alt="" fetchPriority="high" decoding="async" />}
        </div>
        <div className="hero-emblem">
          {site.logo ? <img className="hero-original-logo" src={site.logo} width="1402" height="1122" alt={site.name} fetchPriority="high" /> : <div className="hero-asset-pending"><span className="eyebrow">THE NEXT CHAPTER</span><p>A little adventure.<br />A lot of heart.</p><span>Original chameleon emblem & illustrated<br />jungle artwork awaiting supply.</span></div>}
        </div>
        <div className="container hero-content">
          <p className="eyebrow"><span /> NORTHAMPTONSHIRE · EST. {site.established}</p>
          <h1 id="hero-title">Every Reptile<br />Deserves a<br /><em>Second Chance.</em></h1>
          <p className="hero-identity">Rescue. Recovery. Rehoming.</p>
          <p className="hero-description">Providing a safe place for reptiles in need across Northamptonshire. Whether you’re seeking advice, support or a reptile companion, we’re here to help.</p>
          <div className="button-row"><a href="#contact" className="button">Get in Touch <ArrowRight size={18} /></a><a href="#about" className="text-link">Discover Our Mission <ArrowDown size={16} /></a></div>
        </div>
        <div className="hero-bottom container"><span>COMPASSION FOR THE EXTRAORDINARY.</span><a href="#about" aria-label="Scroll to About UK R&R"><ArrowDown size={18} /></a><span>A LITTLE R&R. A FRESH START.</span></div>
      </section>

      <div className="mission-strip"><span>RESCUE WITH COMPASSION</span><span className="strip-star">✳</span><span>RECOVERY WITH CARE</span><span className="strip-star">✳</span><span>REHOMING WITH PURPOSE</span></div>

      <section className="section section-ivory" id="about" aria-labelledby="about-title">
        <div className="container about-grid reveal">
          <div className="about-visual"><Photo id="about" /><span className="est-stamp"><Leaf size={22} /><strong>Rooted in care.</strong><span>EST. 2026 · UK R&R</span></span></div>
          <div className="about-copy"><p className="eyebrow">01 / A LITTLE ABOUT US</p><h2 id="about-title">A Safe Place for<br />Reptiles <em>in Need.</em></h2>
            <p className="lead">Some need a new beginning.<br />All deserve to be understood.</p>
            <p>UK Reptiles & Recovery is a Northamptonshire-based organisation dedicated to supporting reptile rescue, recovery and responsible rehoming.</p>
            <p>A safe place for reptiles in need of some R & R – Rescue, Recovery & Rehoming. If you need help with finding a reptile companion or just seek some friendly, expert advice, we would love to hear from you.</p>
            <div className="inline-note"><Heart size={20} /><span>Animal welfare at the heart of every conversation.</span></div>
          </div>
        </div>
      </section>

      <section className="section services-section" id="what-we-do" aria-labelledby="services-title">
        <div className="container">
          <div className="section-heading reveal"><div><p className="eyebrow">02 / OUR PURPOSE</p><h2 id="services-title">Rescue. Recovery.<br /><em>Rehoming.</em></h2></div><p>Different journeys. The same commitment:<br />a better future for reptiles in need.</p></div>
          <div className="service-grid reveal">{[
            { number: '01', Icon: ShieldCheck, title: 'Rescue', copy: 'Supporting reptiles in need and helping owners seeking assistance.' },
            { number: '02', Icon: Sprout, title: 'Recovery', copy: 'Providing care and supporting the rehabilitation and well-being of reptiles.' },
            { number: '03', Icon: Heart, title: 'Rehoming', copy: 'Helping reptiles find suitable new homes and supporting responsible reptile ownership.' },
          ].map(({ number, Icon, title, copy }) => <article className="service-card" key={title}><div className="card-top"><Icon size={32} strokeWidth={1.3} /><span>{number}</span></div><h3>{title}</h3><p>{copy}</p><span className="card-rule" /></article>)}</div>
          <p className="service-note">Need help with a reptile? <a href="#contact">Talk to us about your situation <ArrowRight size={15} /></a></p>
        </div>
      </section>

      <section className="section section-ivory animals-section" id="animals" aria-labelledby="animals-title">
        <div className="container">
          <div className="section-heading reveal"><div><p className="eyebrow">03 / THE ANIMALS WE SUPPORT</p><h2 id="animals-title">Every Species<br />Deserves <em>Compassion.</em></h2></div><p>Scales, shells and remarkable personalities.<br />Every animal is an individual.</p></div>
          <div className="animal-grid reveal">{['snakes', 'lizards', 'tortoises', 'geckos', 'exotics'].map((id, index) => <article key={id} className={`animal-card animal-${index}`}><Photo id={id} /><div className="animal-label"><h3>{photos[id].label}</h3><span>0{index + 1}</span></div></article>)}</div>
          <p className="caption-note">A glimpse of the species we support. These are not adoption listings. <a href="#contact">Contact us to discuss rehoming.</a></p>
        </div>
      </section>

      <section className="section gallery-section" id="life" aria-labelledby="life-title">
        <div className="container">
          <div className="center-heading reveal"><p className="eyebrow">04 / LIFE AT UK R&R</p><h2 id="life-title">The Faces Behind <em>the Rescue.</em></h2><p>Behind every rescue is a community of people who care. Discover some of the animals, people and everyday moments that make UK R&R special.</p></div>
          <div className="gallery-grid reveal">{['communitySnake', 'communityDragon', 'communityTortoise'].map(id => <figure key={id}><Photo id={id} /><figcaption>{photos[id].label}</figcaption></figure>)}</div>
          <p className="caption-note">Our own moments, coming soon. Original photographs will be added with permission.</p>
        </div>
      </section>

      <section className="section section-ivory support-section" id="support" aria-labelledby="support-title">
        <div className="container support-grid reveal"><div><p className="eyebrow">05 / MAKE A DIFFERENCE</p><h2 id="support-title">Small Acts of<br /><em>Kindness.</em><br />A Big Difference.</h2><p className="support-intro">Care comes in many forms. Unwanted reptile equipment, a shared post or a friendly recommendation can help support our work.</p><a className="button button-dark" href="#contact">Support Our Mission <ArrowRight size={18} /></a></div>
          <div className="help-list">{[
            { Icon: PackageOpen, title: 'Donate Equipment', copy: 'Unwanted reptile equipment may help support animals in need. Get in touch to discuss what you have before arranging a donation.' },
            { Icon: MessageCircle, title: 'Spread the Word', copy: 'Share UK R&R with friends, family and local reptile enthusiasts. A conversation can make a difference.' },
            { Icon: Users, title: 'Join Our Community', copy: 'Follow us on Facebook and help our message reach more people.', link: true },
          ].map(({ Icon, title, copy, link }) => <article className="help-item" key={title}><span className="icon-circle"><Icon size={24} strokeWidth={1.4} /></span><div><h3>{title}</h3><p>{copy}</p>{link && <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="text-link">Find us on Facebook <ArrowRight size={16} /><span className="sr-only"> (opens in a new tab)</span></a>}</div></article>)}</div>
        </div>
      </section>

      <section className="values-section" aria-labelledby="values-title"><div className="container reveal"><p className="eyebrow" id="values-title">THE VALUES THAT GUIDE US</p><div className="values">{['Welfare', 'Honesty', 'Responsibility', 'Collaboration', 'Trust'].map(value => <span key={value}><Check size={16} strokeWidth={1.5} />{value}</span>)}</div></div></section>

      <section className="section contact-section" id="contact" aria-labelledby="contact-title"><div className="container contact-grid reveal"><div><p className="eyebrow">06 / LET’S TALK</p><h2 id="contact-title">Let’s Give Reptiles<br />a <em>Better Future.</em></h2><p>Whether you need advice, would like to discuss rehoming or want to support our work, we’d love to hear from you.</p><span className="location"><MapPin size={18} />{site.location}</span></div><div className="contact-options"><a className="contact-card" href={`mailto:${site.email}`}><Mail size={26} strokeWidth={1.4} /><span><small>DROP US A LINE</small><strong>{site.email}</strong></span><ArrowRight size={20} /></a><a className="contact-card" href={site.facebook} target="_blank" rel="noopener noreferrer"><Users size={26} strokeWidth={1.4} /><span><small>JOIN THE CONVERSATION</small><strong>Find us on Facebook</strong><span className="sr-only"> (opens in a new tab)</span></span><ArrowRight size={20} /></a>{site.phone && <a className="contact-card" href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}><Phone size={26} /><span><small>GIVE US A CALL</small><strong>{site.phone}</strong></span><ArrowRight size={20} /></a>}<p className="contact-note">A little advice can be the start of something good.</p></div></div></section>
    </main>

    <footer className="site-footer"><div className="container"><div className="footer-top"><div><Brand footer /><p>A safe place for reptiles in need of some R&R.<br />Rescue. Recovery. Rehoming.</p></div><nav aria-label="Footer navigation">{navigation.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav><div className="footer-contact"><span>{site.location}</span><a href={`mailto:${site.email}`}>{site.email}</a><a href={site.facebook} target="_blank" rel="noopener noreferrer">Facebook <ArrowRight size={14} /><span className="sr-only"> (opens in a new tab)</span></a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span><span>Built with care. For lives that matter.</span><a href="#home">Back to top <ChevronUp size={16} /></a></div><p className="privacy-note">This site has no contact forms, analytics or embedded social feeds. Email and Facebook links open external services, which have their own privacy policies.</p><p className="asset-note">Jungle illustration and original chameleon emblem supplied by UK R&R. Genuine rescue and community photographs are awaiting supply; labelled image panels remain placeholders.</p></div></footer>
  </>
}

export default App
