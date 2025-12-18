# Defrag Daily - API Reference

Base URL: `/api`

## 1. System & Health

### Get System Health
`GET /system/status`
Returns a diagnostic report of the server's health, active agents, and environment configuration.
- **Auth**: None (Public for health checks)
- **Response**:
```json
{
  "timestamp": "ISOstring",
  "status": "HEALTHY",
  "services": {
    "database": "CONNECTED",
    "stripe": "READY",
    "replicate": "READY"
  }
}
```

## 2. Cosmic & Simulation

### Get Live Vectors (Cosmic)
`GET /cosmic/live-vectors`
Fetches live planetary vectors (from JPL Horizons) and calculating system entropy.
- **Response**:
```json
{
  "earth_vector": { "x": 1.2, "y": -0.5, "z": 0.1 },
  "entropy": 0.67,
  "status": "LIVE_FEED_ACTIVE"
}
```

### Run Vector Simulation
`POST /simulation/run`
Triggers a backend physics simulation for a family system.
- **Body**: `{ "nodes": 10, "iterations": 100 }`
- **Response**: `{ "success": true, "stats": { "stabilityScore": 0.85 } }`

## 3. Agents & Content

### Generate Mandala
`POST /mandala/:userId`
Triggers the `MandalaAgent` to generate a new visualization for a user.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "imageUrl": "https://replicate.com/...", "prompt": "..." }`

### Voice Synthesis
`POST /voice/synthesize`
- **Body**: `{ "text": "Hello", "voiceId": "Rachel" }`
- **Response**: Binary Audio Stream (`audio/mpeg`)

## 4. Users & Family

### Get User Profile
`GET /users/:userId`
Retrieves the full User State, including family members and subscription status.

### Update Family Member
`PUT /users/:userId/family/:memberId`
- **Body**: `LineageMember` object (see Data Models).

## 5. Payments

### Create Checkout Session
`POST /payment/create-checkout-session`
- **Body**: `{ "priceId": "price_..." }`
- **Response**: `{ "sessionId": "cs_test_..." }`
