#!/bin/bash

echo "Testing Simulation API..."

# Define the payload
PAYLOAD='{
  "populationSize": 1,
  "iterations": 5,
  "members": [
    {
      "id": "test-member-1",
      "role": "Father",
      "relationshipType": "conflict",
      "vector": { "x": 0.5, "y": 0.0, "z": 0.0 }
    },
    {
      "id": "test-member-2",
      "role": "Mother",
      "relationshipType": "close",
      "vector": { "x": -0.5, "y": 0.0, "z": 0.0 }
    }
  ]
}'

# Make the request
response=$(curl -s -X POST http://localhost:3002/api/simulation/run \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# Check if response contains success logic
if echo "$response" | grep -q "success.*true"; then
  echo "✅ API Request Successful"
  echo "$response" | grep "vector"
else
  echo "❌ API Request Failed"
  echo "Response: $response"
  exit 1
fi
