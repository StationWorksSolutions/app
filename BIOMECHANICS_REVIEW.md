# Galaxy Training — Biomechanics technical review (November 11, 2026)

**Stage:** Five preliminary movement animations on a separate review branch; **no integration into Galaxy Training**. Every movement is explicitly marked **not publishable**.

## Corrections implemented
- Bodyweight squat: both shoes anchored; knee positions solved with fixed-length thigh/shin segments.
- Supported split squat: both feet anchored; one wrist attaches to a visible rail with a two-segment elbow solver.
- Single-leg RDL: planted ankle anchored by existing solver.
- Lateral bound and stick: preliminary front-view landing, still requires side reference.
- Acceleration start: preliminary side-view pattern, not a certified sprint gait.

The separate `dist/biomechanics-review.html` uses the existing five-movement animated SVG baseline. Its test suite inspects geometry, joints, stationary foot and hand contacts, continuous sampled trajectories, reduced-motion handling, and the explicit release lockout. These software checks are **not biomechanical verification**. They cannot establish 3D valgus/rotation, torso loading, ground forces, individual suitability, or optimal joint motion.

## Evidence gate

| Exercise | Automated geometry/contact tests | Reference video matched | Coach/biomechanics review | Release |
| --- | --- | --- | --- | --- |
| Bodyweight squat | CI pending | Not captured | Not obtained | HOLD |
| Supported split squat | CI pending | Not captured | Not obtained | HOLD |
| Single-leg RDL | CI pending | Not captured | Not obtained | HOLD |
| Lateral bound and stick | CI pending | Not captured | Not obtained | HOLD |
| Acceleration start | CI pending | Not captured | Not obtained | HOLD |

## Next verification, required before product enablement
1. Capture a qualified adult demonstrator performing **each exact variation** from stable front and side viewpoints at >=60 fps where practical. Calibrate the ground plane and reference distances. No reference recordings were provided or captured in this work.
2. Analyze pose confidence, sagittal/frontal joint paths, planted shoe/hand contact, foot trajectories, knee tracking, spinal/pelvic control and phase timing. MediaPipe and Kinovea can help; optional multi-camera OpenCap is relevant if properly recorded and calibrated.
3. Compare animation landmarks to **actual captured reference** using normalized segment lengths, temporal alignment, angle/error envelopes selected per exercise and qualified reviewer. Do **not** call invented numeric cutoffs physiological safety limits.
4. Have a qualified youth strength-and-conditioning/biomechanics reviewer inspect the actual playback asset, record reviewer, qualification, exercise ID, version, frame issues, and written signoff. Exercises that cannot be depicted reliably in 2D must use verified video instead.
5. Run mobile Safari/Chrome layout, slow playback, accessibility, reduced-motion and media-failure tests. Get user gate approval before app integration; biomechanics signoff is an independent gate.

## Sources
- AAP youth resistance training: https://publications.aap.org/pediatrics/article/145/6/e20201011/76942/
- ACSM youth training program guidance: https://www.acsm.org/wp-content/uploads/2025/02/NYSHSI-Youth-Resistance-Training-PDF.pdf
- AOSSM youth strength safety guidance: https://www.sportsmed.org/youth-strength-training

These sources establish broad youth-supervision and progression principles, **not verification of the animation geometry**. Do not merge this draft into main, into the Galaxy core feature branch, or re-enable the existing workout lockout without independent review and owner approval.
