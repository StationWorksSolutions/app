# Galaxy Training — curriculum workstream integration (2026-11-11)

**Status:** draft workstream integration on `feature/galaxy-curriculum-integration-20261111` based on the core foundation branch. Not a production release. No curriculum draft is playable.

## Confirmed scope
- Existing 36 Game IQ lessons are unchanged and remain in their existing source and player records.
- `dist/curriculum-gate.js` is a content-only, browser/Node module. It does not own navigation, player IDs, progress persistence, or physical workouts.
- `dist/curriculum-pilot.js` contains **10 metadata-only draft objectives**, selected as a prerequisite-closed pilot. These are **not** coach-approved media-backed instructional lessons.
- The separately delivered 250-record architecture catalog remains a staged design artifact (Galaxy_Training_Curriculum_Architecture_v1.zip), **not** 250 approved live lessons. Full catalog import is pending approval of production schema and content.
- `dist/index.html` loads the additive adapter ahead of the legacy app without replacing `window.GALAXY_CONTENT`; current learner pathways do not show unusable draft lessons.

## Publishing requirements (fail closed)
`GalaxyCurriculum.publicationIssues(lesson, {media,drills,lessons})` requires:
1. Stable ID, title, objective, version, position tags, valid prerequisites.
2. Non-placeholder concept definition.
3. Watch media IDs, observed cue and at most three coaching cues.
4. Each media item identified by immutable asset and revision, playback verified, rights recorded, youth suitability and coaching approved.
5. Interactive decision situation with at least two *contextual* rationales.
6. A referenced, defined field drill aligned to the exact concept.
7. Match challenge and observable evidence.
8. An assessment including rationale.
9. Revision-bound approvals for ten required review areas.
10. A valid formation/age-format distinction.

No status string or passed JSON Schema alone can bypass these checks. `toCore()` refuses unpublished or incomplete lessons. A human coach must review the actual content; fixture tests prove gates, not real coaching sign-off.

## Integration contract
- On validated content only: `GalaxyCurriculum.toCore(lesson, registries)` returns the existing `GalaxyCore.validateLesson` schema v1 (`id/title/positionTags/prerequisites/media`).
- The Core workstream continues to own `createSession/transition/setCursor/recordEvent` and Today recommendations.
- Expose only `publishedLessons(catalog, registries)` to Today/Learn. `eligible` filters by reviewed publication, prerequisites and position.
- `OUT` is a broad recommended-role tag, **not** an access restriction for required cross-role learning. Prerequisites remain reachable for a player rotating roles; the final pathway can teach the same concept through a GK example.
- Format-specific 4-3-3/4-2-3-1 demos must be 11v11. Shared principles may be adapted to 9v9 using a different example.
- Event-derived progress dimensions remain separate; self-report never becomes independently verified competence. Review due is derived by date.
- Existing storage keys `galaxy-training-v1`, `galaxy-training-unified-v3`, `galaxy-training-core-v1` are not read, erased or rewritten by this content adapter.

## Required next work to authorize launch
1. Freeze the canonical 250-record catalog and adjudicate the 13 overlapping lesson pairs; complete 47 concept definitions and validate the role/format branches.
2. Develop and coach review GI-001 → TM-005 → TM-006 with original approved media, interactive tactical choices, matched field drills and observed match criteria.
3. Pass publication gates, validate real media on mobile, test the guided player journey and player records; then review the other seven pilot lessons.
4. Integrate the **approved** lessons into the core screen and event lifecycle with the core owner, not through parallel UI/persistence.
5. Run full CI, real iOS/Android QA, exact-version Vercel preview and owner release approval before merging core/content/workout workstreams or promoting production.
