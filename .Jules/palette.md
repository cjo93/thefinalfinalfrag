# Palette's Journal

## 2025-05-18 - Accessibility of Interactive Cards
**Learning:** Interactive elements like pricing cards often get implemented as clickable `div`s, which excludes keyboard and screen reader users. Simply adding `onClick` isn't enough.
**Action:** Always ensure interactive elements have `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers for Enter/Space keys, plus proper `aria-label`s.
