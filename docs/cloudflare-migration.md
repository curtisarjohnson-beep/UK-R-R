# Future production architecture — not connected in this prototype

The prototype exposes the complete UI using service interfaces in `src/rehoming/model.ts`. Implement HTTP-backed adapters for those interfaces when deploying Cloudflare Workers, D1, R2 and Access. Keep the same models and UI; replace the `createDemoServices` provider with authenticated API services. Importing fictional browser data into production must be deliberate, not automatic.

## Workers API and authorisation

Suggested endpoints:

| Endpoint | Access / behaviour |
| --- | --- |
| `GET /api/animals` | Public; published, non-archived records only; validated filters and pagination |
| `GET /api/animals/:id` | Public; return 404 for drafts/archived records |
| `GET /api/admin/animals` | Authorised volunteers; include drafts and archives |
| `POST /api/admin/animals` | Validate fields; insert animal and transactional outbox event |
| `PUT /api/admin/animals/:id` | Validate revision with `If-Match`; save animal plus meaningful event atomically |
| `POST /api/admin/animals/:id/archive` | Authenticated state transition, audited |
| `DELETE /api/admin/animals/:id` | Authorised deletion, with retention policy for related history |
| `POST /api/admin/photos` | Authenticated upload/metadata flow; image validation and size limits |
| `GET/PUT /api/admin/templates/:type` | Authorised template management with revision checks |
| `GET/PUT /api/admin/posts/:id` | Draft retrieval/edit; edits invalidate approval |
| `POST /api/admin/posts/:id/approve` | Explicit volunteer action; immutable approval snapshot/hash |
| `POST /api/admin/posts/:id/reject` | Rejection with actor/time, no publish call |
| `POST /api/admin/posts/:id/publish` | Require approved current version and authorised actor; enqueue guarded job |
| `GET /api/admin/history` | Audit history with stable pagination |
| `GET /api/session` | Verified identity/capabilities; no frontend-held access token |

Protect the administration application with Cloudflare Access and enforce authorisation **again inside every Worker admin endpoint**. Verify the Access JWT signature using the correct issuer's JWKS, issuer, audience and expiry; bind authorised identities to an allowlist for Danny and Lainey configured securely at deployment. Do not invent their addresses. A hidden client route, trusted request header alone or demo Auth adapter is not authentication. Keep public endpoints separate and ensure draft fields cannot leak through public serializers, caches or photo URLs.

Use same-origin APIs, restricted CORS, origin/CSRF protections where applicable, validation of every body, rate limits and upload quotas. Escape content by default; no raw HTML caption/profile rendering. Return clear validation/conflict errors without exposing credentials. Add access controls to exports and resets; demo reset must not become an unprotected production endpoint.

## D1 data model

Use migrations and constraints for:

- `animals`: ID, slug, revision, all descriptive fields, availability, publication status, archive flag, first-availability-announced flag, created/updated times.
- `photos`: ID, animal ID, R2 object key, safe content type, dimensions, byte size, original display filename and ordering/primary metadata.
- `animal_status_events`: event ID, animal ID, old/new states, revision, actor and timestamp. Unique `(animal_id, revision, event_type)`.
- `social_templates`: event type, wording, revision and last editor.
- `social_drafts`: event ID (unique), animal ID, generated caption snapshot, editable caption, photo metadata snapshot, profile URL, revision and workflow status.
- `social_approvals`: draft ID/version, content hash including caption/photo, approver identity, approval time and revocation state. Approval must match the current draft content.
- `publish_attempts`: unique attempt ID, draft ID/version, approved content hash, status, timestamps, error category and returned Meta post ID.
- `publishing_history`: immutable action/result records, actor, caption/photo snapshot and external post ID if actually published.
- `outbox`: durable work queued in the same transaction as animal changes and approvals.

Use D1 transactional batches/constraints for animal changes + event/outbox rows, and draft changes + approval revocation. Never generate a second event merely because a form resubmits. Preserve an explicit first-publication marker and support deliberate repost events only as a future, separate action. Optimistic concurrency and unique IDs are needed across requests and workers, not just in React.

A production workflow should be `Pending Approval → Approved → Publishing → Published/Failed`, with Rejected as an explicit review outcome. Reject or revoke stale announcements when an animal's publication/availability changes. An archived/deleted animal must not be publishable through an old approved draft. Store edits and approval decisions durably before scheduling publication. Editing approved content requires a new explicit approval.

## R2 image storage

Store originals privately in R2, with separate optimised delivery variants. Validate actual decoded image type, dimensions, decompression limits and size; do not trust client MIME/extension. Strip unnecessary metadata and scan/process uploads server-side. Use random object keys rather than user filenames. Signed admin upload URLs must be short-lived and constrained; finalise metadata only after the object is verified. Serve only authorised/public variants through an image Worker with appropriate cache headers and no draft-photo leakage. Preserve photo snapshots needed for publication history under a documented retention policy; clean up unattached uploads and deleted records safely.

## Cloudflare Access

Set up the staff identity policy for the real authorised volunteers, test allowed and denied identities, and keep the Access application audience/issuer as server configuration. Worker endpoints must check both verified identity and permission on each mutation. Production sessions should use secure same-origin mechanisms, and the frontend should receive only a safe session summary. The prototype intentionally has an open Demo Mode and must never be mistaken for this production boundary.

## Meta Graph API integration

Use a Facebook **Page**, not a volunteer's personal account. Configure the appropriate Meta app/business/Page relationships and current Graph API version. Typically Page selection needs `pages_show_list`, Page data access needs `pages_read_engagement`, and publishing needs `pages_manage_posts`; verify the current permissions and endpoints in Meta's official documentation during integration. App Review/Advanced Access, business verification and role/test-user restrictions may apply depending on app mode, account ownership and the intended users. Development-mode success does not establish permission for all staff or public production use.

Store Page credentials and app secrets only in Worker secrets or an equivalent server-side vault. Never ship them in the Vite bundle, browser storage, repository or logs. Record selected Page ID, permission grants, token expiry/revocation and authorised staff roles. Provide a reconnect flow for expired/revoked credentials and handle permission, image, validation, rate-limit and service errors separately.

For live photo publishing, a Worker/queue consumer must recheck the current animal, approved content hash/version and unique publish attempt before calling the versioned Page photo/feed endpoint. Use private-to-public image delivery appropriate for Meta fetching or a supported multipart upload. Do not submit any post before explicit admin approval. Persist the returned Facebook post identifier and result. A request timeout after submission is **ambiguous**, not proof of failure: reconcile the external result before retrying, so a repeated job cannot create a duplicate live post. Use a durable lock/queue claim, unique attempt records and bounded retries with reconciliation; do not promise external exactly-once behaviour based on a local flag alone.

Keep Copy Caption and Download Image available while live access is unavailable. Separate simulated events from production events and never import a simulated Published status as evidence of a live Facebook post.

## Migration/release checklist

1. Provision Worker, D1, R2, Access and environments, with secrets entered securely outside chat/source.
2. Apply reviewed migrations and service adapters; test backup/restore and upload retention.
3. Verify public data filtering and denied admin requests server-side.
4. Test concurrent saves, repeated events, approval invalidation, missing images and stale announcements.
5. Integrate Meta in test mode, satisfy current review/permission requirements, then test explicit approval, token expiry, failed/ambiguous attempts and duplicate prevention.
6. Deploy to a staging origin with genuine login; obtain approval before switching on live Facebook publishing.
7. Move public/admin routing to the Worker and remove GitHub Pages redirect assumptions. Preserve profile URL redirects if changing canonical URLs.

No part of this document connects a live service or grants permission to post real announcements.
