# Galaxy Training — Exercise demonstration safety hold

**Status: UNVERIFIED / NOT CLEARED FOR INDEPENDENT WORKOUT USE**

## Immediate product decision (2026-11-11)

The existing legacy `dist/content-v3.js` stick-figure generator calculated two endpoint drawings from fixed limb lengths. Segment-length geometry is insufficient to validate a movement's biomechanics, joint tracking, stability, loading or range of motion. The generic in-card silhouette is also not movement-specific. Neither is an approved instructional representation.

As a precaution, the isolated core-app branch now removes those illustrations from the shipped content bundle and blocks **starting, resuming, recording sets, and finishing legacy physical workouts**. Previously saved workout history remains readable and unchanged in local browser storage. The current production app and separate workout workstream are not modified.

## Acceptance gate — owned by the Physical Development workstream

Every exercise intended for independent youth instruction requires:
1. Unique exercise ID and immutable media asset revision; no fallback placeholder or unrelated video link.
2. An accurate motion demonstration covering setup, controlled repetition, ending position, and return. A static pose or two disconnected positions cannot be treated as a technique demonstration.
3. Appropriate joint alignment and movement path, physiological joint ranges, pelvis and trunk control, foot or hand support, balance, and equipment contact, as applicable to the specific exercise.
4. Visible safe variants and clear stop/avoid cues for pain, loss of balance, or excessive load. Show both sides where unilateral.
5. Youth-appropriate pace, load, range, stability and supervision guidance. Additional qualified adult instruction for loaded movements.
6. Review of **every individual** exercise by a qualified youth strength-and-conditioning professional with demonstrated competency in biomechanics. Where appropriate, involve a physical therapist. Record reviewed asset ID, version, exercise ID, reviewer identity/qualification, review date, and results of each required check. Any material edit invalidates approval.
7. Validation on the actual mobile playback surface, including cropping, pose readability, slow/replay behavior, missing media, accessibility/reduced motion.
8. Independent review and signoff. Automated joint-length checks and approval metadata **cannot themselves verify biomechanical accuracy**.

Core contract: `GalaxyCore.isReviewedExerciseDemonstration(exercise)` checks presence and exact match of the six required review fields. This is a *structural check only*. The source-controlled review record and signed human evaluation are release requirements. The core app must not assume a generated or tagged asset is anatomically correct. The workout workstream must supply a reviewed animation/video adapter, with current URLs verified; only then can the legacy route be replaced.

## Exercise types to cover

The existing unreviewed illustrations depicted squat to chair, supported split squat, floor press, supported row, glute bridge, suitcase hold, incline push-up, calf raise, and dead bug heel taps. All other exercises in active workouts (including hip hinge practice, single-leg balance, band lateral walk, wall march, side plank and band pull-apart) also require reviewed movement-specific media before independent use.

## Release checks

- With no review record: no workout starts, no checked sets, no unsafe illustration injected, no progress history lost.
- With a review record for a different exercise/asset/revision, or any failed technique check: fail closed.
- UI must remain unblocked for Today, Learn, field drills and Progress.
- Re-run browser and actual phone QA after approved assets arrive.
- No production merge/deploy without owner approval and qualified safety review.
