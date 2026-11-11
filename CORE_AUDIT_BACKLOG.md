# Galaxy Training — audit, release gates and prioritized backlog (2026-11-11)

## Confirmed starting state
- GitHub source-of-truth candidate: `StationWorksSolutions/app` on `main`, static entry point `dist/index.html`; `vercel.json` serves `dist`. Its original v3 script had three navigation entries (Learn, Drills, Workout), browser-local v3 progress and two fixed profile slots.
- The repo retains many obsolete/experimental scripts (app-refresh, journey, quiet, v4 prototype, etc.). These are not loaded by `dist/index.html`. Do not accidentally combine their event handlers or styling.
- `main` has a historical visual prototype and outdated README/PRODUCT_DIRECTION material. This branch implements the locked Today → Learn → Train → Progress navigation while preserving existing validated content. The earlier three-card v4 prototype is not the app entry point.
- Vercel currently contains manually maintained v4, v5 and v6 Galaxy projects that reported READY during inspection. None was confirmed Git-connected or selected as the authoritative production app. The account's GitHub Login Connection is currently missing, so automatic repo-linked preview creation was unavailable.
- v3 saves to `galaxy-training-unified-v3` and preserves `galaxy-training-v1`. It does **not** sync devices, and changing origins causes separate browser storage. No authentication exists.
- Core v1 is intentionally an additive sidecar at `galaxy-training-core-v1`, not a completed one-writer migration. Its explicit progress events complement rather than rewrite the legacy records.
- The existing v3 curriculum is 36 concepts. The content and physical workstreams still own future curriculum and animated workouts; no 250-lesson delivery claims are made here.

## Implemented in the isolated core branch
1. Four-tab navigation, mobile bottom navigation, one Today recommendation and completion message; Train delegates to existing field drills/workouts; Progress distinguishes training participation from competency.
2. Browser-local stable player IDs, initially Jay and James, optional additional named profiles, isolated progression and saved resumes.
3. Shared sessions, explicit transition guards, save/exit/resume and match-application event recording. New future content should use the shared API.
4. Per-player weekly and dated practice/match/futsal/recovery schedule editor with rule-based non-stacking recommendations.
5. Versioned, content-neutral lesson/exercise/workout contract validation and architecture documentation.
6. Local backup export includes the core sidecar. New backups can restore it; old v3-only backups remain accepted with clear migration limitations.
7. Existing regression suite and new core service tests run in GitHub Actions. An isolated Vercel static deployment exists but is **not** a human-verified mobile QA signoff.

## Priority backlog and acceptance criteria

| Priority | Item and owner | Acceptance criteria |
|---|---|---|
| P0 | Consolidate v3 and core into one event writer (Core) | Idempotent v1/v3 migration with stable player identity, historical dedupe, old/new backup restoration, rollback-tested; no lost training records; no stale legacy writer overwriting new events. |
| P0 | End-to-end interruption QA on iOS Safari / Android Chrome (Core QA) | Lesson at each step, drill partway through and workout partway through survive close/reload/player switching; status never becomes stuck; completion screen correctly reports finished today. |
| P0 | User-facing error and missing-media states (Core UX) | Absent or failed video shows clear retry/alternative, preserves cursor and progress; a content module crash does not blank Today or navigation. |
| P0 | Set canonical deployment and link GitHub to Vercel (Release owner) | One approved Git-linked project, protected main release, branch previews with exact commit metadata, test/rollback playbook. Do not repoint existing live domains or delete prototypes without approval. |
| P0 | Integration adapter contract tests (Core with content/workout owners) | Validate actual output schemas and asset IDs from both workstreams on a branch; old content continues to load; reject malformed modules without crashing. |
| P1 | Player positions and objectives UI (Core UX) | Add/edit multiple positions, persist per profile, show one current objective on Today/Progress, no false mastered indicator. |
| P1 | Lesson discovery shell (Core UX + Content integration) | Search, filter, prerequisite cues, resume location and position-based pathway using validated content metadata only; video stays primary. |
| P1 | Recovery/scheduling refinements (Core + Workout metadata) | Read real recorded prior exertion and incomplete sessions; distinguish optional work vs recommendation; never automatically prescribe a demanding workout after match/practice. |
| P1 | Session finish/review workflow (Core UX) | One completion confirmation, next recommendation without auto-start, realistic review due time, optional short match reflection and skip/restart reasons. |
| P1 | Visual QA and accessibility (Core UX) | Touch targets >=44px, contrast and reduced motion validated, fixed navigation does not cover controls, keyboard focus and screen reader labels verified. |
| P1 | Persistence reliability (Core data) | Storage quota/failure surfaces error, backup round-trip tests for both schemas, corrupted data handled without silent data loss. |
| P2 | Cross-device sync decision and migration (Core + parent) | Only after verified need: privacy/consent, access rules and migration tested; no authentication introduced preemptively. |
| P2 | Performance instrumentation (Core) | Measure first usable screen, navigation response, media failure and crash rates on actual phones; no arbitrary gamification metrics. |

## Integration process
- **Branching:** `main` is release-only; separate `feature/galaxy-core-foundation-20261111`, content and workout branches. Workstream maintainers do not edit core navigation or storage schema.
- **Adapters:** each workstream supplies schema v1 metadata, stable IDs, asset resolvers and structured activity events, not its own player store or app shell.
- **Merge gate:** approve architecture contract, reconcile source IDs + data migrations, pass contract/integration tests, device UX and Vercel preview checks. Open a draft PR first; only merge to `main` after explicit owner authorization.
- **Rollback:** preserve last known-good `main` SHA and last verified production deployment. Undo release via platform rollback after any persisted-data compatibility review; never truncate local histories.
- **Privacy:** profiles store minors' names and notes; do not expose backups or publish them as build artifacts. Local browser profiles are not secure authenticated accounts.

## Current limitations / deferred items
- The new core sidecar and existing v3 storage are both in use. Cross-device sync is **not** available. Full historical migration is **not** complete.
- The app's existing lesson library is not the 250-lesson workstream; field/physical content is intentionally unchanged.
- Physical-device navigation and media-playback verification remain pending; Node DOM mock tests do not establish production UX quality.
- The Vercel standalone preview reports READY but has no GitHub automatic update integration. The new isolated project was targeted as a preview but Vercel classified its first deployment as production **within that isolated project only**. No preexisting Galaxy production site or project was modified.
