# Galaxy Curriculum — integration and review checkpoint
Updated: 2026-11-11 | Branch: `feature/galaxy-curriculum-integration-20261111`
**Release status:** draft PR only, isolated Vercel preview READY. Not merged or production-approved.

## What is integrated
- All **250** authored curriculum titles, objectives, domain/level tags, and **306** prerequisite references from the Galaxy Training architecture deliverable are staged as **unpublished** data in `dist/curriculum-catalog.js`. There are **no verified videos** for these 250 new lessons.
- `dist/curriculum-preview.js` contains three distinct, **coach-unreviewed** lesson experiences: GI-001 scanning; TM-005 cushioning first touch; TM-006 receiving across the body. Each includes an original three-frame **storyboard**, a situational decision with multiple context-dependent rationales, a setup/variation field drill, and an observable match challenge. **No instructional motion videos have been produced.**
- `dist/training-v3.js` integrates a lightweight curriculum preview in its existing **Learn** tab. A single modal presents Watch → Practice → Apply; searchable/filterable roadmap metadata is optional. No new primary navigation or separate app.
- Existing **36 Game IQ lessons** continue working unchanged, including progress. The core app workstream still owns Today, Learn, Train, Progress navigation and player storage.
- The physical workout safety hold remains in force. No exercise animations were modified or authorized.
- The original ten-pilot metadata records are retained; the three detailed review stories are part of that ten-lesson sequence.

## Gates enforced
- The `GalaxyCurriculum` fail-closed adapter refuses to publish or convert a lesson to a core lesson unless it has a non-placeholder concept, verified video/animation asset with rights/revision, assessments, aligned drill, match evidence, prerequisite publication, and ten revision-bound approvals.
- The staged 250 entries are `catalog_draft`, the three illustrated reviews never claim verified media, and **no curriculum preview interaction writes player progress**.
- Existing v1/v3/core browser keys are preserved. No completion equivalence or mastery transfer is inferred for legacy lessons.

## Automated checks
- `npm test` runs `checks/v3.cjs`, `checks/core.cjs`, `checks/curriculum.cjs`, and `checks/curriculum-ui.cjs`.
- GitHub CI passed at `6026596c64026f86ac19c4dd0d1e37a3df1d0f57`.
- Tests cover exact catalog count, domain distribution, 306 prerequisite edges, graph integrity, publication failure cases, core adapter, sample lesson text and three-stage rendering, search/filter, player state non-mutation, legacy app regressions, and physical-workout safety block.
- These are automated logic/DOM-mock checks, **not touch-device or coach certification**.

## Isolated Vercel preview
- **URL:** https://galaxy-training-core-isolated-preview-b9vagwwxu.vercel.app
- **Deployment ID:** `dpl_E33z9sVudjxwHyGGQ7tKSodgMMpU`.
- **Environment:** isolated project, target omitted (Vercel preview default); no production domain alias assigned.
- **Status:** READY; Vercel build logs include passing v3, core, curriculum checks.
- **Deployed runtime commit:** `0a9bbd9a1d7897ce3152391d10e5d6da339d746d`. Later commits only added extra UI regression checks, no changes to the deployed runtime.
- Access may require account authentication because this Vercel team has SSO protection enabled.

## Owner/coach/device gates — stop here
1. **Youth-soccer coach/tactical reviewer:** review positioning/decisions for GI-001, TM-005 and TM-006 (especially misleading first-touch geometry), 9v9/11v11 examples, safe solo/partner drill progression, and expected U11/U13 comprehension. Mark edits; no signed review assumed.
2. **Instructional media:** create original full-motion clips or obtain expressly permitted, verified segments for each lesson, review attribution and rights, and bind reviewed asset revision. Static tactical diagrams do not satisfy video-first media publication.
3. **Real devices:** test iPhone Safari and Android Chrome for catalog search, scroll/sticky elements, 3-step overlay, close/focus, frame controls, player switching, recovery, media failure states, existing v3 lessons, and disabled physical workouts. Capture screen recording and observations. Browser DOM-mock passing is not device signoff.
4. **Core app owner:** reconcile legacy v3/core sidecar event writing and backups before player-facing publication. Review PR #4 contract and no false mastery.
5. **Release owner:** choose canonical Git-linked project, apply protected release path and rollback, then authorize merges. No production promotion without explicit approval.

## Change isolation
- PR #6 (this curriculum branch) is stacked on draft core PR #4; independent workout PR #3 remains untouched.
- Source tree, CI tests and one isolated preview were updated. `main` and existing production aliases were not changed.
