# 🗄️ PostgreSQL Setup Guide for Kite AI Bounty

## ⚠️ Do You Need PostgreSQL?

**Short answer: NO (for demo/development)!**

Your backend runs in **"degraded mode"** using in-memory storage when `DATABASE_URL` is not configured. This is PERFECT for:
- ✅ Quick demos (like the Kite AI bounty submission)
- ✅ Local development
- ✅ Testing new features
- ✅ Video recordings for hackathons

**However**, PostgreSQL is required for:
- Production deployments with persistent data
- Multiple backend instances (horizontal scaling)
- Long-term settlement history
- Complex queries and analytics

---

## 🎯 Why PostgreSQL?

Your Prisma schema defines these tables:

### Core Tables:
- **Agent** - AI agent identities with wallet addresses
- **Tool** - Registry of available tools (weather API, price oracle, etc.)
- **Execution** - Records of tool calls with x402 payments
- **Settlement** - Batched on-chain settlements (grouped debits to Escrow contract)
- **EscrowBalance** - Agent balances on Base, Kite, Hedera

### Benefits:
1. **Persistent Storage** - Data survives server restarts
2. **Settlement Tracking** - Complete x402 payment history for judges to verify
3. **Analytics** - Query execution patterns, agent spending, tool popularity
4. **Relational Integrity** - Foreign keys ensure data consistency
5. **Production Ready** - Scale beyond hackathon demo

---

## 🚀 Installation Options

### Option 1: Local PostgreSQL (Recommended for Development)

#### Windows:
```powershell
# Download installer from:
https://www.postgresql.org/download/windows/

# Or use Chocolatey:
choco install postgresql

# Start PostgreSQL:
# Runs automatically as Windows service
```

#### Setup Database:
```powershell
# Open PowerShell and connect:
psql -U postgres

# Create database:
CREATE DATABASE denverhacks;

# Create user:
CREATE USER denverhacks_user WITH PASSWORD 'your_password_here';

# Grant privileges:
GRANT ALL PRIVILEGES ON DATABASE denverhacks TO denverhacks_user;

# Exit:
\q
```

#### Update .env:
```env
DATABASE_URL="postgresql://denverhacks_user:your_password_here@localhost:5432/denverhacks"
```

---

### Option 2: Docker PostgreSQL (Zero Installation)

```powershell
# Pull PostgreSQL image:
docker pull postgres:16-alpine

# Run container:
docker run -d `
  --name denverhacks_db `
  -e POSTGRES_DB=denverhacks `
  -e POSTGRES_USER=denverhacks_user `
  -e POSTGRES_PASSWORD=hackathon2026 `
  -p 5432:5432 `
  postgres:16-alpine

# Check it's running:
docker ps
```

#### Update .env:
```env
DATABASE_URL="postgresql://denverhacks_user:hackathon2026@localhost:5432/denverhacks"
```

---

### Option 3: Cloud PostgreSQL (For Production Demo)

#### Supabase (Free Tier):
1. Go to: https://supabase.com/
2. Create new project
3. Get connection string from Settings → Database
4. Add to .env:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

#### Railway (Free $5 credit):
1. Go to: https://railway.app/
2. New Project → Add PostgreSQL
3. Copy `DATABASE_URL` from Variables tab
4. Add to .env

#### Neon (Serverless):
1. Go to: https://neon.tech/
2. Create project
3. Copy connection string
4. Add to .env

---

## 🔧 After Setup: Run Migrations

```powershell
cd DenverHacks

# Generate Prisma Client:
npx prisma generate

# Push schema to database (creates tables):
npx prisma db push

# (Optional) See your data in browser:
npx prisma studio
```

---

## 📊 Verify Setup

```powershell
# Start backend:
npm run dev

# Check logs - should see:
✅ Database connected
```

Instead of:
```
⚠️  Database not available - running in degraded mode
```

---

## 🧪 Test Real Payments

Once PostgreSQL is configured:

1. **Execute a tool** (via frontend autonomous demo):
```typescript
// Creates Execution record in database
{
  agentId: "agent-123",
  toolId: "weather-api",
  costWei: "2000000000000000", // 0.002 KITE
  status: "PENDING"
}
```

2. **Settlement runs** (every 30 seconds):
```typescript
// Groups pending executions
// Submits Escrow.debit() to Kite AI
// Updates status to SUCCESS
// Creates Settlement record with txHash
```

3. **Query results**:
```sql
-- In psql or Prisma Studio:
SELECT * FROM "Execution" WHERE status = 'SUCCESS';
SELECT * FROM "Settlement" ORDER BY "createdAt" DESC;
```

---

## 🆚 Degraded Mode vs PostgreSQL Mode

| Feature | Degraded (In-Memory) | PostgreSQL |
|---------|---------------------|------------|
| **Development Speed** | ⚡ Instant | 🐢 Needs setup |
| **Data Persistence** | ❌ Lost on restart | ✅ Persists |
| **Multi-server** | ❌ Each has own data | ✅ Shared state |
| **Bounty Demo** | ✅ Works perfectly | ✅ More impressive |
| **Production** | ❌ Not suitable | ✅ Required |

---

## 🏆 For Kite AI Bounty Submission

### Minimum (Works Fine):
```env
# No DATABASE_URL - uses degraded mode
# Still shows:
# ✅ x402 payments
# ✅ Autonomous execution
# ✅ Kitescan links
# ✅ HCS attestations
```

### Recommended (More Impressive):
```env
# With PostgreSQL (Supabase/Railway)
DATABASE_URL="postgresql://..."

# Judges can see:
# ✅ All above features
# ✅ Persistent settlement history
# ✅ Production-ready architecture
# ✅ Scalable design
```

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"
```powershell
# Check PostgreSQL is running:
Get-Service postgresql-*  # Windows
docker ps  # Docker

# Test connection:
psql -h localhost -U denverhacks_user -d denverhacks
```

### Error: "P1001: Can't reach database"
```env
# Check DATABASE_URL format:
postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Ensure password doesn't have special chars
# If it does, URL-encode them:
# @ → %40
# # → %23
```

### Error: "Syntax error in schema"
```powershell
# Regenerate Prisma client:
npx prisma generate

# Force push schema:
npx prisma db push --force-reset
```

---

## 📝 Migration from Degraded to PostgreSQL

Your current in-memory data (seeded agents, demo executions) is NOT automatically migrated.

To preserve demo data:
```typescript
// After setting up PostgreSQL, run:
npx tsx scripts/seed-demo-data.ts

// This will:
// 1. Create demo agents (Neural Core, Quantum Mind)
// 2. Create demo tools (Weather API, Price Oracle)
// 3. Create sample executions with mock txHashes
```

---

## 🎬 Demo Strategy

### For Video Recording:
1. ✅ Use degraded mode (faster, no setup)
2. ✅ Show autonomous execution
3. ✅ Show Kitescan links (will be mock tx hashes)
4. ✅ Explain: "Production uses PostgreSQL, demo uses in-memory"

### For Live Deployment (Vercel):
1. ✅ Use Supabase PostgreSQL (free tier)
2. ✅ Deploy backend to Railway
3. ✅ Deploy frontend to Vercel
4. ✅ Judges can test autonomous execution
5. ✅ Real settlements visible in /demo/agent/01

---

## 🚀 Quick Commands Reference

```powershell
# Check if PostgreSQL needed:
npm run dev
# Look for "degraded mode" warning

# Setup (if you want PostgreSQL):
docker run -d --name pg -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres
echo 'DATABASE_URL="postgresql://postgres:pass@localhost:5432/postgres"' > .env
npx prisma db push

# View data:
npx prisma studio
# Opens http://localhost:5555

# Reset database:
npx prisma db push --force-reset
```

---

## ✅ Summary

**For Kite AI Bounty:**
- Degraded mode (no PostgreSQL) = ✅ **Perfectly acceptable**
- PostgreSQL setup = ✅ **Nice bonus** (shows production thinking)

**Choose based on:**
- Time available → Degraded mode (0 setup)
- Want to impress → PostgreSQL (30 min setup)
- Production deployment → PostgreSQL (required)

Your backend **ALREADY WORKS** without PostgreSQL. Adding it is optional for the hackathon! 🎉
