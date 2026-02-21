# Skybox API 403 Error Fix

## Problem
The 3D visualization feature is returning 403 Forbidden errors from the Blockade Labs Skybox API.

## Root Cause
The HTTP request shows `x-api-key: your_api_key_here` in headers, which means:
1. **The .env.local file has a valid key**, but it's not being loaded by the app
2. **Solution**: Restart the Next.js dev server to reload environment variables

## Quick Fix

### Step 1: Stop the dev server
Press `Ctrl+C` in your terminal

### Step 2: Restart the dev server
```bash
cd frontend
npm run dev
```

### Step 3: Test again
Visit http://localhost:3001/3d and try "Generate Citadel"

## Why This Happens
Next.js only reads `.env.local` when the server starts. If you edited the file while the server was running, the changes won't be picked up until you restart.

## If Still Getting 403
The API key may be:
1. Invalid or expired - Get a new key from [Blockade Labs](https://www.blockadelabs.com/)
2. Hit rate limits - Wait a few minutes
3. Requires API billing enabled

## Current Status
✅ `.env.local` has key: `pOGZ4842...`  
⚠️ Dev server needs restart to load it

