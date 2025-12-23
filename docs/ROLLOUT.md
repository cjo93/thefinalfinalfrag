# Rollout Plan & Rollback Toggles

## Strategy
- Internal -> Closed test -> Phased production (PWA / TestFlight / Play).  
- Backend: blue/green or canary using feature flags or traffic split.

## Toggles
- Add `config/feature-flags.json` and use a feature flag lib (Unleash/FF4J/LaunchDarkly) in prod.

## Rollback
- A documented rollback playbook: revert traffic, toggle features off, and rollback to previous infra tag.

## Acceptance
- Plan documented; toggles tested; rollback path verified.

