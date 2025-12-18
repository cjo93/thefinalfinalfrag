# Deployment Manual

> **Objective**: Deploy Defrag (Gold Master) to Production.

## 1. Architecture
- **Frontend**: Static Site Hosting (GitLab Pages / Vercel / Netlify).
- **Backend**: Node.js Container (Render / Railway / Google Cloud Run).

## 2. Frontend Deployment (GitLab Pages)
This project is pre-configured for GitLab Pages via `.gitlab-ci.yml`.

1.  **Push to Main**:
    ```bash
    git push origin main
    ```
2.  **Pipeline**:
    - GitLab CI will run `npm run build`.
    - Artifacts in `dist/` are moved to `public/`.
    - Pages deploys the site to `https://<your-user>.gitlab.io/<repo>/`.

3.  **Custom Domain (Optional)**:
    - Go to Settings > Pages.
    - Add New Domain (`defrag.app`).
    - Verify via DNS TXT record.

## 3. Backend Deployment (Generic Node.js)
You need a host that supports long-running Node.js processes (not Serverless Functions, due to the WebSocket/Agent nature).

1.  **Build**:
    The backend is TypeScript. You must compile it.
    ```bash
    npx tsc
    ```
2.  **Start Command**:
    ```bash
    node dist/src/index.js
    ```
3.  **Environment Variables**:
    Set these in your cloud provider's dashboard:
    - `PORT`: `3002` (or whatever the host assigns)
    - `FRONTEND_URL`: `https://your-frontend.com`
    - `STRIPE_SECRET_KEY`: `sk_live_...`
    - `GOOGLE_APPLICATION_CREDENTIALS`: Content of JSON file (Some hosts allow pasting JSON config directly).

## 4. Post-Deployment Verification
1.  **Frontend**: Open site. Check console for 404s.
2.  **Connectivity**: Try to login. If it fails, check **CORS** settings in `src/index.ts` to ensure your production domain is allowed.
3.  **Agents**: Hit `/api/system/status` to ensure Agents initialized correctly.
