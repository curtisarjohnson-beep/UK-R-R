import { emptyAnimal } from './model'
import samples from './animals.demo.json'
import type { Animal, EventType, SocialTemplate, Snapshot } from './model'
export const defaultTemplates: SocialTemplate[] = [
  { type: 'available', title: 'New Animal Available', revision: 0, text: `🦎 Meet {{name}}!

We're delighted to introduce {{name}}, a {{species}} who's looking for a loving new home!

A little about {{name}}:
Age: {{age}}
Personality: {{personality}}

Could you offer {{name}} the home they deserve? 💚

Find out more and enquire through our website:
{{profile_url}}` },
  { type: 'reserved', title: 'Animal Reserved', revision: 0, text: `💚 Great news! {{name}} has been reserved!

Our lovely {{species}} is one step closer to finding a forever home.

Thank you to everyone who's shown interest in {{name}}. 🦎` },
  { type: 'rehomed', title: 'Animal Rehomed', revision: 0, text: `🏡 Happy ending for {{name}}!

We're delighted to announce that {{name}} has officially found a new home!

Thank you to everyone who supports UK Reptiles & Recovery and helps make these happy endings possible. 💚` },
]
export const eventTitles: Record<EventType, string> = { available: 'New animal available', reserved: 'Animal reserved', rehomed: 'Animal rehomed' }
export function demoData(): Snapshot {
  const now = new Date().toISOString()
  const make = (id: string, name: string, species: string, image: string, extras: Partial<Animal>): Animal => ({
    ...emptyAnimal(), id, name, species, revision: 1, publication: 'published', introduced: true,
    photos: [{ id: `demo-${id}`, name: 'Illustrative demonstration photograph', source: `images/${image}.webp` }], primaryPhotoId: `demo-${id}`,
    description: `${name} is a fictional animal created to demonstrate this rehoming catalogue. The photograph is illustrative and does not show an animal currently offered for adoption.`,
    background: 'Demonstration story only. No real rescue history is claimed.', createdAt: now, updatedAt: now, ...extras,
  })
  return { version: 1, animals: samples.map(({ id, name, species, image, ...details }) => make(id, name, species, image, details as Partial<Animal>)), templates: structuredClone(defaultTemplates), posts: [], events: [], history: [] }
}
