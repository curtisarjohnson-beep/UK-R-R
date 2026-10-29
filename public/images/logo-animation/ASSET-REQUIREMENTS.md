# Chameleon reveal: artwork handoff

The supplied files were inspected. The website remains on its original static
logo; no animation has been deployed or enabled.

## Available files

- `Glossy Green Chameleon Mascot.png`: 1536 × 1024 RGBA, with transparency.
  Its head details, outline, feet and branch differ from the original emblem.
- `Glossy Union Jack Badge Panel.png`: 1536 × 1024 RGBA, with transparency.
  A standalone flag panel, but not exported in the original logo's coordinates.
- `UK Reptiles Chameleon Animation Kit.png`: 1536 × 1024 RGBA concept sheet.
  Contains multiple differently sized illustrations, labels and arrows. It is
  reference artwork, not a sprite sheet or a set of registered layers.
- The complete original emblem is available at
  `assets/originals/chameleon-emblem.png` in the repository (1402 × 1122 RGBA).

Transparency alone does not make these assets interchangeable. Scaling and
positioning the standalone green chameleon cannot make its outline and limbs
match the final chameleon. A wipe would reveal conflicting silhouettes. Cropping
pieces from the concept sheet would not preserve the original logo accurately.

## Required delivery from the illustrator

Use the **original full emblem as the master**, without redrawing its final state.
Supply an SVG with named layers, or separate transparent PNGs with these layers:

1. `flag`: the exact original flag panel, with hidden areas restored as needed.
2. `chameleon-green`: the original chameleon in its final resting pose, coloured
   green, with the same outline, limbs, eye, tail and shading registration.
3. `chameleon-final`: the exact original red/white/blue chameleon, isolated.
4. `lettering-ribbon`: the original curved lettering, R&R ribbon and establishment
   year, with no chameleon or flag baked in.
5. `logo-final`: the unchanged complete original emblem for the static fallback
   and final frame.

All layers must share one canvas, preferably **1402 × 1122**, the original
emblem's size. Keep identical pixel coordinates and transparent padding. Do not
independently crop, resize, recenter or add background glows to each export.
Compositing flag + final chameleon + lettering/ribbon must reproduce the original
emblem without doubled outlines or gaps. Keep the reference sheet separate.

For genuine leg movement, also supply separate leg/tail/body layers with pivot
points, or a short set of registered crawl poses. The minimum four-layer reveal
can use gentle whole-chameleon translation and body bobbing; it should not claim
independently animated legs. Since the animal faces right but enters from the
right, it will move backward unless turn/crawl poses are supplied; do not mirror
the final flag-coloured emblem to hide that issue.

## Implementation once registered layers arrive

- 0–1 s: flag appears; green chameleon enters with gentle body movement.
- 1–3 s: a feathered mask progressively reveals the aligned final-colour layer.
- 3–4 s: original lettering/ribbon appears; resolve to the complete static logo.
- Play once, then stop. Use the complete static logo immediately for reduced
  motion, loading failures or unsupported animation features.
- Reserve the existing hero emblem's aspect ratio, keep decorative layers hidden
  from assistive technology, and retain one accessible organisation label.
- Preserve the current hero background, headline, layout and contact links.
- Validate the intermediate frames and final composite on desktop and mobile;
  deploy only after owner approval.
