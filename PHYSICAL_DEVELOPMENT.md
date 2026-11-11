# Galaxy Physical Development — canonical Phase A design and Phase B review

**Date:** 2026-11-11  
**Repository:** `StationWorksSolutions/app`  
**Status:** Architecture approved for prototyping, five animated movements **not biomechanically validated**. No production integration, workout engine, or 130-item exercise catalog has been deployed.

## Scope and architecture

The product retains **Today → Learn → Train → Progress**, with workouts under **Train → Workout**. The current checked-in production entry point is `dist/index.html`, which loads `training-v3.js` and `content-v3.js`. The separate `dist/v4-prototype.html` expresses a newer journey but is not the integrated production shell. Do not add a second persistent navigation.

Current progress uses `localStorage["galaxy-training-unified-v3"]`, with `schema:3`, `names`, `active`, `lessons`, `drills`, `workouts`, `logs` and `settings`; keys use browser-local player indexes. Keep legacy records untouched. Introduce an optional additive `physical` subtree with `schema:1`, independent player records, immutable workout snapshots and an event log; do **not** overwrite `workouts` or change `schema:3` before backup/import migration tests. Profiles do not sync across devices. Never interpret indexes as authenticated users.

The five-movement **Phase B preview** is `dist/physical-poc.html` on an isolated branch. It intentionally does not read or write local storage or depend on another framework. It uses one reusable articulated SVG skeleton, fixed segment lengths, time-keyed joint-angle pose definitions and interpolated animation. This is an animation **concept**, not a verified instruction or an exercise certification.

### Technology decision

| Choice | Result |
| --- | --- |
| SVG + vanilla JavaScript | Chosen: inspectable 2D joint coordinate and segment model, responsive vector rendering, no runtime subscription, small deployment |
| Canvas | Not justified for five concurrent or fewer lightweight characters; accessibility and debugging worse |
| Rive | Can be reconsidered if character rigging complexity exceeds SVG; not required for MVP |
| Verified exercise video | Required fallback when coach review rejects animation or movement cannot be demonstrated accurately in 2D |

For production, extract `poseAt`, `skeleton`, `SEG`, pose catalog, and SVG renderer from the preview into versioned, tested modules. Keep motion assets independent from exercise prescriptions. Stop playback when offscreen, pause when document hidden, and respect reduced-motion preference. Add explicit replay, speed controls, front/side variants only where validated, and descriptive nonanimated alternatives.

## Canonical data contracts (proposed, not yet integrated)

```json
{
  "id": "EX-SQUAT-BW-001",
  "version": 1,
  "name": "Bodyweight squat",
  "domain": "lower_body_strength",
  "movementPattern": "squat",
  "targetMuscles": ["quadriceps", "gluteals", "trunk"],
  "equipment": ["bodyweight"],
  "difficulty": "foundation",
  "suitability": {
    "developmentStages": ["U11", "U13", "U14"],
    "prerequisites": ["stable stance", "pain-free squat", "follow coaching cue"],
    "supervision": "initial-coach-check",
    "contraindicationNote": "Stop for pain, dizziness or loss of control."
  },
  "prescription": {
    "reps": 8,
    "sets": 1,
    "restSeconds": 60,
    "durationSeconds": null,
    "intensity": "technique"
  },
  "coachingCues": ["Whole foot grounded", "Knees in line with feet"],
  "commonErrors": ["Knees collapse inward", "Heels lift"],
  "easierVariationId": "EX-CHAIR-SQUAT-001",
  "harderVariationId": "EX-TEMPO-SQUAT-001",
  "animation": {
    "assetId": "MOTION-BODYWEIGHT-SQUAT",
    "assetVersion": 1,
    "supportedViews": ["side"],
    "phaseKeys": ["start", "initiate", "primary", "finish", "return"],
    "loopAllowed": true,
    "fallbackVideoId": null
  },
  "sources": [
    {
      "organization": "American Academy of Pediatrics",
      "title": "Resistance Training for Children and Adolescents",
      "url": "https://publications.aap.org/pediatrics/article/145/6/e20201010/76942/"
    }
  ],
  "validation": {
    "referenceVerified": true,
    "mechanics": "review-required",
    "youthCoach": "review-required",
    "animation": "review-required",
    "mobileQA": "review-required",
    "publishable": false
  }
}
```

The AAP report supports youth resistance training under qualified instruction with technique emphasis; it **does not validate the particular squat animation**. Each movement needs its own reference, observable coaching checklist and reviewer signoff, not just a generic guideline link.

**Separate models:**
- `exercise`: canonical, versioned, editable content.
- `motionAsset`: versioned joint angles, segment lengths, viewpoint, timing and review evidence.
- `workoutTemplate`: ordered exercise IDs, volume limits, substitutions, goals and intensity class.
- `playerPrescription`: per-player competency stage, available equipment, practice/match/futsal calendar, recent load and readiness.
- `sessionSnapshot`: IDs, content versions and exact sets/reps at start; never silently mutate a started session.
- `setEvent`: stable UUID, player ID, session ID, exercise ID, set index, side, timestamp, reps, optional load, technique self-check.
- `completion`: counts, timestamp, RPE/effort 1–5, recovery prompt and next action. Completion **never** marks mastery.
- `coachCompetencyReview`: observed quality, reviewer, date, and decision to hold/progress/regress.

### Recommended extension example

```json
{
  "schema": 3,
  "physical": {
    "schema": 1,
    "profileState": {
      "0": {"competencies": {}, "trainingHistory": [], "availability": {}},
      "1": {"competencies": {}, "trainingHistory": [], "availability": {}}
    },
    "sessions": {},
    "events": {},
    "catalogVersion": 1
  }
}
```

During integration, preserve v3 backups/imports and existing workout history. Migrate only after tests for first launch, resume, export, restore, and profile switching. Avoid duplicating completion records on double taps; use idempotent set-event keys.

## Phase B five demonstrations

| ID | Exercise | View | Key positions and cue | Gate |
| --- | --- | --- | --- | --- |
| EX-SQUAT-BW-001 | Bodyweight squat | Side | Whole-foot stance → hips back → knee/hip bend → hold → rise. Front knee alignment not observable from side alone. | Coach verifies heel contact, shin/torso relationship, spine and knee tracking with additional front video. |
| EX-SPLIT-SUP-001 | Supported split squat | Side | Stagger stance → lower hips → controlled front knee flex → hold → rise. Add hand support in instructional video; SVG does not depict a support. | Coach verifies stable front foot and actual supported setup before this animation can instruct. |
| EX-SLRDL-001 | Unloaded single-leg RDL | Side | Single-leg stance → hip hinge with trailing leg → long spine → controlled return. | Coach verifies level pelvis and balance; **front video mandatory** before teaching alone. |
| EX-LBOUND-001 | Lateral bound and stick | Front | Low lateral takeoff → flight → one-leg soft landing → stabilize → controlled opposite travel. | Coach verifies sagittal landing knee/hip flexion with side video. Reduce to side-step-and-stick if not competent. |
| EX-ACCEL-001 | Acceleration start | Side | Lean → push → knee drive → first strides → reset. Reset is stylized, not a running gait simulation. | Coach verifies foot-strike, ankle stiffness, shin angle and safe acceleration surface. Video required until verified. |

Every movement currently has `coach-review-required` status. The loop is illustrative. No claim of correct force distribution or real gait kinetics is made from 2D angle animation.

## Workout programming policy

Youth resistance training should favor technique, adequate warm-up/cool-down, skilled supervision and recovery. Do not prescribe one-rep maxima, arbitrary percentage-of-1RM targets, exhaustive repetitions, or routine heavy sessions. AAP guidance describes well-supervised resistance training and nonconsecutive strength-training days; FIFA 11+ Kids literature supports appropriate injury-prevention warm-up practices without implying this specific workout has measured injury-prevention effects.

**Daily recommendation precedence:**
1. Pain/illness/injury or major fatigue → no strength/power session; recovery or advice to contact a parent/coach.
2. Match day or preceding 24h before an important match → easy mobility/optional primer or rest; never heavy legs.
3. Hard soccer practice, futsal session, or recent intense loading → reduce/swap; never automatically stack demanding work.
4. Fresh off-day + technique competency → one mixed session with only a few challenging sets.
5. Next 24–48h training load and readiness influence intensity. Strength days are nonconsecutive; U11/U13 volume is competency-based rather than age-only.

Known context: Jay plays U13, James U11; soccer practice is generally Monday/Wednesday, while futsal and matches vary. Calendar input remains manual until an authorized, reliable schedule integration is implemented. **No inferred match or futsal date should be treated as confirmed.**

Workout categories: `strength`, `speed_agility`, `coordination`, `recovery_mobility`, `mixed`. A workout includes 8–12 **movement stations**, not 8–12 high-intensity lifts. Prescriptions always include rest and substitutions.

### Complete proposed 10-movement session: "Balanced movement + first step"

**Use:** fresh, non-match day, with a cleared space and initial adult oversight; roughly 20–30 minutes depending on rest. Default is light/bodyweight. Exercises requiring unapproved animation use verified video or parent/coach instruction, never a placeholder animation.

| # | Station | Jay U13 | James U11 / entry variation | Rest | Asset |
| --- | --- | --- | --- | --- | --- |
| 1 | March + arm swing warm-up | 45 sec | 30 sec | 15 sec | Video pending |
| 2 | Wall march | 1 × 6/side | 1 × 5/side | 30 sec | Video pending |
| 3 | Acceleration start | 3 × 3 steps, technically clean | Wall march continuation pending competency | 60–90 sec | POC visual, not instructional |
| 4 | Lateral bound + stick | 2 × 3/side, low amplitude | Side step + stick, 1 × 4/side | 60 sec | POC visual, not instructional |
| 5 | Bodyweight squat | 1–2 × 8 | 1 × 6–8 | 60 sec | POC visual |
| 6 | Supported split squat | 1–2 × 6/side | 1 × 5/side | 60 sec | POC visual, support missing |
| 7 | Unloaded single-leg RDL | 1 × 5/side, coach-cleared | Supported hip hinge, 1 × 6 | 60 sec | POC visual |
| 8 | Incline push-up on stable surface | 1–2 × 6–8 | 1 × 5–6 | 60 sec | Video pending |
| 9 | Dead bug | 1 × 6/side | 1 × 5/side | 30 sec | Video pending |
| 10 | Calf raise + slow breathing cool-down | 1 × 10 | 1 × 8 | — | Video pending |

The workout is **programmed**, not yet runnable through session-tracking UI. The five live POC animations cover stations 3–7, subject to coach review; the other five must not receive generic substitute animations. Each profile needs an independent conservative progression gate.

## Exercise catalog expansion target

The user-proposed distribution totals **130**: lower strength 20, upper strength 15, core 20, acceleration 15, COD 15, balance 15, mobility 15, and landing 15. These are **quotas for draft planning**, not a mandate to manufacture distinct exercise names. One canonical exercise has one ID and can appear under multiple tags. Build in batches of 10–15 following real video/reference checks and a youth coach gate. No unvalidated item goes to production recommendations.

## Integration contracts and UX

- `Today`: one recommendation based on the last completed session plus schedule/fatigue; plain-language alternative ("Recover" / "Train").
- `Train → Workout`: one workout + **Start Workout**. This becomes a single full-screen stack with a large animation, compact `sets × reps`, one coaching cue, `Start`, `Complete Set`, `Next Exercise`, and `Pause/Exit`.
- Save an immutable workout snapshot and every set completion as it occurs. On browser reload, restore current exercise/set and never count unperformed sets.
- At final set: short completion summary, optional 1–5 effort check, save, and explicit return to Today or Progress.
- `Progress`: history/compliance, familiarity and coach-reviewed competency separately. Show neither predicted performance gain nor mastery based only on checkmarks.
- `Learn`: tactical lessons remain independent; a mapping table may recommend physical movements when meaningful, not force them into every lesson.

## Validation gates and execution order

| Phase | Gate | Release condition |
| --- | --- | --- |
| A — Architecture | Repo, data model and migration reviewed | **Documented**. No production changes. |
| B — Five motion assets | Each articulated segment length remains constant; view and phase behavior; iPhone Safari and Android Chrome; keyboard/reduced-motion; actual biomechanics reviewed by qualified coach | **Code POC only**. Coach approval and device QA pending. |
| C — 10-station player flow | Set/event idempotency, side-specific sets, pause/resume, reload, final completion, both profiles, no-storage case | Not implemented. |
| D — Catalog batches | Sources, duplication check, substitutions, movement-specific coach review and videos | Not implemented. |
| E — Engine | Scheduling with soccer, futsal, match, fatigue and no unsafe increase in volume | Not implemented. |
| F — Integration | Full-screen Train, Today, Progress, legacy import/export preservation, accessibility and regression checks | Not implemented; requires merge/release review. |

No production merge or production deployment is authorized in this plan.

### Source references
- American Academy of Pediatrics. *Resistance Training for Children and Adolescents* (2020, reaffirmed November 2024): https://publications.aap.org/pediatrics/article/145/6/e20201010/76942/
- NSCA. *Youth Resistance Training* position statement: https://www.nsca.com/globalassets/about/position-statements/position_stand_youth_resistance_training---2009.pdf
- FIFA 11+ Kids systematic review: https://pubmed.ncbi.nlm.nih.gov/39026353/

## Cross-workstream architecture reconciliation — 2026-11-11

The independent core application workstream now includes branch `feature/galaxy-core-foundation-20261111` and its `dist/core-foundation.js` API, described in `CORE_ARCHITECTURE.md`.

**This section supersedes the earlier proposed `physical` subtree under v3 as the durable shared writer.** That subtree remains a possible private migration staging area but must **not** become a competing session or progress store. The physical module should expose pure versioned content, prescribed workout snapshots and movement review metadata, and integrate through the **shared core-owned** state when that branch is approved.

- Preserve source-of-truth `galaxy-training-unified-v3` and `galaxy-training-v1` storage without destructive migration. The core workstream currently creates transitional sidecar `galaxy-training-core-v1`; it is **not yet a deployed unified progress implementation**.
- In an integration adapter, use `core.playerIdForLegacyIndex(0)` for Jay and `(1)` for James, rather than child names or browser-index keys. New profiles use stable IDs from core.
- Convert presentation-focused physical exercise records into core's narrow `{schemaVersion:1,id,title,animation:{assetId,kind:'animation'}|null}` contract without losing the richer canonical catalog fields. Convert a prescribed workout into `{schemaVersion:1,id,items:[{exerciseId,sets,reps}]}` for `Core.validateWorkout`. The exercise library and dose rules remain owned by this workstream.
- Use `core.createSession({playerId,module:'workout',contentId,contentVersion})`, `core.transition`, `core.setCursor`, `core.recordEvent`, and `core.resumable` for shared session lifecycle. Set events should include immutable `sessionId`, `exerciseId`, `side`, `setIndex`, `completedAt`, and an idempotency identifier, without logging completion twice.
- Keep private immutable workout snapshots and prescribed sets at a module-defined versioned store **linked by core session IDs**. Coordinate backup/export of both stores and error propagation before enabling progress in the shared shell; no silent progress loss on failed writes.
- The core's `competency_verified` event requires an independent reviewer and evidence. Exercise completion and self-reported familiarity must not emit that event.
- Schedule queries from the core calendar must drive recovery recommendations; do not hardcode match/futsal participation or schedule dates.
- Merge sequence: **review POC → approve core foundation → reconcile adapters → migration/restore tests → unified player shell preview → production approval**. This motion branch must not copy or modify `dist/core-foundation.js` or the core shell in isolation.

### Movement-specific Phase B acceptance checks

The current preview enforces constant 2D segment lengths and **planted ankle anchors** for the squat, supported split squat and single-leg RDL. Ankle anchoring is a **geometric visual constraint only**; it does not demonstrate heel pressure, balance forces, sagittal/frontal-plane alignment, or correct coaching mechanics.

| Movement | Automated geometry | Qualified reviewer visual gate | Instructional fallback |
| --- | --- | --- | --- |
| Bodyweight squat | Both segment lengths; one foot anchor in side view | Check both heels, frontal knee tracking, trunk/spine relationship, ascent tempo | Verified squat video until front and side review |
| Supported split squat | Two-foot ankle anchoring via fixed-length inverse kinematics | Check stable support grip, stance width, knee path, rear knee clearance and pelvic control | Verified supported-split-squat video |
| Single-leg RDL | Planted stance ankle; two-bone segment lengths | Check pelvic rotation, spine line, front and side balance, trailing leg | Verified supported-hinge video |
| Lateral bound | Consistent limb lengths and flight/landing phases | Check no knee valgus, hip/knee bend, actual one-leg stabilization, safe surface | Low side-step-and-stick or verified landing video |
| Acceleration start | Segment lengths and end-hold (no false seamless gait loop) | Check forward lean from ankles, first foot placement, torso timing, actual force vectors not inferable in 2D | Verified youth acceleration demonstration |

No exercise is accepted merely because the SVG renders, automated test geometry passes, or a guideline is cited. Coach evidence should be stored with a reviewer name, date, reference video, verdict and revision number. The release remains blocked until the first five movements meet these criteria.
