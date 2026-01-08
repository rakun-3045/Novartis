---
title: ClinicalAI - Clinical Trial RAG Assistant
emoji: 🏥
colorFrom: blue
colorTo: indigo
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
license: mit
---

# ClinicalAI - Clinical Trial RAG Assistant

An AI-powered assistant for clinical trial data analysis using Retrieval-Augmented Generation (RAG).

## Features

- 🔍 **Semantic Search**: Query clinical trial data using natural language
- 📊 **Risk Analysis**: Get insights on subject risk levels and data quality
- 🏥 **Study Insights**: Analyze study-level metrics and performance
- 💬 **Conversational AI**: Multi-turn conversations with context awareness

## How to Use

1. Type your question about clinical trials in the text box
2. Click "Submit" or press Enter
3. The AI will retrieve relevant documents and generate a response

## Example Questions

- "How many subjects are at critical risk?"
- "What are the top issues in Study 16?"
- "Show me the safety discrepancy summary"
- "Which sites have the most pending items?"

## Technical Details

- **Embeddings**: all-MiniLM-L6-v2 (384-dimensional)
- **Vector Store**: FAISS with optimized indexing
- **LLM**: Gemma 3 27B via HuggingFace Inference API
- **Retrieval**: MMR with priority-aware re-ranking
