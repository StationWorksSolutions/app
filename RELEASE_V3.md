# Galaxy v3 — release verification

Date: 2026-11-11. Branch: feature/galaxy-training-unified-v3-20261111.

## Implemented
- One top navigation: Learn, Drills, Workout, with a player selector; no bottom bar or extra sign-in layer.
- Full-screen cards with close, Escape, swipe-down dismissal and frame navigation.
- 36 concepts in six levels; three-beat visual scenarios, decisions, optional coaching references, solo/partner practice and self-reported evidence.
- Five drill decks with per-player daily checkoffs and bounded goal-to-session matching.
- Eight-movement Technique and ten-movement Build sessions, per-set checkoffs, undo and same-day resume.
- Existing v1 records preserved; v3 progress and v1 archive export in one local backup.
- Responsive Galaxy purple / blue / black / white design, including legacy exercise-specific motion illustrations.

## Automated checks

npm test verifies code syntax and boot, 36 unique complete concepts, six levels, storyboards, HTTPS-format reference URLs, player name carryover, top-level navigation, lesson flow, drills, goal matching, 8–10 movement plans, checkoffs, session resume and preservation of v1 records.

## Still unverified

Actual iOS/Android visual rendering and swipe gestures; playback of every external source; soccer-coach review of diagrams and age appropriateness; cross-device accounts or sync; offline installation; hosting activation.

These are explicit limitations, not completed features.

## Release gates
1. Confirm passing GitHub CI on the PR.
2. Connect Vercel and inspect the branch preview on an actual phone: navigation, lessons, diagrams, drills, workout, reload and resume.
3. Review the coaching diagrams and demonstration links with a competent coach, prioritizing the first lessons and active session exercises.
4. Approve merge after preview, and only then validate the production URL.
5. Address family sign-in, device sync, and parent permissions in a separate change if required for launch.

**Current status: implemented and CI-tested in a GitHub feature branch; not yet published as an app release.**
