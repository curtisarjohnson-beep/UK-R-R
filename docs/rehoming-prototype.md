# Rehoming and Facebook preparation demo

This is an interactive **browser-local prototype**, not a production administration system. It runs on GitHub Pages without Cloudflare or Meta credentials. No password is requested. No social post is sent to Facebook.

## Open the demo

- Catalogue: `/UK-R-R/rehoming/` → `/UK-R-R/#/rehoming`
- Animal example: `/UK-R-R/rehoming/moss/` → `/UK-R-R/#/rehoming/moss`
- Admin: `/UK-R-R/admin/` → `/UK-R-R/#/admin`
- Animals: `/UK-R-R/#/admin/animals`
- Facebook queue: `/UK-R-R/#/admin/social`
- Templates: `/UK-R-R/#/admin/templates`

Canonical URLs use hash routing so refresh and sharing work without an application server. `scripts/routes.mjs` generates static redirect entry points plus a `404.html` route recovery page. A direct URL for a newly created local animal redirects into its hash profile route. Another browser cannot see that locally created record. The 404 recovery script assumes the GitHub Pages project base `/UK-R-R/`; update it if the project is moved to a different subpath. A future Worker/router can replace these redirects with real server routes.

The fictional sample animals use existing illustrative photography. They do not describe real animal availability. Drafts and archived animals are never returned by the public UI. Published rehomed animals can be browsed with the availability filter; archive them to remove them publicly.

## Try the complete workflow

1. Open Admin → Animals → Add an animal. Name and species are required; other fields and photographs are optional.
2. Upload up to eight JPEG, PNG or WebP files. Select a primary photo, then save as a draft. Preview the record; its public URL remains unavailable.
3. Publish with Available status. The catalogue updates in this browser and one introductory Facebook draft is created.
4. Open the prominent Pending Facebook Posts count. Review the caption and photograph, edit if needed and save.
5. Approve the saved version explicitly. Only then is **Simulate Publish** available. Editing an approved caption or photo removes approval.
6. Simulate success or use the deliberate failed-attempt checkbox. Failed attempts require approval again before retrying. History records the outcome and the caption/photo snapshot. Nothing is sent to Facebook.
7. Copy Caption or Download Image independently to prepare a manual post. The caption clipboard action also works for unsaved preview text.
8. Change the animal to Reserved, then Rehomed. Each meaningful status transition generates its appropriate draft. Repeated saves or unrelated text edits do not.
9. Edit Social Templates, insert placeholders and preview against an animal. Saved templates affect future generated drafts; existing drafts retain their original generated wording. Restore defaults with confirmation.
10. Archive/delete with confirmation, or Reset demo data to clear all local records, templates, uploaded photos, event markers and history.

Changing availability makes older incompatible announcements ineligible for approval/publication. Archived, unpublished and deleted animals' announcements are also ineligible. Rejected drafts can be returned to review. If a simulation is interrupted by refresh, use Recover interrupted simulation, then review and approve a retry.

## Local persistence and limits

`src/rehoming/model.ts` defines replaceable Animal, Photo, Template, Post, History and Auth service interfaces. `services.ts` implements them using IndexedDB. Components use the interfaces through `context.tsx` rather than opening IndexedDB directly.

Database `ukrr-rehoming-demo-v1` contains:

- `state`: a versioned snapshot of animal records, templates, social drafts, unique event markers and audit history.
- `photos`: locally optimised image blobs. Sample photos reference static, same-origin assets.

Saving an animal and generating its announcement occurs in one read/write transaction. Event IDs include animal ID, record revision and event type. The `introduced` flag prevents repeated first-availability announcements. Optimistic revisions reject stale edits from another tab. BroadcastChannel refreshes other open tabs on this origin. These are browser consistency mechanisms, **not security boundaries**.

Images are limited to 15 MB and 40 megapixels (12,000 pixels per edge) before optimisation and 2 MB after optimisation, resized to a longest edge of 1600 pixels and encoded as WebP where supported. Total local photo storage is capped at 25 MB. Removing a photo from an editor detaches it; its stored blob may remain because announcements can reference it. Reset demo data clears these retained blobs too. Browser quotas can be smaller, and clearing browser/site data or using a private session may remove the demo. No cross-device synchronisation, backup or server storage exists.

Templates support `{{name}}`, `{{species}}`, `{{age}}`, `{{sex}}`, `{{personality}}`, `{{description}}`, `{{profile_url}}`. Unknown/malformed placeholders are rejected. If a supported optional value is empty, its entire template line is omitted; put optional labels on their own lines. Missing details are never invented.

## Validation

- `npm ci`
- `npm run build`: strict TypeScript, Vite, SEO generation and static route entry points.
- `npm test`: existing rendered-site checks plus IndexedDB workflow tests using a test-only emulator.
- Browser checks cover catalogue filters, profiles, local uploads and primary selection, draft privacy, persistence/refresh, templates, caption edits and approval invalidation, clipboard/download, status transitions without duplicates, simulated failure/retry/history, archive/reset and mobile layouts.

No live authentication or Facebook publishing is implied by a passing simulation. See [Cloudflare migration](cloudflare-migration.md) for the production boundary.
