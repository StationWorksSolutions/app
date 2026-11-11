# Galaxy Training

Visual-first soccer development web app for two browser-local player profiles.

## Current application (v3)

The entrypoint is dist/index.html. Architecture:
- dist/content-v3.js: 36 Game IQ concepts, six levels, coaching references, tactical storyboards and nine original exercise illustrations.
- dist/training-v3.js: Learn / Drills / Workout, player selection, progress, goal matching and backup.
- dist/training-v3.css: responsive UI.
- checks/v3.cjs: content integrity and application regression tests.

Prior scripts are retained for reference but are not loaded by the v3 entrypoint. Do not introduce another competing navigation stack.

## Run and release

Serve the dist/ directory on a static server. Run npm test with Node 22+. GitHub Actions runs the same checks. vercel.json serves dist after the passing test.

A passing test does NOT mean the app is deployed. Connect the GitHub repo to Vercel, use a branch preview, validate on an actual phone, then approve and merge. Vercel is not connected merely by adding configuration.

## Storage and privacy

Unified records use browser localStorage key galaxy-training-unified-v3. Existing data in galaxy-training-v1 remains untouched. Existing names copy into new profiles when v3 has not been initialized. Backup exports both versions; importing a v3 backup replaces unified progress on the current browser.

Profiles are not authentication. Records do not sync between phones, domains or accounts; clearing site data can erase them.

## Coaching scope

Lessons follow see/predict/try with illustrative storyboards and self-reported practice. The natural-language session selector matches keyword topics to existing drill decks; it is not generative AI. Technique workouts have eight movements and Build workouts have ten; weighted work needs adult supervision, and recovery takes priority.

See RELEASE_V3.md for verified scope and pending release checks.
