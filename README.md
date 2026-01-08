<p align="center">
  <img src="https://img.shields.io/badge/Clinical_Trial-AI_Platform-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIyIDEyaC00bC0zIDlMOSAzbC0zIDloLTQiLz48L3N2Zz4=" alt="TrialPulse AI"/>
</p>

<h1 align="center">🏥 TrialPulse AI</h1>

<p align="center">
  <strong>AI-Powered Clinical Trial Monitoring & Analytics Platform</strong>
</p>

<p align="center">
  <em>Transform clinical trial data management with real-time insights, predictive analytics, and an intelligent RAG-powered assistant</em>
</p>

<p align="center">
  <a href="#-features"><img src="https://img.shields.io/badge/Features-blue?style=flat-square" alt="Features"/></a>
  <a href="#-quick-start"><img src="https://img.shields.io/badge/Quick_Start-green?style=flat-square" alt="Quick Start"/></a>
  <a href="#-tech-stack"><img src="https://img.shields.io/badge/Tech_Stack-purple?style=flat-square" alt="Tech Stack"/></a>
  <a href="#-deployment"><img src="https://img.shields.io/badge/Deployment-orange?style=flat-square" alt="Deployment"/></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python" alt="Python"/>
  <img src="https://img.shields.io/badge/LangChain-RAG-green?style=flat-square" alt="LangChain"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3.3-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind"/>
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Demo](#-demo)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [ML Models](#-ml-models)
- [RAG Pipeline](#-rag-pipeline)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Team](#-team)

---

## 🎯 Overview

**TrialPulse AI** is an intelligent clinical trial monitoring platform developed for the **Novartis Health Hackathon (NEST 2.0)**. It empowers Clinical Research Associates (CRAs) and data managers with:

- 📊 **Real-time dashboards** for trial oversight
- 🤖 **AI-powered chatbot** using Retrieval-Augmented Generation (RAG)
- 🎯 **ML-based risk prediction** with 99.7% accuracy
- 📈 **Data quality monitoring** across 23+ studies

### 📈 At a Glance

| Metric | Value |
|--------|-------|
| 📚 Studies Monitored | **23** |
| 👥 Subjects Tracked | **28,904** |
| 🏥 Sites Covered | **2,500+** |
| 🎯 ML Accuracy | **99.7%** |
| 📄 RAG Documents | **31,500+** |

---

## ✨ Features

### 🖥️ Interactive Dashboard
- **KPI Cards**: Total subjects, issues, risk distribution
- **Study Comparison**: Cross-study analytics and benchmarking
- **Risk Heatmaps**: Visual risk stratification
- **Trend Analysis**: Historical data patterns

### 🤖 AI Clinical Assistant (RAG)
- **Natural Language Queries**: "How many subjects are at critical risk?"
- **Contextual Responses**: Answers grounded in your trial data
- **Multi-turn Conversations**: Remembers context for follow-ups
- **Source Citations**: References specific documents

### 📊 ML-Powered Analytics
- **Risk Classification**: Predict subject risk levels (Low/Medium/High/Critical)
- **Issue Prediction**: Forecast total issues per subject
- **Pending Items Detection**: Identify coding completion status
- **Feature Importance**: Understand what drives predictions

### 🏥 Study & Site Management
- **Study Overview**: Drill-down into individual studies
- **Site Performance**: Compare site-level metrics
- **Subject Tracking**: Individual subject profiles with risk scores

### 🌙 Modern UI/UX
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Works on desktop and tablet
- **Real-time Updates**: Live data synchronization
- **Elegant Visualizations**: Recharts-powered graphs

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **Git**

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/rakun-3045/Novartis.git
cd Novartis
```

### 2️⃣ Set Up Environment

```bash
# Create Python virtual environment
python -m venv .venv

# Activate it
# Windows:
.\.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Set your HuggingFace token
# Windows:
set HUGGINGFACEHUB_API_TOKEN=hf_your_token_here
# Mac/Linux:
export HUGGINGFACEHUB_API_TOKEN=hf_your_token_here
```

### 3️⃣ Start the Backend

```bash
python rag_pipeline_new.py
```

Backend runs at: `http://localhost:8000`

### 4️⃣ Start the Frontend

```bash
cd clinical-trial-dashboard
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

### 5️⃣ Open in Browser

Navigate to `http://localhost:3000` and explore! 🎉

---

## 📁 Project Structure

```
Novartis/
├── 📂 clinical-trial-dashboard/    # React Frontend
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Route pages
│   │   │   ├── Dashboard.jsx       # Main dashboard
│   │   │   ├── Studies.jsx         # Studies list
│   │   │   ├── Subjects.jsx        # Subject management
│   │   │   ├── Analytics.jsx       # ML analytics
│   │   │   └── Chat.jsx            # AI assistant
│   │   ├── services/api.js         # API client
│   │   └── context/                # React context
│   ├── api/                        # Vercel serverless functions
│   └── public/data/                # Static data files
│
├── 📂 consolidated_data/           # Processed datasets
│   ├── rag_combined_documents.jsonl    # RAG document store
│   ├── dashboard_api.json              # Dashboard data
│   ├── ml_results_api.json             # ML model results
│   └── all_studies_subjects.csv        # Subject records
│
├── 📂 faiss_index_optimized/       # FAISS vector store
│   ├── index.faiss                 # Vector embeddings
│   └── index.pkl                   # Index metadata
│
├── 📂 huggingface-space/           # HuggingFace deployment
│   ├── app.py                      # Gradio application
│   └── requirements.txt
│
├── 📂 QC Anonymized Study Files/   # Raw study data (23 studies)
│
├── 📄 rag_pipeline_new.py          # FastAPI backend + RAG
├── 📄 tests.ipynb                  # Data analysis & ML training
├── 📄 Dockerfile                   # Container configuration
├── 📄 docker-compose.yml           # Multi-container setup
└── 📄 DEPLOYMENT.md                # Deployment guide
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| ⚛️ **React 18** | UI Framework |
| ⚡ **Vite** | Build Tool |
| 🎨 **Tailwind CSS** | Styling |
| 📊 **Recharts** | Data Visualization |
| 🧭 **React Router** | Navigation |
| 🎭 **Lucide Icons** | Iconography |

### Backend
| Technology | Purpose |
|------------|---------|
| 🐍 **FastAPI** | REST API Framework |
| 🦜 **LangChain** | RAG Orchestration |
| 🤗 **HuggingFace** | LLM & Embeddings |
| 🔍 **FAISS** | Vector Search |
| 🧠 **Gemma 27B** | Large Language Model |
| 📐 **all-MiniLM-L6-v2** | Sentence Embeddings |

### Data Science
| Technology | Purpose |
|------------|---------|
| 🐼 **Pandas** | Data Processing |
| 🔢 **NumPy** | Numerical Computing |
| 🤖 **Scikit-learn** | ML Models |
| 📊 **Matplotlib/Seaborn** | Visualization |

---

## 🧠 ML Models

Our ML pipeline achieves **state-of-the-art performance** on clinical trial risk prediction:

### Model Performance

| Task | Best Model | Accuracy/R² | F1 Score |
|------|------------|-------------|----------|
| 🎯 Risk Classification | Gradient Boosting | **99.71%** | 99.70% |
| 📋 Pending Items | Random Forest | **100.0%** | 100.0% |
| 📈 Issue Prediction | Ridge Regression | **R² = 1.0** | MAE = 0.0 |

### Top Predictive Features

1. `open_issues_count` - Number of open data issues
2. `safety_discrepancy_count` - Safety-related discrepancies
3. `MedDRA_Pending` - Pending medical coding
4. `missing_pages_count` - Missing documentation
5. `outstanding_visits_count` - Overdue visits

---

## 🔍 RAG Pipeline

The RAG (Retrieval-Augmented Generation) system enables natural language querying of clinical trial data:

### Document Types

| Type | Count | Description |
|------|-------|-------------|
| 📄 Subject Profiles | 28,900 | Individual subject records |
| 📊 Study Summaries | 24 | Study-level analytics |
| 🏥 Site Reports | 2,500 | Site performance data |
| 📋 DQI Scores | 29,400 | Data Quality Index |
| 📝 CRA Reports | 24 | Monitoring summaries |

### Architecture

```
User Query → Embeddings → FAISS Search → MMR Re-ranking → LLM Generation
                              ↓
                    Priority-Aware Retrieval
                    (Study/Site/Subject docs)
```

### Example Queries

- *"Which studies have the highest critical risk subjects?"*
- *"What are the main data quality issues in Study 16?"*
- *"Show me the safety discrepancy summary"*
- *"Compare pending items across all sites"*

---

## 🔌 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Dashboard KPIs & overview |
| `GET` | `/api/studies` | List all studies |
| `GET` | `/api/studies/{id}` | Study details |
| `GET` | `/api/sites` | List all sites |
| `GET` | `/api/subjects` | Subject data (sampled) |
| `GET` | `/api/ml-results` | ML model results |
| `POST` | `/api/chat` | Chat with AI |
| `POST` | `/api/chat/stream` | Streaming chat |
| `GET` | `/health` | Health check |

### Chat Request Example

```json
POST /api/chat
{
  "question": "How many subjects are at critical risk?",
  "k": 12
}
```

---

## 🚢 Deployment

### Option 1: Vercel (Frontend) + Railway (Backend)

**Recommended for production**

```bash
# Frontend - Vercel
cd clinical-trial-dashboard
npx vercel --prod

# Backend - Railway
cd ..
railway login
railway up
```

### Option 2: HuggingFace Spaces

Deploy the RAG chatbot as a Gradio app:

```bash
cd huggingface-space
huggingface-cli login
huggingface-cli upload-folder . YOUR_USERNAME/trialpulse-ai --repo-type space
```

### Option 3: Docker

```bash
docker-compose up --build
```

📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 👥 Team

<table>
  <tr>
    <td align="center">
      <strong>Rahul Kumar</strong><br/>
      <sub>AI/ML Engineer</sub>
    </td>
    <td align="center">
      <strong>Karthikeya Sharma</strong><br/>
      <sub>Backend Developer</sub>
    </td>
    <td align="center">
      <strong>Adarsh Pandey</strong><br/>
      <sub>Data Scientist</sub>
    </td>
  </tr>
</table>

---

## 📄 License

This project was developed for the **Novartis Health Hackathon (NEST 2.0)**.

---

## 🙏 Acknowledgments

- **Novartis** - For organizing NEST 2.0 Hackathon
- **HuggingFace** - For LLM and embedding models
- **LangChain** - For RAG framework
- **Vercel** - For deployment platform

---

<p align="center">
  <strong>Built with ❤️ for better clinical trials</strong>
</p>

<p align="center">
  <a href="https://github.com/rakun-3045/Novartis">⭐ Star this repo</a> •
  <a href="https://github.com/rakun-3045/Novartis/issues">🐛 Report Bug</a> •
  <a href="https://github.com/rakun-3045/Novartis/issues">✨ Request Feature</a>
</p>
