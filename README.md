# Galaxy Training

Youth soccer learning and strength-session prototype. Buildless HTML/CSS/JavaScript in `dist/`.

## Run and test

Serve `dist/` with any local static web server. Run `npm test` with Node 22 or newer; no dependency install required. GitHub Actions runs the same regression checks for pushes and pull requests.

## Deployment

Import this repository into Vercel with the included configuration. The build runs regression tests and serves `dist/`. Vercel is not connected by adding this file; account setup is still required. Use preview deployments for review before merging to main. Do not enable production sharing until its audience and storage limitations are accepted.

## Data and access

Records stay in localStorage on the current browser and origin. Player selectors are profiles, not authentication. No database, cross-device sync, or parent account exists. Switching hosting origins does not transfer existing records; export a backup before moving. No user records or credentials belong in this repository.

## Release status

This is a tested local-storage prototype, not yet a family-account production release. See RELEASE_CHECKS.md for evidence and remaining gates.
