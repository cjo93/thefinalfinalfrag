# Security Hardening — Defrag (Production Launch)

## Goal
Harden the app for production: secrets in secret manager, JWT/RBAC gate for premium endpoints, Stripe webhook verification, secure headers, rate limits, and no high/critical vuln packages.

## Steps
1. Move secrets to your cloud Secret Manager (GCP/AWS) or GitLab CI variables (masked & protected). Rotate any sample/legacy keys. Do not store secrets in repo.
2. Update `src/config/env.validator.ts` to validate presence of secrets only via env or secret manager client. Use short-lived credentials or service accounts.
3. Add `src/middleware/security.ts` (helmet, CORS whitelist from env, express-rate-limit). Wire it into `src/index.ts`.
4. Replace `node-fetch` usage with native `fetch` (Node 18+). Remove `node-fetch` and update code to `await fetch(...)`.
5. Add `src/routes/payments/webhook_secure.ts` — verifies Stripe signature via `stripe.webhooks.constructEvent`.
6. Run `npm audit` / Snyk; upgrade high/critical packages. Add `npm audit` as CI gate.

## Acceptance Criteria
- No secrets in repo.
- Premium routes require Firebase/JWT and RBAC applied.
- Stripe webhook signature verification implemented and logged.
- CSP/helmet headers in place, rate limiting enabled.
- Zero high/critical vulnerabilities (audit/Snyk).

## Notes
- Use GCP Secret Manager example (below) or AWS Secrets Manager. Add an operational runbook for key rotation and incident response.

