# GitLab Pages & Custom Domain Setup

This guide explains how to deploy DEFRAG Daily to `defrag.app` using GitLab Pages.

## 1. Pipeline Update
Your `.gitlab-ci.yml` has been updated with a `pages` stage. It runs automatically on `main` branch commits.
It publishes the contents of `dist/` to the `https://defragmentation1.gitlab.io/thefinalfrags` URL.

## 2. DNS Configuration (at Name.com)

Add these records to your domain `defrag.app`:

| Type  | Host | Answer/Value         | TTL | Note |
|-------|------|----------------------|-----|------|
| **A** | `@`  | `35.185.44.232`      | 300 | GitLab Pages IPv4 |
| **CNAME**| `www`| `defragmentation1.gitlab.io` | 300 | Subdomain redirect |
| **TXT**| `_gitlab-pages-verification-code` | *(From GitLab UI)* | 300 | Verification |
| **TXT**| `_gitlab-pages-verification-code.www` | *(From GitLab UI)* | 300 | Verification |

## 3. GitLab Configuration

1.  Go to: **Settings -> Pages** in your repository.
2.  Click **New Domain**.
3.  Enter `defrag.app`.
4.  Copy the verification code (TXT record) provided and add to Name.com.
5.  Click **Verify**.
6.  Ensure **Certificate** is enabled (Let's Encrypt).
7.  Repeat for `www.defrag.app`.

## 4. Verification

After DNS propagation (10-30m):
- `https://defrag.app` -> Should load your app (Antigravity backend status).
- `https://www.defrag.app` -> Should redirect to the same.
