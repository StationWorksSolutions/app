# Galaxy Training — Core foundation & integration contract (v1)

Status: feature branch only. The v3 curriculum and physical-workout implementations remain independent and unchanged. The shared foundation is a browser/Node-compatible pure-JavaScript module at \`dist/core-foundation.js\` with regression tests in \`checks/core.cjs\`.

## Ownership and architecture

- **Canonical source:** \`StationWorksSolutions/app\`, \`main\`, serving \`dist/index.html\`. Do not promote \`dist/v4-prototype.html\` or unrelated Vercel experiments into a second live application.
- **Core app:** player IDs, scheduling, session states, progress events, persistence, recommendations, navigation and release controls.
- **Content owner:** supplies versioned lessons, assessments, optional match challenges and media assets. No navigation or persistence implementations.
- **Workout owner:** supplies versioned exercise/animation definitions and prescriptions; emits shared progress events. No navigation or persistence implementations.
- All cross-module references are immutable IDs. Display names and playback providers must never be storage keys.

## Data model

Storage key: \`galaxy-training-core-v1\`. Data includes \`schemaVersion:1\`, \`profiles[]\`, \`activePlayerId\`, \`objectives{}\`, \`schedule.weekly{}\`, \`schedule.dated{}\`, \`sessions{}\`, \`events[]\` and \`sequence\`.

\`profiles[]\`: \`{id, name, positions[]}\`. The preexisting two v3 player slots map deterministically to \`legacy-0\` and \`legacy-1\`, not to names; future profiles receive new stable IDs.

\`sessions[id]\`: \`{id, schemaVersion, playerId, module, contentId, contentVersion, status, cursor, createdAt, updatedAt, completedAt, reviewDue}\`. Modules are \`lesson\`, \`drill\`, \`workout\`, \`guided\`; the shell does not inspect content-specific fields. Preserve a session ID on pause/resume. A restart creates a new session, not a silent erasure of the old attempt.

\`events[]\`: \`{id,schemaVersion,playerId,type,sessionId,contentId,recordedAt,details}\`. Events are append-only; no total skill score is inferred from taps. \`competency_verified\` requires \`assessment.reviewerId\` and \`assessment.evidence\`; self-reported practice is participation only.

Allowed transitions:
- \`not_started → in_progress | skipped\`
- \`in_progress → paused | completed | skipped\`
- \`paused → in_progress | skipped\`
- \`completed → awaiting_match_application | ready_for_review\`
- \`awaiting_match_application → ready_for_review\`
- \`ready_for_review\` and \`skipped\` are terminal attempt states. A later review uses a fresh session ID.

Stored \`cursor\` is a nonnegative step index; session exit must pause and retain it, and interruption/reload can resume directly. Closing a session does not count completion.

## Contract shapes

Content workstream supplies a collection of **existing validated** lesson objects, each with:
\`{schemaVersion:1,id,title,positionTags:[],prerequisites:[],media:[{assetId,kind:'video'|'diagram'|'image'|'animation'}]}\`.
Additional assessment or match-challenge fields belong to the content module and are not interpreted by the app shell. The shell resolves media through an injected asset provider that can return an unavailable state without crashing navigation.

Physical workstream supplies \`Exercise\`:
\`{schemaVersion:1,id,title,animation:null|{assetId,kind:'animation'}}\` and \`Workout\`:
\`{schemaVersion:1,id,items:[{exerciseId,sets,reps}]}\`.
The module owns exercises and set/rep prescription logic. The shell owns player identity and lifecycle. Progress events for sets and recovery notes must reference \`playerId\`, \`sessionId\`, and \`contentId\` rather than storing raw exercise objects inside the shell.

Both modules call:
\`core.createSession({playerId,module,contentId,contentVersion})\`,
\`core.transition(sessionId,status,extra?)\`,
\`core.setCursor(sessionId,step)\`,
\`core.recordEvent({playerId,type,sessionId,contentId,details,assessment?})\`,
\`core.resumable(playerId,module?,contentId?)\`.
The \`Core.validateLesson/Exercise/Workout\` guards reject missing or malformed references at the adapter boundary. No curriculum or exercise assets are included in this contract package.

## Scheduling and recommendations

\`setSchedule(playerId,weekly,dated)\` accepts weekly \`{day:0..6,kind}\` and dated \`{date:'YYYY-MM-DD',kind}\`; kinds: practice, match, futsal, recovery. Do not infer match/futsal dates. The first-pass transparent recommendation priority is recovery → scheduled soccer → resumable session → already finished today → due review → first uncompleted validated lesson → unavailable content. A recovery or match day does not create a stacked strength assignment. A user can browse optional activities separately.

Today's primary action must be **one** recommendation; after completion present a summary, what was recorded, what is next and whether the day is finished. Never automatically launch the next session.

## Storage and sync migration

The v3 key \`galaxy-training-unified-v3\` and legacy \`galaxy-training-v1\` stay intact; no destructive automatic import. The core currently seeds stable player identities from v3 names and stores new sessions independently. **This is a transitional sidecar, not completed migration or cloud sync.** Before enabling cross-device sync, implement an explicit one-time migration mapping v3 lessons/drills/workouts/logs to event IDs with idempotent source IDs, test export/import and collision handling, then adopt one canonical writer. The simplest sync option after actual multi-device need is a small authenticated datastore with per-player access rules; no auth/provider is provisioned now. Never ship the sidecar as if it were already authoritative across devices.

## Release and QA gates

\`npm test\` runs the existing v3 regressions and the new core regressions. Review this feature branch in an isolated Vercel **preview**. Verify mobile Safari, focus navigation, a real player switch, interrupted session resume, offline/missing media, recovery scheduling and backup after integration. On merge: require passing CI, hands-on device testing, a named owner approval and a rollback SHA. Do not merge this branch or touch the current production application without approval.
