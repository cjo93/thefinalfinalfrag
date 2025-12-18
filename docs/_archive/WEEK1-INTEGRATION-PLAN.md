# DEFRAG Daily: Week 1 Integration Execution Plan

**Real-time tracking of your Phase 1 integration (Week 1)**

---

## 🚀 PHASE 1: INTEGRATION (This Week)

### TODAY'S EXACT NEXT STEPS (Next 2-4 hours)

**Goal: Get first real API connection working by EOD**

#### Step 1: Verify Mock Environment (10 min)
```bash
# Check current status
cat .env.example

# You should see template with placeholders:
# GOOGLE_API_KEY=your_key_here
# GEMINI_API_KEY=your_key_here
# STRIPE_SECRET_KEY=sk_test_...
# etc
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

# Expected output:
# Creating Cloud Firestore database...
# ✓ Database created successfully

# 5. Verify
gcloud firestore databases list
# Should show your database with location us-central1
```

**Time: ~20 min | Result: Real Firestore database ready**

#### Step 3: Create Firebase Project (15 min)
```bash
# 1. Go to https://console.firebase.google.com
# 2. Click "Create Project" → "defrag-daily"
# 3. Use existing Google Cloud project (select the one you just created)
# 4. Enable Google Analytics (optional)
# 5. Create project

# 6. Once created, get config
# In Firebase Console:
#   Project Settings → Your apps → Click Web app → Firebase SDK config
# Copy the entire config object

# 7. In your repo, create firebase.json (already exists, verify):
cat firebase.json
```

**Time: ~15 min | Result: Firebase Auth ready**

#### Step 4: Get Google API Keys (15 min)
```bash
# 1. Go to: https://console.cloud.google.com/apis/credentials
# 2. Select your project (defrag-daily)
# 3. Click "Create Credentials" → "API Key"
# 4. Copy the key (starts with AIza...)
# 5. Store temporarily (you'll add to .env next)

# 6. Restrict the key:
#    - Application restrictions: HTTP referrers (if frontend only)
#    - API restrictions:
#      ✓ Google Generative AI API
#      ✓ Cloud Firestore API
#      ✓ BigQuery API
```

**Time: ~15 min | Result: API keys ready**

#### Step 5: Get Stripe Test Keys (5 min)
```bash
# 1. Go to: https://dashboard.stripe.com/apikeys
# 2. You should see Test and Live keys
# 3. Copy:
#    - sk_test_... (Secret Key - for backend)
#    - pk_test_... (Publishable Key - for frontend)
# 4. Store temporarily
```

**Time: ~5 min | Result: Stripe keys ready**

#### Step 6: Create Real .env File (5 min)
```bash
# 1. Copy template
cp .env.example .env

# 2. Edit with your real keys
nano .env

# 3. Fill in these values (from steps above):
GOOGLE_API_KEY=AIza...           # From Step 4
GEMINI_API_KEY=AIza...           # Same as GOOGLE_API_KEY
GOOGLE_PROJECT_ID=defrag-daily
STRIPE_SECRET_KEY=sk_test_...    # From Step 5
STRIPE_PUBLISHABLE_KEY=pk_test_...
REPLICATE_API_TOKEN=r8_...       # You can get later

# 4. Save and verify no errors
source .env
echo $GOOGLE_PROJECT_ID          # Should print: defrag-daily
```

**Time: ~5 min | Result: .env configured**

#### Step 7: Connect to Real Firestore (30 min)

**Update src/services/firestore.ts:**

```bash
# First, create a service account key
# 1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
# 2. Select defrag-daily project
# 3. Click "Create Service Account"
#    Name: "defrag-admin"
#    Description: "Admin access for DEFRAG Daily"
# 4. Click "Create and Continue"
# 5. Grant role: "Editor" (or "Cloud Firestore User")
# 6. Click "Continue"
# 7. Go to "Keys" tab → "Add Key" → "Create new key" → JSON
# 8. Download and save as serviceAccountKey.json in project root

# 2. Update src/services/firestore.ts:
cat > src/services/firestore.ts << 'EOF'
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as serviceAccount from '../serviceAccountKey.json';

const app = initializeApp({
  credential: cert(serviceAccount as any),
  projectId: process.env.GOOGLE_PROJECT_ID,
});

export const db = getFirestore(app);

export async function testConnection() {
  try {
    const snapshot = await db.collection('_test').limit(1).get();
    console.log('✓ Firestore connection successful');
    return true;
  } catch (error) {
    console.error('✗ Firestore connection failed:', error);
    return false;
  }
}
EOF

# 3. Add to .gitignore
echo "serviceAccountKey.json" >> .gitignore

# 4. Rebuild
npm run build

# Expected output:
# ✓ Successfully compiled X files
```

**Time: ~30 min | Result: Real Firestore connection ready**

#### Step 8: Test Connection (10 min)
```bash
# 1. Create test file
cat > test-firestore.ts << 'EOF'
import { db, testConnection } from './src/services/firestore';

async function main() {
  console.log('Testing Firestore connection...');
  const connected = await testConnection();

  if (connected) {
    console.log('✓ Connection successful!');
    console.log('✓ You can now use Firestore in your agents');
    process.exit(0);
  } else {
    console.log('✗ Connection failed');
    process.exit(1);
  }
}

main();
EOF

# 2. Run test
npx ts-node test-firestore.ts

# Expected output:
# Testing Firestore connection...
# ✓ Firestore connection successful
# ✓ Connection successful!
```

**Time: ~10 min | Result: Verified real connection**

---

## 📅 THIS WEEK'S DETAILED SCHEDULE

### MONDAY (TODAY) - Setup & Verification
```
15:00 - 15:20  ✅ Step 1: Verify mock environment
15:20 - 15:40  ⏳ Step 2: Create Google Cloud project
15:40 - 15:55  ⏳ Step 3: Create Firebase project
15:55 - 16:10  ⏳ Step 4: Get Google API keys
16:10 - 16:15  ⏳ Step 5: Get Stripe test keys
16:15 - 16:20  ⏳ Step 6: Create real .env file
16:20 - 16:50  ⏳ Step 7: Connect to real Firestore
16:50 - 17:00  ⏳ Step 8: Test connection
17:00 - EOD    ⏳ Celebrate! ✅
```

### TUESDAY - AuthAgent Implementation
```
09:00 - 10:00  Implement AuthAgent with real Firebase Auth
10:00 - 11:00  Test user creation in real Firestore
11:00 - 12:00  Test user profile retrieval
12:00 - 13:00  Lunch
13:00 - 14:00  Implement email sending (nodemailer setup)
14:00 - 15:00  Test complete signup flow
15:00 - 16:00  Code review & bug fixes
```

### WEDNESDAY - HRVAgent Implementation
```
09:00 - 10:00  Implement HRVAgent with real Firestore
10:00 - 11:00  Test HRV ingestion
11:00 - 12:00  Test HRV classification
12:00 - 13:00  Lunch
13:00 - 14:00  Verify data in Firestore
14:00 - 15:00  Create test HRV data
15:00 - 16:00  Code review
```

### THURSDAY - BriefingAgent Implementation
```
09:00 - 10:00  Set up Gemini API client
10:00 - 11:00  Implement BriefingAgent
11:00 - 12:00  Test briefing generation
12:00 - 13:00  Lunch
13:00 - 14:00  Test caching logic
14:00 - 15:00  Verify cost tracking
15:00 - 16:00  Code review
```

### FRIDAY - Testing & Preparation
```
09:00 - 10:00  Run full test suite
10:00 - 11:00  Integration tests
11:00 - 12:00  Performance testing
12:00 - 13:00  Lunch
13:00 - 14:00  Code cleanup
14:00 - 15:00  Documentation update
15:00 - 16:00  Plan Week 2
16:00 - EOD    Retrospective & celebration
```
