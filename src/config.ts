export const site = {
  name: 'UK Reptiles & Recovery',
  shortName: 'UK R&R',
  established: 2026,
  email: 'ukreptiles.recovery@gmail.com',
  facebook: 'https://www.facebook.com/UKReptilesandRescue/',
  location: 'Northamptonshire, United Kingdom',
  // Set to a genuine international-format number to enable the telephone link.
  phone: '' as string,
  // Add the original logo file to public/images, then set its path here.
  logo: 'images/chameleon-emblem.webp' as string,
  productionUrl: import.meta.env.VITE_SITE_URL || '',
}

// Paths are relative to public/, without a leading slash for GitHub Pages.
// Hero: use approved local illustrated jungle artwork; never a recreated logo.
// Only add original, licensed images with consent.
// Leaving a path empty displays an explicitly labelled editorial placeholder.
export const photos: Record<string, { src: string; alt: string; label: string }> = {
  hero: { src: 'images/jungle-clearing.webp', alt: 'Illustrated jungle with layered tropical foliage and warm sunlight', label: 'Illustrated jungle artwork' },
  about: { src: 'images/about.webp', alt: 'Man holding a ball python in a room lined with reptile enclosures', label: 'Life at UK R&R' },
  snakes: { src: 'images/snakes.webp', alt: 'Ball python coiled in a person’s hands', label: 'Snakes' },
  lizards: { src: 'images/lizards.webp', alt: 'Bearded dragon resting on a computer keyboard', label: 'Lizards' },
  tortoises: { src: 'images/tortoises.webp', alt: 'Tortoise held by a man sitting beside a child', label: 'Tortoises' },
  geckos: { src: 'images/geckos.webp', alt: 'Gecko resting amongst cork bark and green leaves', label: 'Geckos' },
  exotics: { src: 'images/exotics.webp', alt: 'Man surrounded by reptiles, a tortoise and a tarantula', label: 'Other exotic animals' },
  communitySnake: { src: '', alt: 'Man sitting with a snake around his shoulders', label: 'A moment of connection' },
  communityDragon: { src: '', alt: 'Woman in a pink top holding a bearded dragon', label: 'Care, in the everyday' },
  communityTortoise: { src: '', alt: 'Man holding a tortoise indoors', label: 'Small moments. Lasting care.' },
}

export const navigation = [
  ['About', 'about'], ['What We Do', 'what-we-do'],
  ['Animals We Support', 'animals'], ['Support Us', 'support'], ['Contact', 'contact'],
] as const
