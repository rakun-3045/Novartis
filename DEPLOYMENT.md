# ClinicalAI Deployment Guide

This guide covers deploying both the **Frontend** (React) and **Backend** (Python RAG Pipeline) to production.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRODUCTION                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌───────────────────┐         ┌───────────────────────────┐  │
│   │   FRONTEND        │         │   BACKEND (RAG)           │  │
│   │   (Vercel/        │  API    │   (Railway/Render/        │  │
│   │    Netlify)       │ ──────► │    Fly.io)                │  │
│   │                   │         │                           │  │
│   │   - React/Vite    │         │   - FastAPI               │  │
│   │   - Static files  │         │   - FAISS Vector Store    │  │
│   │   - Tailwind CSS  │         │   - HuggingFace LLM       │  │
│   └───────────────────┘         │   - Embeddings            │  │
│                                 └───────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Start (Recommended Setup)

**Best combination for full functionality:**
- **Frontend**: Vercel (free tier available)
- **Backend**: Railway (free tier with $5 credit) or Render (free tier)

---

## 🖥️ Frontend Deployment

### Option 1: Vercel (Recommended)

```bash
# Navigate to frontend directory
cd clinical-trial-dashboard

# Install Vercel CLI
npm i -g vercel

# Deploy (follow prompts)
vercel

# For production
vercel --prod
```

**Environment Variables** (set in Vercel dashboard):
```
VITE_API_URL=https://your-backend-url.railway.app/api
```

### Option 2: Netlify

1. Push code to GitHub
2. Connect repository at [netlify.com](https://netlify.com)
3. Build settings (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`

**Note**: Netlify won't run Python API functions. Set `VITE_API_URL` to your backend URL.

---

## 🐍 Backend Deployment (Full RAG Pipeline)

The backend requires **at least 2GB RAM** for the embeddings model.

### Option 1: Railway (Recommended - Easiest)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd "E:\Novartis Health Hackathon"
railway init

# Deploy
railway up

# Set environment variables
railway variables set HUGGINGFACEHUB_API_TOKEN=hf_your_token
railway variables set GROQ_API_KEY=gsk_your_key  # Optional
```

**Pricing**: Free tier includes $5 credit (~500 hours on Starter plan)

### Option 2: Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repository
4. Render will detect `render.yaml` automatically
5. Add environment variables in dashboard:
   - `HUGGINGFACEHUB_API_TOKEN`
   - `GROQ_API_KEY` (optional)

**Pricing**: Free tier available (spins down after 15 min inactivity)

### Option 3: Fly.io

```bash
# Install Fly CLI
# Windows: iwr https://fly.io/install.ps1 -useb | iex
# Mac/Linux: curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch (from project root)
cd "E:\Novartis Health Hackathon"
fly launch

# Set secrets
fly secrets set HUGGINGFACEHUB_API_TOKEN=hf_your_token
fly secrets set GROQ_API_KEY=gsk_your_key

# Deploy
fly deploy
```

**Pricing**: Free tier includes 3 shared-cpu-1x VMs

### Option 4: Google Cloud Run

```bash
# Install gcloud CLI and authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Build and push container
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/clinicalai-backend

# Deploy
gcloud run deploy clinicalai-backend \
  --image gcr.io/YOUR_PROJECT_ID/clinicalai-backend \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --timeout 60 \
  --set-env-vars HUGGINGFACEHUB_API_TOKEN=hf_your_token
```

---

## 🔗 Connecting Frontend to Backend

After deploying the backend, update your frontend:

### Method 1: Environment Variable (Recommended)

In Vercel/Netlify dashboard, add:
```
VITE_API_URL=https://your-backend-url.railway.app/api
```

Then redeploy the frontend.

### Method 2: Direct Code Change

Edit `clinical-trial-dashboard/src/services/api.js`:
```javascript
const API_BASE = 'https://your-backend-url.railway.app/api'
```

---

## 🔐 Environment Variables Reference

### Backend (Required)
| Variable | Description | Example |
|----------|-------------|---------|
| `HUGGINGFACEHUB_API_TOKEN` | HuggingFace API key | `hf_xxx...` |
| `PORT` | Server port | `8000` |

### Backend (Optional)
| Variable | Description | Example |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq API for faster LLM | `gsk_xxx...` |
| `HOST` | Bind address | `0.0.0.0` |

### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://backend.railway.app/api` |

---

## 📁 Files Required for Backend Deployment

Ensure these files/folders exist in your repository:

```
├── rag_pipeline_new.py      # Main FastAPI application
├── requirements.txt          # Python dependencies
├── Dockerfile               # Container configuration
├── consolidated_data/       # Data files (CSV, JSON, JSONL)
│   ├── dashboard_api.json
│   ├── ml_results_api.json
│   ├── all_studies_subjects.csv
│   ├── rag_combined_documents.jsonl
│   └── ... (other data files)
├── faiss_index_optimized/   # FAISS vector store
│   ├── index.faiss
│   └── index.pkl
└── railway.json / render.yaml / fly.toml  # Platform config
```

---

## 🧪 Testing Deployment

### Test Backend Health
```bash
curl https://your-backend-url.railway.app/api/health
# Expected: {"status": "healthy", ...}
```

### Test API Endpoints
```bash
# Dashboard
curl https://your-backend-url.railway.app/api/dashboard

# Chat
curl -X POST https://your-backend-url.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "How many subjects are at critical risk?"}'
```

---

## 🚨 Troubleshooting

### Backend Issues

**Problem**: Cold start timeout
- **Solution**: Use Fly.io or Railway with `min_machines_running = 1`

**Problem**: Memory errors
- **Solution**: Increase RAM to 2GB minimum (embeddings model needs ~1.5GB)

**Problem**: FAISS index not found
- **Solution**: Ensure `faiss_index_optimized/` folder is included in deployment

### Frontend Issues

**Problem**: API calls fail with CORS
- **Solution**: Backend already has CORS configured. Check `VITE_API_URL` is correct.

**Problem**: Chat not working
- **Solution**: Verify backend is running with `curl /api/health`

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| **Railway** | $5 credit | $5/month | Easy setup, good DX |
| **Render** | Yes (sleeps) | $7/month | Simple, reliable |
| **Fly.io** | 3 free VMs | Pay-as-go | Global edge, low latency |
| **Cloud Run** | Yes | Pay-per-request | Scalability |
| **Vercel** | Yes | $20/month | Frontend hosting |
| **Netlify** | Yes | $19/month | Frontend + CI/CD |

---

## 🎉 Final Checklist

- [ ] Backend deployed and `/api/health` returns 200
- [ ] Environment variables set (HuggingFace token)
- [ ] Frontend deployed with `VITE_API_URL` configured
- [ ] Chat functionality working
- [ ] Dashboard loading data correctly
- [ ] All API endpoints responding

**Need help?** Check the platform-specific logs:
- Railway: `railway logs`
- Render: Dashboard → Logs
- Fly.io: `fly logs`
- Vercel: Dashboard → Deployments → Functions
