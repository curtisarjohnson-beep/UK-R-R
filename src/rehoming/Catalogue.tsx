import { useState } from 'react'
import { ArrowRight, Copy, Mail } from 'lucide-react'
import { site } from '../config'
import { Foliage } from '../OrganicDetails'
import { useDemo } from './context'
import { availabilityLabels, primaryPhoto } from './model'
import type { Animal } from './model'
import { BackLink, copyText, EmptyState, Photo, profileLink, routes } from './shared'

export function Catalogue() {
  const { data } = useDemo(); const [species, setSpecies] = useState(''), [availability, setAvailability] = useState('')
  const animals = (data?.animals || []).filter(a => a.publication === 'published' && !a.archived)
  const filtered = animals.filter(a => (!species || a.species === species) && (!availability || a.availability === availability))
  return <>
    <section className="catalogue-intro"><Foliage /><p className="eyebrow">A LITTLE ADVENTURE. A LOT OF HEART.</p><h1>Every companion.<br /><em>A new beginning.</em></h1><p>Meet the characters in our rehoming demo. Explore their stories, discover their needs and see how a fresh start could look.</p></section>
    <section className="catalogue-section" aria-label="Animal catalogue"><div className="demo-filters"><label>Species<select value={species} onChange={e => setSpecies(e.target.value)}><option value="">All species</option>{[...new Set(animals.map(a => a.species))].sort().map(s => <option key={s}>{s}</option>)}</select></label><label>Availability<select value={availability} onChange={e => setAvailability(e.target.value)}><option value="">All availability</option>{Object.entries(availabilityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><p role="status">{filtered.length} {filtered.length === 1 ? 'companion' : 'companions'} to explore</p><button className="demo-link" onClick={() => { setSpecies(''); setAvailability('') }}>Clear filters</button></div>
      {filtered.length ? <div className="catalogue-grid">{filtered.map(animal => <article className="companion-card" key={animal.id}><a href={profileLink(animal.id)} aria-label={`Meet ${animal.name}, ${animal.species}`}><Photo photo={primaryPhoto(animal)} alt={`Illustrative photograph for ${animal.name}, a fictional ${animal.species}`} /><div className="companion-copy"><span className={`demo-pill ${animal.availability}`}>{availabilityLabels[animal.availability]}</span><h2>{animal.name}<ArrowRight size={23} /></h2><p>{animal.species}</p><p className="demo-muted">{animal.age || 'Age not recorded'}</p><span className="photo-disclaimer">Fictional profile · illustrative photo</span></div></a></article>)}</div> : <EmptyState title="No companions match just yet"><p>Try another species or availability, or clear your filters.</p><button className="demo-button" onClick={() => { setSpecies(''); setAvailability('') }}>Show all demo animals</button></EmptyState>}
    </section>
  </>
}
export function AnimalProfile({ animal, preview = false }: { animal: Animal; preview?: boolean }) {
  const { perform } = useDemo(); const [selected, setSelected] = useState(primaryPhoto(animal)?.id || '')
  const photo = animal.photos.find(p => p.id === selected) || primaryPhoto(animal)
  const url = `${window.location.href.split('#')[0]}${profileLink(animal.id)}`
  return <div className={`animal-profile ${preview ? 'is-preview' : ''}`}>
    {!preview && <BackLink />}
    {preview && <p className="demo-note">Saved or unsaved preview only. Draft and archived profiles are never listed publicly.</p>}
    <div className="profile-grid"><div><Photo photo={photo} alt={`Illustrative photograph for ${animal.name}, a fictional ${animal.species}`} className="profile-main-photo" /><p className="photo-disclaimer">Fictional demonstration profile. Photography is illustrative.</p>{animal.photos.length > 1 && <div className="photo-choices" aria-label="Animal photographs">{animal.photos.map((photo, index) => <button key={photo.id} onClick={() => setSelected(photo.id)} aria-label={`View photograph ${index + 1}`} aria-pressed={photo.id === selected}><Photo photo={photo} alt={`Photograph ${index + 1}`} /></button>)}</div>}</div>
      <div className="profile-story"><span className={`demo-pill ${animal.availability}`}>{availabilityLabels[animal.availability]}</span><p className="eyebrow">MEET YOUR NEXT CHAPTER</p><h1>{animal.name || 'Your animal’s name'}</h1><p className="profile-species">{animal.species || 'Species to be added'}{animal.age && ` · ${animal.age}`}{animal.sex && ` · ${animal.sex}`}</p>
        {animal.personality && <section><h2>A little personality</h2><p>{animal.personality}</p></section>}{animal.description && <section><h2>About {animal.name || 'this animal'}</h2><p>{animal.description}</p></section>}
        {animal.background && <section><h2>Their story</h2><p>{animal.background}</p></section>}{animal.care && <section className="care-panel"><h2>A home that suits them</h2><p>{animal.care}</p></section>}{animal.specialNeeds && <section><h2>A little extra consideration</h2><p>{animal.specialNeeds}</p></section>}
        {!preview && <div className="profile-actions"><a className="demo-button" href={`mailto:${site.email}?subject=${encodeURIComponent(`Rehoming enquiry: ${animal.name} (demonstration profile)`)}&body=${encodeURIComponent(`Hello UK R&R,\n\nI am viewing the fictional demonstration profile for ${animal.name}:\n${url}\n\nMy enquiry:\n`)}`}><Mail size={19} />Enquire About Rehoming</a><button className="demo-button secondary" onClick={() => void perform(async () => { await copyText(url); return true }, 'Profile link copied.')}><Copy size={17} />Copy profile link</button><input aria-label="Shareable profile URL" readOnly value={url} onFocus={e => e.target.select()} /><p className="demo-muted">Demo animals are not real rehoming offers. For genuine advice, contact UK R&R.</p></div>}
      </div></div>
  </div>
}
export function PublicProfile({ id }: { id: string }) {
  const { data } = useDemo(); const animal = data?.animals.find(a => a.id === id && a.publication === 'published' && !a.archived)
  return animal ? <AnimalProfile key={animal.id} animal={animal} /> : <div className="catalogue-section"><EmptyState title="This profile isn’t available"><p>It may be unpublished, archived or not stored in this browser.</p><a className="demo-button" href={routes.catalogue}>Browse demo animals</a></EmptyState></div>
}
