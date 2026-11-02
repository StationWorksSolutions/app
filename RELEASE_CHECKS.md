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

## Purpose-led training and Game IQ levels
- Renamed strength sessions Full-Body Strength and Single-Leg Strength. Internal A/B IDs remain stable to preserve historical records.
- Added explicit one-set learning / two-set building choices, player-specific load and rep targets, and prescription snapshots on completed sets. No automatic weight increases.
- Strength progression informed by NSCA youth resistance-training guidance; exercise selection retained for available equipment and novice lifting technique. This is an original adaptation, not an imported third-party workout.
- Three ball decks, including an optional controlled 20s work / 40s walk conditioning block.
- 36 concept lessons in six Game IQ levels, with original scenarios and solo/brother adaptations and relevant FIFA watch/study references.
- Explain / real example / later-day recall milestones, separated by player and game format; all levels remain accessible. These are self-reported, not assessed mastery.
- Automated coverage: all level IDs unique/present, all lesson fields and demonstration links, recall day gate, player/format isolation, all ball decks and two-set selection.
- Browser visual review and external video playback not reverified for this revision.

References:
- https://www.nsca.com/globalassets/about/position-statements/position_stand_youth_resistance_training---2009.pdf
- https://www.fifatrainingcentre.com/en/game/game-analysis/landing-page-core-principles.php
- Individual relevant coaching pages are linked in the app. Team sessions are study references; home drills are original small-space adaptations.

## Visual-first deck revision
- Home now uses three deck cards; Game IQ uses 36 concept-specific whiteboard storyboards and a three-card See / Predict / Try flow.
- Tap/swipe frame navigation, replay and keyboard stepping. Optional constrained play-description builder with possession and pitch-bound validation.
- Four daily strength rotations, same-day session snapshots, dated history labels; old A/B records preserved.
- Tests pass for 108 lesson card renders, all storyboards, parser validation, daily rotation and stable resumed exercise selection.
- Browser visual QA remains unavailable. Standalone SVG raster inspection was also unavailable because the renderer dependency is missing. Automated geometry/data checks are not tactical or usability validation.

## Full-screen and tap-board revision
- Expanded each new dated strength rotation to eight distinct existing movements, with dynamic exercise counts. Previously started decks retain their saved lineup.
- Added full-screen card presentation, close button, Escape and top-of-card downward swipe exit. Swipe must still be tested on physical devices.
- Replaced typed play commands in the UI with player/action controls and pitch taps, undo/reset and step-through playback.
- Tests cover all-eight completion, preserved legacy records, builder moves/passes, invalid targets and close controls. Browser/mobile visual QA remains outstanding.
- Account-name searches did not reliably identify the exact requested TikTok creators. No claim of reviewing those creators' clips. Related verified reference: https://academy.coachesvoice.com/ (tactics-board masterclasses).
