# UK Reptiles & Recovery

A responsive, static React + TypeScript website for UK R&R, Northamptonshire. Built with Vite, Tailwind CSS and Lucide icons. No backend, database, payments, analytics, remote fonts or embedded social feeds.

## Local development

Use Node.js 22 or 24 LTS and npm. From this checkout:

```sh
npm ci
npm run dev
```

Open the local address printed by Vite in your own development environment. Production validation:

```sh
npm run build
npm test
npm run preview
```

The build performs strict TypeScript checking and outputs `dist/`. Tests render the actual React page and check navigation, contact details and content safeguards. Browser validation should cover 360px mobile, 768px tablet and 1440px desktop, keyboard navigation, menu closing with Escape, reduced motion and contact links.

## One-shot chameleon reveal

The hero emblem now plays a four-second CSS sequence using the existing green chameleon and flag assets: a gentle entrance, warm gold dissolve and top-to-bottom reveal of the unchanged original full emblem. It is a stylised reveal rather than a registered colour morph. The concept sheet is never displayed. No animation library was added.

`src/LogoReveal.tsx` pre-decodes the three images before playback, falls back to the original emblem on errors/timeouts, and removes decorative layers after completion. `src/logo-reveal.css` reserves the original logo proportions and plays the sequence once. Reduced motion shows the static emblem immediately, including when the preference changes during playback. The surrounding hero layout, jungle background and copy are unchanged. WebP animation layers retain the supplied transparency; original PNGs remain in `public/images/logo-animation/`.

Verified in Chromium at desktop/mobile widths: playback completes once, the final original is visible, decorative layers are removed, bounds remain fixed, reduced motion and failed-layer fallback work. Existing responsive/navigation/accessibility checks also pass. Deployment still requires approval.

## Content and images

### Jungle Adventure refinement

The current refinement uses locally hosted **DM Serif Display** headings (regular and italic) and **Nunito Sans** body/navigation text. Font licenses are retained in `public/licenses/`. `src/jungle.css` layers the warmer styling over the existing layout: softer frames, arched image crops, warmer green panels, gold buttons and restrained curved section transitions. Fonts load from the same host; no Google Fonts request is made.

The supplied jungle clearing and transparent original chameleon emblem are now integrated into the hero; the emblem also appears in the footer. The navigation retains its compact text wordmark. Both source PNGs remain unchanged in `assets/originals/`. Keep future original uploads in this folder; put optimised website copies in `public/images/` and reference those from `src/config.ts`. Files in `assets/originals/` are retained for editing and are not copied into the deployed site. Web-delivery copies live in `public/images/`: the background is quality-90 WebP (about 323 KB); the emblem is lossless WebP (about 1.15 MB), verified pixel-for-pixel against the supplied RGBA original. No logo redrawing, recolouring or removal of details was performed.

The hero keeps copy over the dark left side, with the logo over the sunlit right clearing. On mobile the emblem moves above the headline. The supplied About portrait and five animal-card images are installed. Only the separate community gallery retains labelled placeholders. The jungle scene is decorative artwork, not a photograph of a UK R&R facility.

Edit `src/config.ts` for email, Facebook, location, establishment year, telephone, original logo and photography paths. Section copy lives in `src/App.tsx`; visual styles live in `src/styles.css`.

The original logo and jungle artwork are installed. The About portrait and five animal cards now use the supplied images. The separate community gallery still has clearly labelled placeholders drawn with Lucide icons; replace those with approved gallery images.

Create `public/images/`, add the supplied original assets, then set the relevant paths in `src/config.ts`, for example `images/snake-enclosure.webp`. Preserve logo proportions; no replacement logo has been invented. The original logo is configured already; add an approved small favicon separately if desired.

Current image mapping:

| Section | Original in `assets/originals/` | Web image in `public/images/` |
| --- | --- | --- |
| About | `reptile-room-portrait-with-ball-python.png` | `about.webp` |
| Other exotic animals | `reptile-keeper-with-exotic-animals.png` | `exotics.webp` |
| Snakes | `snakes.jpg` | `snakes.webp` |
| Lizards | `lizards.jpg` | `lizards.webp` |
| Geckos | `geckos.jpg` | `geckos.webp` |
| Tortoises | `tortoises.jpg` | `tortoises.webp` |

The six web copies use quality-88 WebP, retain their full composition and natural colours, and are lazy-loaded. Originals are unchanged. Card display crops are controlled by `object-position` rules in `src/jungle.css`; the exotic-animal group uses `contain` so animals at the edges stay visible. Supplied images are not used to infer individual roles, animal availability or facility capabilities.

Still missing: the separate community gallery photographs (man with snake around shoulders, woman in pink with bearded dragon, optional man with tortoise), with permission for use.

Only use photography with appropriate rights and consent for identifiable people. Record permissions and licensing in your own records. Do not infer roles or identities from photos. Export appropriately sized WebP images (roughly 1600–2000px hero, 800–1000px panels; avoid upscaling). Use accurate alt text, and adjust `object-position` per image if needed. Panel aspect space is reserved to prevent layout shifts; below-fold images are lazy-loaded. For larger image libraries add responsive `srcSet` variants. No external photo service is contacted by this version.

The phone is empty and no telephone link renders. Set it only after confirming a real number. Do not insert the brief's temporary number. No specific animal availability, affiliations, emergency acceptance, veterinary services or unverified testimonials are claimed.

## GitHub

The existing checkout is linked to `curtisarjohnson-beep/UK-R-R`; the remote was empty when development began. Review changes before committing. To publish the first source commit yourself:

```sh
git add .
git commit -m "Build UK Reptiles and Recovery website"
git branch -M main
git push -u origin main
```

Do not run the branch command over another branch without checking your current work. No commit, push or deployment is performed automatically.

## GitHub Pages (free for this public repository)

GitHub Pages can host the same static build. Vite uses relative asset paths so the site works under `/UK-R-R/` as well as a domain root.

1. Upload the source to the repository's `main` branch.
2. Open repository **Settings → Pages**. Under **Build and deployment**, select **GitHub Actions** as the source.
3. When ready to publish, open **Actions → Deploy website to GitHub Pages → Run workflow**, choose `main` and run it.
4. Wait for the workflow to finish; its deployment result provides the website link.

Publish using Run workflow in Actions, or deliberately edit `.github/pages-deploy-request` and push that change to `main`. The latter provides an explicit publish trigger when API dispatch is unavailable. Ordinary source/image uploads do not publish. The expected project address is `https://curtisarjohnson-beep.github.io/UK-R-R/`, subject to successful deployment. The current preview stays unindexed because the branding and photography are incomplete. When ready for indexing, set `VITE_SITE_URL` to the full confirmed site URL, including `/UK-R-R/`. Leave it unset for this preview. GitHub Pages does not apply Cloudflare's `_headers` file.

When adding images, use `images/name.webp` without a leading slash for this relative-path build. For example, set `site.logo` to `images/logo.png`. Root-absolute `/images/...` paths would point outside the project directory on GitHub Pages.

## Cloudflare Pages (free plan)

Deploy only after the owner approves. In Cloudflare Pages, connect the GitHub repository, select `main` and use:

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | Repository root |
| Node version | 24 (environment variable `NODE_VERSION`) |

No Cloudflare credentials belong in source code. No paid services are required. This is a single-page anchor-based site, so no client routing rewrite is required. `public/_headers` adds basic response headers on Cloudflare.

## Production domain and search engines

Set `VITE_SITE_URL` to the confirmed HTTPS site URL in Cloudflare's production build variables (including the project path for GitHub Pages, or the actual Cloudflare Pages address or custom domain). Rebuild after changing it. The build generates an absolute canonical URL, `og:url`, `sitemap.xml` and a sitemap entry in `robots.txt`. Without it, builds deliberately use `noindex, nofollow` and disallow crawlers; no invented domain or invalid sitemap is published. Keep preview deployments unindexed by leaving this variable unset in their environment. A social preview image is pending licensed artwork; add `og:image` when available.

To attach a custom domain, use the Pages project's Custom domains flow and follow Cloudflare's DNS instructions for that domain. Confirm HTTPS works, update `VITE_SITE_URL` to the final origin, then rebuild. This project does not purchase a domain or alter DNS automatically.

Organisation structured data contains verified information only. No street address, registration status or reviews are fabricated. Privacy copy describes the current absence of forms, analytics and embeds. Revisit it if data collection changes; hosting and external email/Facebook services have their own privacy practices.

## Release checklist

- Supply approved rescue/community photography and consent; replace the remaining labelled panels.
- Review copy and confirm contact links with UK R&R.
- Confirm the domain and set `VITE_SITE_URL`; verify generated SEO files.
- Build, test and check keyboard/mobile behaviour after replacing assets.
- Approve deployment, then connect and publish through Cloudflare Pages.

The repository contains a functional visual preview. The logo and jungle background are installed; the About portrait and all five animal-card images are installed, while missing community-gallery photos remain identified. Updates are uploaded separately from the manual Pages deployment; run the workflow only after deployment is approved.
