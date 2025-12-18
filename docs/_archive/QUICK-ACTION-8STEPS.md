# ⚡ QUICK ACTION: 8 STEPS

**Goal: Get first real API connection working by EOD**

#### Step 1: Verify Mock Environment (10 min)
```bash
# Check current status
cat .env.example
```

#### Step 2: Create Real Google Cloud Project (20 min)
```bash
# 1. Create project
gcloud projects create defrag-daily --name="DEFRAG Daily"

# 2. Set as default
gcloud config set project defrag-daily

# 3. Enable required APIs
gcloud services enable firestore.googleapis.com
gcloud services enable generativeai.googleapis.com
gcloud services enable bigquery.googleapis.com
gcloud services enable storage-api.googleapis.com

# 4. Create Firestore database
gcloud firestore databases create --location us-central1
```

#### Step 3: Create Firebase Project (15 min)
```bash
# 1. Go to https://console.firebase.google.com
# 2. Click "Create Project" → "defrag-daily"
# 3. Use existing Google Cloud project
# 4. Enable Google Analytics (optional)
# 5. Create project
```

#### Step 4: Get Google API Keys (15 min)
```bash
# 1. Go to: https://console.cloud.google.com/apis/credentials
# 2. Select your project (defrag-daily)
# 3. Click "Create Credentials" → "API Key"
# 4. Copy the key (starts with AIza...)
```

#### Step 5: Get Stripe Test Keys (5 min)
```bash
# 1. Go to: https://dashboard.stripe.com/apikeys
# 2. Copy Sk_test_... and pk_test_...
```

#### Step 6: Create Real .env File (5 min)
```bash
# 1. Copy template
cp .env.example .env

# 2. Edit with your real keys
nano .env

# 3. Fill in these values:
# GOOGLE_API_KEY=AIza...
# STRIPE_SECRET_KEY=sk_test_...
```

#### Step 7: Connect to Real Firestore (30 min)
```bash
# 1. Go to IAM & Admin → Service Accounts
# 2. Create "defrag-admin" key (JSON)
# 3. Save as serviceAccountKey.json
# 4. Update src/services/firestore.ts code (see Integration Guide)
```

#### Step 8: Test Connection (10 min)
```bash
# Run test script
npx ts-node test-firestore.ts
```
