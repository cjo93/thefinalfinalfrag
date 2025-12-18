# GitLab CI/CD Integration Guide

This guide explains how to integrate DEFRAG Daily with GitLab CI/CD.

## 🚀 Overview

The pipeline (`.gitlab-ci.yml`) is configured with the following stages:

1.  **lint**: Runs `npm run lint`.
2.  **build**: Runs `npm run build` and artifacts `dist/`.
3.  **test**: Runs `npm test` and reports code coverage.
4.  **integrate**: Connects to Firestore using CI variables and runs `scripts/test-firestore.ts`.

## 🔑 Secret Management (CI/CD Variables)

To enable the integration stage, you must set the following **masked and protected** variables in GitLab (Settings -> CI/CD -> Variables):

- `GOOGLE_PROJECT_ID`: Your Google Cloud Project ID (e.g., `defrag-daily`).
- `GOOGLE_APPLICATION_CREDENTIALS_JSON`: Base64 encoded Service Account JSON.
- `FIREBASE_PROJECT_ID`: Same as Google Project ID.
- `STRIPE_SECRET_KEY`: Your Stripe Secret Key.
- `GEMINI_API_KEY`: Your Gemini API Key.
- `REPLICATE_API_TOKEN`: Your Replicate API Token.

### How to generate `GOOGLE_APPLICATION_CREDENTIALS_JSON`:

1.  Download your `serviceAccountKey.json`.
2.  Run: `cat serviceAccountKey.json | base64` (on macOS/Linux).
3.  Paste the output string into the GitLab variable value.

## 🛑 Validation

When triggered, the `firestore_integrate` job will:
1.  Decode the service account key.
2.  Attempt to read from the `_health` collection in Firestore.
3.  Success output: `✓ Firestore connection successful`.

## 📦 Merge Request Template

Use the following description for your Merge Request:

```markdown
## What
- Add a GitLab-native CI/CD pipeline for the Antigravity / DEFRAG backend.
- Run lint, build, and test on every branch.
- Add a Firestore integration job that only runs when Google creds are present.

## Secrets
Set these in **Settings → CI/CD → Variables**:
- `GOOGLE_PROJECT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` (base64)
- `GEMINI_API_KEY`
```
