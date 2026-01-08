# Clinical Trial Dashboard - ClinicalAI

A modern clinical trial monitoring dashboard built with React, Vite, and Python serverless functions. Features real-time data visualization, ML-powered risk predictions, and an AI chatbot for data insights.

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

3. **For full functionality (with backend):**
   Run the Python backend from the parent directory:
   ```bash
   cd ..
   python rag_pipeline_new.py
   ```

## 📦 Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **For production deployment:**
   ```bash
   vercel --prod
   ```

### Deploy to Netlify

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to Netlify via:
   - Drag & drop to [Netlify Drop](https://app.netlify.com/drop)
   - Or connect your Git repository

Note: For Netlify, the Python serverless functions won't work out of the box. Consider using Netlify Functions with Node.js or deploying the backend separately.

## 🏗️ Project Structure

```
clinical-trial-dashboard/
├── api/                    # Vercel Python serverless functions
│   ├── chat/
│   │   └── stream.py       # Streaming chat endpoint
│   ├── studies/
│   │   └── [studyId].py    # Dynamic study detail route
│   ├── chat.py             # Chat endpoint
│   ├── dashboard.py        # Dashboard data endpoint
│   ├── ml-results.py       # ML results endpoint
│   ├── sites.py            # Sites data endpoint
│   ├── studies.py          # Studies list endpoint
│   └── subjects.py         # Subjects data endpoint
├── public/
│   └── data/               # Static data files for API
│       ├── all_studies_subjects.csv
│       ├── dashboard_api.json
│       ├── ml_results_api.json
│       └── study_summaries.csv
├── src/
│   ├── components/         # React components
│   ├── context/            # React context providers
│   ├── pages/              # Page components
│   ├── services/           # API service functions
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── vercel.json             # Vercel configuration
├── vite.config.js          # Vite configuration
└── package.json            # Dependencies and scripts
```

## ✨ Features

- **Dashboard Overview**: Key performance indicators and metrics
- **Study Management**: View and analyze individual studies
- **Site Monitoring**: Track site-level performance
- **Subject Tracking**: Monitor subject status and risk levels
- **ML Analytics**: View model predictions and feature importance
- **AI Chatbot**: Interactive Q&A about clinical trial data

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6
- **API**: Python serverless functions (Vercel)

## 📝 Environment Variables

For full RAG functionality, you may need these environment variables:

```env
HUGGINGFACE_API_KEY=your_hf_api_key
GROQ_API_KEY=your_groq_api_key
```

## 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard` | GET | Dashboard KPIs and overview |
| `/api/studies` | GET | List all studies |
| `/api/studies/:id` | GET | Get study details |
| `/api/sites` | GET | List all sites |
| `/api/subjects` | GET | List subjects (sampled) |
| `/api/ml-results` | GET | ML model results |
| `/api/chat` | POST | Chat with AI (non-streaming) |
| `/api/chat/stream` | POST | Chat with AI (streaming) |

## 📄 License

Proprietary - Novartis Health Hackathon 2026
