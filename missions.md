## General Guidelines (all roles)

- Target time: ~2 hours for your mission.
- Use your own private repo; push your code and invite the reviewer.
- Record a 2–3 minute Loom demo showing what you built and how to run it.
- Share the Loom link in `SUBMISSION.md`.

---

## Frontend Developer

1) Add Favorites (local)
- Heart toggle on `NFTCard` to add/remove from favorites (localStorage)
- Show a `/favorites` page listing favorited NFTs with the existing card UI

2) NFT detail — history UI
- On `app/nft/[id]/page.tsx`, render a simple history list using `GET /nfts/:id/transactions`
- Group by event type; add loading/empty states and accessible table semantics

3) Navigation accessibility improvements
- Add a “Skip to content” link and `aria-label` on the top `nav`
- Manage focus order after route changes (e.g., focus main heading)

---

## Backend Developer

1) History alias + pagination
- Add `GET /nfts/:id/history` as an alias to existing transactions
- Support `page`, `limit`, and optional `type` filter (sale|list|delist)

2) Wire Zod query validation
- Apply `validateQuery(schemas.nftQuery)` to `GET /nfts`
- Return 400 on invalid params; keep response shape consistent

3) User favorites (server)
- Extend `User` with `favorites: ObjectId[]` and endpoints:
  - `GET /users/me/favorites`, `POST/DELETE /users/me/favorites/:nftId`
- Protect with JWT cookie; basic input validation

---

## Blockchain Developer

1) Mock blockchain adapter
- Create `apps/api/src/services/blockchain.ts` with `mintToken`, `transferToken`, `getOwner`, `getTokenURI` (in-memory/mock)
- Log calls and return deterministic values; no external chain required

2) Integrate adapter in mint flow
- Call `mintToken` inside `NftsService.mint`; persist returned tokenId/URI
- Add a feature flag to toggle the adapter (env var)

3) EIP-712 verification demo
- Add `POST /market/verify-listing` that verifies a signed payload server-side (mock domain/types)
- Return verification result and recovered address

---

## Technical Lead

1) Shared ESLint + Husky
- Add a shared ESLint config at repo root and apply to `apps/*`
- Add Husky pre-commit to run `pnpm -w lint` and type-check

2) Basic CI pipeline
- Add GitHub Actions to install, build, and type-check both apps on PRs
- Cache pnpm store for speed

3) Request ID propagation end-to-end
- Ensure `x-request-id` is echoed in responses and logged on the web client
- Add client-side logging helper to include request ID in error reports
