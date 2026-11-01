# Release checks — 2026-11-01

## Passed locally
- `npm test`: legacy records preserved, 9v9/11v11 formation counts and role paths, text escaping, independent player/format learning records, filters and history.
- All shipped scripts boot; 22 unique complete lessons; HTTPS demonstration URL construction; no weekday schedule in entry UI.
- Both strength workouts render each exercise; event-handler tests cover completion, persistence, resume, history, duplicate completion, timer pause/resume and navigation cleanup.
- Chrome browser walkthrough: Strength A start, first exercise saved, reload, resume at exercise two, finish and view completion in Progress.
- Chrome browser walkthrough: switch player, verify isolated history, complete Strength B, save reflection, active date deduplicated.
- Chrome browser: learning library entry and guided lesson entry.

## Fixes made
- Explicit Strength A / Strength B / Ball Training names.
- Resume unfinished strength sessions, show completed sessions in Progress, prevent restarting today's completed workout.
- Count completed strength dates in active days without double-counting reflection dates.
- Resume timer with wall-clock deadline calculation; reset timer state between exercises.
- Remove conflicting suitcase-hold instructions from guided session.
- Replace obsolete weekday assertions with current session-selection assertions.

## Remaining release gates / limitations
- This is a browser-local prototype. No family authentication, cloud sync, parent dashboard or imported-record migration.
- No Vercel account connection or production deployment performed by configuration alone.
- Tests do not certify coaching suitability, every video playback, mobile Safari, offline installation, or cross-device storage.
- Strength plans support the existing one/two-set setting; a complete progressive training program is still pending.
- Browser verification was on the development preview; recorded test sessions are not user workout records and are not included in source.
- GitHub CI requires its first hosted run to confirm workflow permissions. Branch protections must be configured separately.

## Strength card redesign
- Original Galaxy-style exercise deck with a two-position diagram for every exercise, video link, set/rep/rest stats and short technique cue.
- Browse with swipe, arrow keys, numbered navigation or Previous/Next; browsing never records exercise completion.
- Per-set and per-side checks, undo, persisted partial progress, and existing one/two-set setting respected. Existing completed sessions remain complete.
- Automated checks cover deck navigation, one/two-set tracking, left/right sides, resume, undo, all nine exercise illustrations, completion and player separation.
- Browser checked card rendering, left/right completion and next-card navigation. Touch gesture hardware and mobile Safari remain unverified.

## Illustration and palette rework
- Replaced freehand pose coordinates with joint-based figures using fixed torso, upper/lower arm and thigh/shin lengths.
- Added geometry assertions across all 18 poses; corrected split-squat knee direction and floor clearance.
- Stronger purple/blue artwork, black frames, white figures and surfaces, and blue progress accents.
- Existing functional regression suite passes. New browser visual review was blocked by preview-browser access; geometry tests are not professional anatomical certification.
