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

## Content and images

### Jungle Adventure refinement

The current refinement uses locally hosted **DM Serif Display** headings (regular and italic) and **Nunito Sans** body/navigation text. Font licenses are retained in `public/licenses/`. `src/jungle.css` layers the warmer styling over the existing layout: softer frames, arched image crops, warmer green panels, gold buttons and restrained curved section transitions. Fonts load from the same host; no Google Fonts request is made.

The written refinement brief was supplied, but its visual reference image, exact original chameleon logo, illustrated jungle artwork and original photographs were not attached. The full illustrated composition is therefore **pending**, rather than approximated with generic leaf icons or generated rescue photography. Set `photos.hero.src` to approved local jungle artwork and `site.logo` to the exact original logo to activate the prepared background and hero emblem. The navigation retains its compact text wordmark. Prefer a transparent original logo if available; it is contained without cropping or recolouring. Adjust the hero image crop after reviewing the actual reference. The hero uses a dark readability overlay and the logo is repositioned above the headline on mobile. All existing content, section anchors, contact links and reduced-motion support remain.

The artwork should have layered foliage, vines and golden sunlight, with a naturally dark left-hand area for copy. This environment must come from a supplied/approved image asset. No unrelated illustration has been substituted. Selected section illustrations can be added after receiving the reference; current curves and borders are framing only, not replacement jungle artwork.

Edit `src/config.ts` for email, Facebook, location, establishment year, telephone, original logo and photography paths. Section copy lives in `src/App.tsx`; visual styles live in `src/styles.css`.

The supplied brief included **no image files**. This version intentionally uses a temporary text wordmark and labelled botanical photo panels, drawn with Lucide icons. They are not the original logo or authentic rescue photographs. Replace them before presenting this as the finished site.

Create `public/images/`, add the supplied original assets, then set the relevant paths in `src/config.ts`, for example `images/snake-enclosure.webp`. Preserve logo proportions; no replacement logo has been invented. Generate a favicon from the original logo once supplied and add its link to `index.html`.

Missing assets:

- Original Union Jack chameleon logo.
- Licensed cinematic hero photograph.
- Woman holding a snake in front of enclosures (About).
- Snake coiled in a leafy enclosure and bearded dragon close-up (showcase).
- Licensed tortoise, gecko and other exotic animal photographs.
- Man with snake around shoulders; woman in pink with bearded dragon; optional man with tortoise (gallery).

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

The workflow is manual. A push alone does not publish. The expected project address is `https://curtisarjohnson-beep.github.io/UK-R-R/`, subject to successful deployment. The current preview stays unindexed because the branding and photography are incomplete. When ready for indexing, set `VITE_SITE_URL` to the full confirmed site URL, including `/UK-R-R/`. Leave it unset for this preview. GitHub Pages does not apply Cloudflare's `_headers` file.

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

- Supply original logo, approved photography and consent; replace all labelled panels.
- Review copy and confirm contact links with UK R&R.
- Confirm the domain and set `VITE_SITE_URL`; verify generated SEO files.
- Build, test and check keyboard/mobile behaviour after replacing assets.
- Approve deployment, then connect and publish through Cloudflare Pages.

The first version is a functional visual preview, with missing brand and photo assets clearly identified. It has not been deployed.
