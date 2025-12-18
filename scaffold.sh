#!/bin/bash
set -e

# Create directories
mkdir -p backend/app/api/endpoints backend/app/core backend/tests
mkdir -p frontend/src

# ============================================
# BACKEND FILES
# ============================================

# Create __init__.py files
touch backend/__init__.py
touch backend/app/__init__.py
touch backend/app/api/__init__.py
touch backend/app/api/endpoints/__init__.py
touch backend/app/core/__init__.py
touch backend/tests/__init__.py

# Create main.py
cat > backend/app/main.py << 'MAINPY'
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="DEFRAG API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://defrag.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/")
async def root():
    return {"name": "DEFRAG API", "version": "1.0.0"}
MAINPY

# Create requirements.txt
cat > backend/requirements.txt << 'REQS'
fastapi==0.104.1
uvicorn[standard]==0.24.0
google-generativeai==0.3.0
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
REQS

# ============================================
# FRONTEND FILES
# ============================================

# Create package.json
cat > frontend/package.json << 'PKGJSON'
{
  "name": "defrag-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
PKGJSON

# Create vite.config.js
cat > frontend/vite.config.js << 'VITECONF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 }
})
VITECONF

# Create index.html
cat > frontend/index.html << 'INDEXHTML'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DEFRAG</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
INDEXHTML

# Create main.jsx
cat > frontend/src/main.jsx << 'MAINJSX'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
MAINJSX

# Create App.jsx
cat > frontend/src/App.jsx << 'APPJSX'
import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">DEFRAG</h1>
        <p className="text-xl text-gray-400">Defense Against Gaslighting</p>
        <p className="mt-8 text-sm text-gray-500">Coming Soon</p>
      </div>
    </div>
  )
}

export default App
APPJSX

# Create index.css
cat > frontend/src/index.css << 'INDEXCSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}
INDEXCSS

# Create tailwind.config.js
cat > frontend/tailwind.config.js << 'TAILWIND'
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: []
}
TAILWIND

# Create postcss.config.js
cat > frontend/postcss.config.js << 'POSTCSS'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
POSTCSS

# ============================================
# CI/CD & CONFIG
# ============================================

# Create .gitlab-ci.yml
cat > .gitlab-ci.yml << 'GITLABCI'
stages:
  - build
  - deploy

build_frontend:
  stage: build
  image: node:18
  script:
    - cd frontend
    - npm install
    - npm run build
  artifacts:
    paths:
      - frontend/dist

pages:
  stage: deploy
  image: alpine:latest
  script:
    - mkdir -p public
    - cp -r frontend/dist/* public/
  artifacts:
    paths:
      - public
  only:
    - main
GITLABCI

# Create .gitignore
cat > .gitignore << 'GITIGNORE'
__pycache__/
*.pyc
venv/
.venv/
node_modules/
dist/
build/
.env
.env.local
.DS_Store
*.log
GITIGNORE

# Create README.md
cat > README.md << 'README'
# DEFRAG

Defense Against Gaslighting - Narrative Analysis Platform

## Setup

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment

- Frontend: GitLab Pages (defrag.app)
- Backend: Render (api.defrag.app)
README

# ============================================
# GIT COMMIT
# ============================================

git add .
git commit -m "feat: complete DEFRAG application scaffold" || echo "Nothing to commit"
# git push origin main  <-- Commented out to let me run it explicitly if needed, but the user asked for it.
# actually user said "PASTE THIS... AND PRESS ENTER" implies full execution.
git push origin main

echo ""
echo "✅ ALL FILES CREATED!"
echo "✅ CODE COMMITTED AND PUSHED!"
