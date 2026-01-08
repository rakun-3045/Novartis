# Deploying ClinicalAI to Hugging Face Spaces

## Prerequisites

1. **Hugging Face Account**: Create one at [huggingface.co](https://huggingface.co/join)
2. **Git LFS**: Install from [git-lfs.github.com](https://git-lfs.github.com/)
3. **HuggingFace CLI**: Install with `pip install huggingface_hub`

## Deployment Steps

### Option 1: Using HuggingFace Hub CLI (Recommended)

```bash
# 1. Login to HuggingFace
huggingface-cli login

# 2. Create a new Space
huggingface-cli repo create clinicalai-rag --type space --space_sdk gradio

# 3. Clone the Space repository
git clone https://huggingface.co/spaces/YOUR_USERNAME/clinicalai-rag
cd clinicalai-rag

# 4. Copy files from this folder
# Copy: app.py, requirements.txt, README.md, data/, faiss_index/

# 5. Initialize Git LFS for large files
git lfs install
git lfs track "*.faiss"
git lfs track "*.pkl"
git lfs track "*.jsonl"

# 6. Commit and push
git add .
git commit -m "Initial deployment of ClinicalAI RAG"
git push
```

### Option 2: Using Web Interface

1. Go to [huggingface.co/new-space](https://huggingface.co/new-space)
2. Fill in:
   - **Owner**: Your username
   - **Space name**: `clinicalai-rag`
   - **License**: MIT
   - **SDK**: Gradio
   - **Hardware**: CPU basic (free) or upgrade for faster performance
3. Click "Create Space"
4. Upload files via the web interface:
   - `app.py`
   - `requirements.txt`
   - `README.md`
   - `data/rag_combined_documents.jsonl`
   - `faiss_index/index.faiss`
   - `faiss_index/index.pkl`

### Option 3: Using PowerShell Script

```powershell
# Run from the huggingface-space directory
cd "E:\Novartis Health Hackathon\huggingface-space"

# Login
huggingface-cli login

# Upload the Space
huggingface-cli upload-folder . YOUR_USERNAME/clinicalai-rag --repo-type space
```

## Setting Up Secrets (Optional but Recommended)

1. Go to your Space settings: `https://huggingface.co/spaces/YOUR_USERNAME/clinicalai-rag/settings`
2. Add secret: `HUGGINGFACEHUB_API_TOKEN` with your HF token
   - This provides authenticated access to the LLM API

## Hardware Requirements

| Tier | RAM | CPU | Cost | Notes |
|------|-----|-----|------|-------|
| CPU Basic | 2 vCPU | 16GB | Free | May have cold starts |
| CPU Upgrade | 2 vCPU | 32GB | $0.03/hr | Better for production |
| T4 Small | 4 vCPU | 15GB + T4 GPU | $0.60/hr | Fastest inference |

## Monitoring

- View logs: Space page → "Logs" tab
- Check status: Space page → "Running" indicator
- Restart: Space page → Settings → "Restart Space"

## Troubleshooting

### "Out of Memory" Error
- Upgrade to CPU Upgrade tier
- Reduce `fetch_k` in retrieval (currently 24)

### "Model Loading Timeout"
- The first load takes ~2-3 minutes for embeddings
- Subsequent requests are much faster

### "Rate Limited" on LLM
- Add your own `HUGGINGFACEHUB_API_TOKEN` in Space secrets
- Consider using Groq API as alternative

## File Structure

```
clinicalai-rag/
├── app.py                    # Main Gradio application
├── requirements.txt          # Python dependencies
├── README.md                 # Space README (displayed on HF)
├── .gitattributes           # Git LFS config
├── data/
│   └── rag_combined_documents.jsonl  # RAG documents
└── faiss_index/
    ├── index.faiss          # FAISS vector index
    └── index.pkl            # Index metadata
```

## Live Demo

After deployment, your Space will be available at:
```
https://huggingface.co/spaces/YOUR_USERNAME/clinicalai-rag
```

You can also embed it in websites:
```html
<iframe
  src="https://YOUR_USERNAME-clinicalai-rag.hf.space"
  width="100%"
  height="600"
></iframe>
```
