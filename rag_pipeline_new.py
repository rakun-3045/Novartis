#!/usr/bin/env python
# coding: utf-8

# # Clinical Trial RAG Pipeline - Optimized
# 
# ## Overview
# This notebook implements a Retrieval-Augmented Generation (RAG) pipeline for clinical trial data analysis.
# 
# ### RAG-Ready Files in `consolidated_data/`:
# | File | Description | Records | Source |
# |------|-------------|---------|--------|
# | `rag_combined_documents.jsonl` | **Master document store** - combines all document types | ~31,500 | Generated from all other RAG files |
# | `rag_subject_documents.jsonl` | Subject-level profiles with risk and issues | ~28,900 | Generated from `global_clinical_data.csv` |
# | `rag_study_documents.jsonl` | Study-level summaries | 24 | Aggregated from subject data |
# | `rag_site_documents.jsonl` | Site performance reports | ~2,500 | Grouped by Study + Site |
# | `rag_dqi_documents.jsonl` | Data Quality Index (DQI) scores per subject | ~29,400 | Calculated from issue metrics |
# | `rag_study_dqi_summaries.jsonl` | Study-level DQI summaries | 24 | Aggregated DQI scores |
# | `rag_cra_reports.jsonl` | CRA Monitoring Reports per study | 24 | Executive summaries |
# | `rag_data_dictionary.md` | Field definitions & terminology | 1 | Manual reference |
# 
# ### Document Generation Logic (from `tests.ipynb`):
# - **Subject Documents**: Natural language profiles generated from `global_df` with risk assessment, issue summaries, and CRA action items
# - **Study Documents**: Aggregated metrics (risk distribution, issue breakdown, priority subjects)
# - **Site Documents**: Site-level performance metrics grouped by Study + Site
# - **DQI Documents**: Calculated scores based on issue types (-2 per open issue, -1 per missing lab, etc.)
# - **CRA Reports**: Executive summaries with priority actions
# 
# ### Key Challenge: Study Data Imbalance
# Studies have vastly different subject counts (Study 16: 672 subjects vs Study 14: 3 subjects).
# This pipeline uses **weighted sampling and MMR** to ensure balanced retrieval.

# In[3]:


# ============================================================================
# CELL 1: Install Dependencies
# ============================================================================
# Run this cell only once to install required packages

# get_ipython().system('pip install langchain langchain-huggingface langchain-community faiss-cpu -q')


# In[4]:


# ============================================================================
# CELL 2: Setup LLM (Gemma 27B via HuggingFace Inference API)
# ============================================================================
import os
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint

# Load HuggingFace token from environment variable
# Set your token: export HUGGINGFACEHUB_API_TOKEN=hf_your_token_here
if not os.environ.get("HUGGINGFACEHUB_API_TOKEN"):
    print("⚠️ Warning: HUGGINGFACEHUB_API_TOKEN not set. Please set it in your environment.")

# Gemma 27B for generation - optimized for conversational responses
llm = HuggingFaceEndpoint(
    repo_id="google/gemma-3-27b-it",
    temperature=0.4,
    max_new_tokens=4096,  # Increased for longer, more detailed responses
)
model = ChatHuggingFace(llm=llm)
print("✅ LLM initialized: Gemma 27B")


# In[5]:


# ============================================================================
# CELL 3: Setup Embeddings (all-MiniLM-L6-v2 - lightweight & fast)
# ============================================================================
from langchain_huggingface import HuggingFaceEmbeddings

# all-MiniLM-L6-v2: 384-dimensional embeddings, optimized for semantic similarity
# Much faster than Gemma 300M while maintaining good quality
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={'device': 'cpu'},
    encode_kwargs={
        'normalize_embeddings': True,  # Normalize for cosine similarity
        'batch_size': 64  # Larger batches for faster processing
    }
)

# Test embedding
test_embedding = embeddings.embed_query("test clinical trial data")
print(f"✅ Embeddings initialized: all-MiniLM-L6-v2")
print(f"   Embedding dimension: {len(test_embedding)}")


# In[6]:


# ============================================================================
# CELL 4: Load and Analyze RAG Documents
# ============================================================================
import json
import os
from collections import defaultdict
from langchain_core.documents import Document

# Document store paths with descriptions
RAG_FILES = {
    "rag_study_documents.jsonl": {
        "description": "Study-level summaries (highest priority)",
        "doc_type": "study_summary",
        "priority": 1
    },
    "rag_cra_reports.jsonl": {
        "description": "CRA monitoring reports",
        "doc_type": "cra_report",
        "priority": 1
    },
    "rag_study_dqi_summaries.jsonl": {
        "description": "Study DQI summaries",
        "doc_type": "study_dqi",
        "priority": 2
    },
    "rag_site_documents.jsonl": {
        "description": "Site performance reports",
        "doc_type": "site_summary",
        "priority": 2
    },
    "rag_dqi_documents.jsonl": {
        "description": "Subject DQI scores",
        "doc_type": "subject_dqi",
        "priority": 3
    },
    "rag_subject_documents.jsonl": {
        "description": "Subject profiles",
        "doc_type": "subject_profile",
        "priority": 3
    }
}

BASE_PATH = "consolidated_data"

# Analyze document distribution
print("📊 Analyzing RAG document distribution...\n")
study_doc_counts = defaultdict(lambda: defaultdict(int))
total_by_type = defaultdict(int)

for filename, config in RAG_FILES.items():
    filepath = os.path.join(BASE_PATH, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    data = json.loads(line)
                    study = data.get('study', 'Unknown')
                    study_doc_counts[study][config['doc_type']] += 1
                    total_by_type[config['doc_type']] += 1
                except:
                    pass

print("Document counts by type:")
for doc_type, count in sorted(total_by_type.items(), key=lambda x: -x[1]):
    print(f"  • {doc_type}: {count:,}")

print("\n📈 Study distribution (top 5 by document count):")
study_totals = {study: sum(counts.values()) for study, counts in study_doc_counts.items()}
for study, total in sorted(study_totals.items(), key=lambda x: -x[1])[:5]:
    print(f"  • {study}: {total:,} documents")

print(f"\n⚠️  Data imbalance detected: Study 16 has {study_totals.get('Study 16', 0):,} docs vs Study 14 has {study_totals.get('Study 14', 0):,} docs")


# In[7]:


# ============================================================================
# CELL 5: Load Documents with Stratified Sampling Strategy
# ============================================================================
# Strategy to handle data imbalance:
# 1. Load ALL high-priority documents (study summaries, CRA reports) - they're few
# 2. Load ALL site documents - moderate count
# 3. Sample subject-level documents proportionally (max per study)

import random
from collections import defaultdict

MAX_SUBJECTS_PER_STUDY = 100  # Cap subject docs per study to prevent dominance

documents = []
doc_counts = defaultdict(int)

# Load data dictionary first (always include)
data_dict_path = os.path.join(BASE_PATH, "rag_data_dictionary.md")
if os.path.exists(data_dict_path):
    with open(data_dict_path, 'r', encoding='utf-8') as f:
        content = f.read()
        documents.append(Document(
            page_content=content,
            metadata={
                "source": "rag_data_dictionary.md",
                "doc_type": "data_dictionary",
                "study": "ALL",
                "priority": 0
            }
        ))
        doc_counts["data_dictionary"] += 1

# Load documents by priority
for filename, config in RAG_FILES.items():
    filepath = os.path.join(BASE_PATH, filename)
    if not os.path.exists(filepath):
        continue

    # For subject-level docs, we'll sample
    if config['priority'] == 3:  # Subject-level docs
        # First pass: group by study
        study_docs = defaultdict(list)
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    data = json.loads(line)
                    content = data.get('content') or data.get('document', '')
                    if not content:
                        continue
                    study = data.get('study', 'Unknown')
                    study_docs[study].append((data, content))
                except:
                    pass

        # Sample from each study
        for study, docs in study_docs.items():
            # Prioritize high-risk subjects
            sorted_docs = sorted(docs, key=lambda x: -x[0].get('total_issues', 0))
            sampled = sorted_docs[:MAX_SUBJECTS_PER_STUDY]

            for data, content in sampled:
                metadata = {k: v for k, v in data.items() if k not in ['content', 'document']}
                metadata['source'] = filename
                metadata['doc_type'] = config['doc_type']
                metadata['priority'] = config['priority']
                documents.append(Document(page_content=content, metadata=metadata))
                doc_counts[config['doc_type']] += 1
    else:
        # Load all non-subject documents
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    data = json.loads(line)
                    content = data.get('content') or data.get('document', '')
                    if not content:
                        continue

                    metadata = {k: v for k, v in data.items() if k not in ['content', 'document']}
                    metadata['source'] = filename
                    metadata['doc_type'] = config['doc_type']
                    metadata['priority'] = config['priority']
                    documents.append(Document(page_content=content, metadata=metadata))
                    doc_counts[config['doc_type']] += 1
                except:
                    pass

print(f"📚 Loaded {len(documents):,} documents with stratified sampling:\n")
for doc_type, count in sorted(doc_counts.items(), key=lambda x: -x[1]):
    print(f"  • {doc_type}: {count:,}")

# Verify study balance after sampling
study_counts = defaultdict(int)
for doc in documents:
    study_counts[doc.metadata.get('study', 'Unknown')] += 1

print(f"\n📊 Study distribution after sampling (top 5):")
for study, count in sorted(study_counts.items(), key=lambda x: -x[1])[:5]:
    print(f"  • {study}: {count} documents")


# In[8]:


# ============================================================================
# CELL 6: Create FAISS Vector Store with Document Indexing
# ============================================================================
import faiss
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_community.vectorstores import FAISS

# Initialize FAISS index
embedding_dim = len(embeddings.embed_query("hello world"))
index = faiss.IndexFlatL2(embedding_dim)

vector_store = FAISS(
    embedding_function=embeddings,
    index=index,
    docstore=InMemoryDocstore(),
    index_to_docstore_id={},
)

# Add documents in batches
print(f"🔄 Adding {len(documents):,} documents to FAISS vector store...")

batch_size = 500  # Optimized for MiniLM
total_docs = len(documents)

for i in range(0, total_docs, batch_size):
    batch = documents[i:i+batch_size]
    vector_store.add_documents(batch)

    current = min(i + batch_size, total_docs)
    pct = (current / total_docs) * 100
    print(f"  Progress: {current:,}/{total_docs:,} ({pct:.1f}%)", end='\r')

print(f"\n✅ Vector store created with {total_docs:,} documents")

# Save for future use
VECTORSTORE_PATH = "faiss_index_optimized"
vector_store.save_local(VECTORSTORE_PATH)
print(f"💾 Saved to: {VECTORSTORE_PATH}/")


# In[9]:


# ============================================================================
# CELL 7: Advanced Retrieval Strategy - Multi-Stage Retrieval
# ============================================================================
# Strategy to handle study imbalance and improve relevance:
# 1. First retrieve by document priority (study summaries first)
# 2. Use MMR for diversity across studies
# 3. Apply post-retrieval re-ranking based on relevance + priority

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from collections import defaultdict

def advanced_retrieve(question: str, k: int = 15, study_filter: str = None):
    """
    Multi-stage retrieval with diversity and priority-aware re-ranking.

    Args:
        question: The user's question
        k: Total number of documents to retrieve
        study_filter: Optional study filter (e.g., "Study 10")

    Returns:
        List of relevant documents with diversity across studies
    """
    # Stage 1: Get more candidates using MMR for diversity
    retriever = vector_store.as_retriever(
        search_type="mmr",
        search_kwargs={
            "k": k * 3,  # Over-fetch for re-ranking
            "fetch_k": k * 5,  # Fetch even more for MMR diversity
            "lambda_mult": 0.7  # Balance relevance (1.0) vs diversity (0.0)
        }
    )

    candidates = retriever.invoke(question)

    # Stage 2: Apply study filter if specified
    if study_filter:
        # Normalize study filter for matching
        study_filter_normalized = study_filter.strip().lower()
        filtered = [
            doc for doc in candidates
            if doc.metadata.get('study', '').lower().strip() == study_filter_normalized
            or doc.metadata.get('study', '').lower().strip().replace('study ', '') == study_filter_normalized.replace('study ', '')
        ]
        if len(filtered) >= k // 2:
            candidates = filtered

    # Stage 3: Priority-aware re-ranking
    # Score = base_score + priority_boost
    def get_priority_score(doc):
        priority = doc.metadata.get('priority', 3)
        doc_type = doc.metadata.get('doc_type', '')

        # Higher score = higher priority
        priority_boost = {
            0: 100,  # Data dictionary
            1: 50,   # Study summaries, CRA reports
            2: 25,   # Site docs, DQI summaries
            3: 10    # Subject-level docs
        }

        return priority_boost.get(priority, 0)

    # Sort by priority (stable sort preserves MMR ordering within priority)
    candidates_sorted = sorted(candidates, key=get_priority_score, reverse=True)

    # Stage 4: Ensure study diversity in final results
    final_docs = []
    study_count = defaultdict(int)
    max_per_study = max(2, k // 5)  # At least 2 docs per study, but limit dominance

    for doc in candidates_sorted:
        study = doc.metadata.get('study', 'Unknown')
        doc_type = doc.metadata.get('doc_type', '')

        # Always include high-priority docs
        if doc.metadata.get('priority', 3) <= 1:
            final_docs.append(doc)
            study_count[study] += 1
        # For lower priority, enforce study diversity
        elif study_count[study] < max_per_study:
            final_docs.append(doc)
            study_count[study] += 1

        if len(final_docs) >= k:
            break

    # If we don't have enough, add remaining candidates
    if len(final_docs) < k:
        for doc in candidates_sorted:
            if doc not in final_docs:
                final_docs.append(doc)
            if len(final_docs) >= k:
                break

    return final_docs[:k]

print("✅ Advanced retrieval function defined")
print("   Features:")
print("   • MMR for diversity across studies")
print("   • Priority-aware re-ranking (study summaries > subjects)")
print("   • Study balancing to prevent single-study dominance")
print("   • Optional study filtering")


# In[10]:


# ============================================================================
# CELL 8: RAG Query Function with Humanized Prompt
# ============================================================================

# Humanized, detailed prompt for clinical trial assistant
RAG_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are an expert Clinical Trial Data Analyst and CRA (Clinical Research Associate) Assistant. 
Your role is to help clinical research teams understand their trial data, identify issues, and prioritize actions.

**IMPORTANT - Response Detail Level:**
- By DEFAULT, always provide COMPREHENSIVE, DETAILED, and THOROUGH responses
- Include extensive explanations, context, and supporting data
- Only provide brief/concise responses if the user EXPLICITLY asks for:
  - "brief", "short", "concise", "quick", "summary only", "just tell me", "in short", "TL;DR"
- When in doubt, err on the side of MORE detail, not less

**Your Communication Style:**
- Be conversational yet professional
- Provide thorough, detailed explanations with full context
- Use clinical research terminology appropriately
- Highlight concerning patterns and offer deep insights
- Be proactive in identifying potential issues and their root causes
- Include relevant statistics, percentages, and comparisons
- Explain the "why" behind findings, not just the "what"

**Response Structure (use ALL sections for detailed responses):**

## Summary
A comprehensive overview of your key findings (3-5 sentences covering the main points).

## Detailed Analysis
Provide an EXTENSIVE analysis of the data. Explain:
- What the data shows with specific numbers and metrics
- Why it matters for the clinical trial and patient safety
- Any patterns, trends, anomalies, or correlations you notice
- Comparisons across studies/sites/time periods if relevant
- Statistical context and benchmarks
- Potential root causes for issues identified
- Impact assessment of findings

## Key Findings
• Bullet point ALL important discoveries (aim for 5-10 points)
• Include specific numbers, percentages, and metrics
• Highlight critical and concerning issues
• Note any positive trends or improvements
• Compare to benchmarks or other studies when possible

## Recommended Actions
Prioritized list of actions the CRA team should take:
1. **Immediate actions** (safety/critical issues) - with specific steps
2. **Short-term actions** (data quality within 1-2 weeks) - with clear deliverables
3. **Medium-term actions** (process improvements) - with expected outcomes
4. **Monitoring recommendations** - ongoing surveillance needs

## Sources Referenced
List the specific documents and studies that informed your analysis with document types.

**Conversation Memory:**
You have access to recent conversation history below. Use this context to:
- Understand ongoing discussions and follow-up questions
- Maintain consistency with previous responses
- Build upon previously discussed topics
- Reference earlier findings when relevant

{chat_history}

**Important Guidelines:**
- Only use information from the provided context
- If information is not available, clearly state this and suggest what data would help
- Be specific with numbers, percentages, and study names
- If asked about a specific study, focus on that study but provide cross-study context when relevant
- When providing recommendations, make them actionable and specific

---
**Context (Clinical Trial Data):**
{context}"""),
    ("human", "{question}")
])

def format_docs_with_metadata(docs):
    """Format documents with source information for better context."""
    formatted = []
    for i, doc in enumerate(docs, 1):
        source = doc.metadata.get('source', 'Unknown')
        study = doc.metadata.get('study', 'Unknown')
        doc_type = doc.metadata.get('doc_type', 'Unknown')

        header = f"[Document {i} | {doc_type} | {study}]"
        formatted.append(f"{header}\n{doc.page_content}")

    return "\n\n---\n\n".join(formatted)


def ask(question: str, study_filter: str = None, k: int = 12, verbose: bool = True):
    """
    Ask a question about clinical trial data using RAG.

    Args:
        question: Your question about the clinical trial data
        study_filter: Optional - filter to a specific study (e.g., "Study 10")
        k: Number of documents to retrieve (default: 12)
        verbose: Whether to print sources (default: True)

    Examples:
        ask("What are the main issues across all studies?")
        ask("What's the status of Study 16?", study_filter="Study 16")
        ask("Which sites have the most critical subjects?")
    """
    if verbose:
        print("=" * 80)
        print(f"🔍 Question: {question}")
        if study_filter:
            print(f"📁 Study Filter: {study_filter}")
        print("=" * 80 + "\n")

    # Retrieve relevant documents
    docs = advanced_retrieve(question, k=k, study_filter=study_filter)

    if not docs:
        print("❌ No relevant documents found.")
        return

    # Format context
    context = format_docs_with_metadata(docs)

    # Generate response (no chat history for CLI function)
    chain = RAG_PROMPT | model | StrOutputParser()

    response = chain.invoke({
        "context": context,
        "question": question,
        "chat_history": "**Previous Conversation:** None (this is a new conversation)"
    })

    print(response)

    if verbose:
        print("\n" + "-" * 80)
        print("📚 Documents Retrieved:")
        print("-" * 80)

        # Group by type for cleaner output
        by_type = defaultdict(list)
        for doc in docs:
            doc_type = doc.metadata.get('doc_type', 'unknown')
            study = doc.metadata.get('study', 'Unknown')
            by_type[doc_type].append(study)

        for doc_type, studies in by_type.items():
            study_counts = defaultdict(int)
            for s in studies:
                study_counts[s] += 1
            study_str = ", ".join(f"{s}({c})" for s, c in study_counts.items())
            print(f"  • {doc_type}: {study_str}")

print("✅ RAG Query function 'ask()' is ready!")
print("\nUsage examples:")
print('  ask("What are the critical issues across all studies?")')
print('  ask("Tell me about Study 10", study_filter="Study 10")')
print('  ask("Which studies have the worst data quality?")')


# In[11]:


from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


# In[12]:


# ============================================================================
# CELL 9: Alternative - Load Existing Vector Store (Skip Cells 4-6)
# ============================================================================
# If you've already created the vector store, use this cell to load it directly

# Uncomment the following to load an existing vector store:
"""
from langchain_community.vectorstores import FAISS

VECTORSTORE_PATH = "faiss_index_optimized"
# Or use the original: VECTORSTORE_PATH = "faiss_index"

if os.path.exists(VECTORSTORE_PATH):
    vector_store = FAISS.load_local(
        VECTORSTORE_PATH,
        embeddings,
        allow_dangerous_deserialization=True,
    )
    print(f"✅ Loaded vector store from: {VECTORSTORE_PATH}")
else:
    print(f"❌ Vector store not found at: {VECTORSTORE_PATH}")
    print("   Please run cells 4-6 to create it first.")
"""
print("ℹ️  This cell is for loading pre-built vector stores.")


# ## 🎯 Query Your Clinical Trial Data
# 
# Run the cells below to ask questions about your clinical trial data.
# Modify the question and run the cell to get AI-powered insights.
# 
# ### Example Questions:
# - "What are the most critical issues across all studies?"
# - "Give me a detailed analysis of Study 16"
# - "Which sites have the highest risk subjects?"
# - "Compare data quality between Study 1 and Study 10"
# - "What are the pending coding items that need attention?"

# In[13]:


# ============================================================================
# QUERY 1: Overview of all studies
# ============================================================================

# Test queries commented out to speed up server startup
# ask("What are the most critical data quality issues across all studies? Provide a summary with specific numbers.")


# In[14]:


# ============================================================================
# QUERY 2: Study-specific analysis
# ============================================================================

# ask("Tell me about Study 10. What are the key issues and which subjects need attention?", 
#     study_filter="Study 10")


# In[15]:


# ============================================================================
# QUERY 3: Cross-study comparison
# ============================================================================

# ask("Which studies have the worst data quality and why? Compare the top 3 problematic studies.")


# In[16]:


# ============================================================================
# YOUR CUSTOM QUERY - Modify and run!
# ============================================================================

# Change the question below to ask anything about your clinical trial data:
# ask("What are the safety discrepancies that need immediate attention?")


# In[17]:


# ask("Generate a CRA report for study 21")


# ## 🌐 FastAPI Backend for Web Integration
# 
# The following cells create a FastAPI server that:
# 1. Accepts questions from the React frontend
# 2. Streams responses using Server-Sent Events (SSE)
# 3. Provides API endpoints for the dashboard data

# In[18]:


# ============================================================================
# CELL: Install FastAPI Dependencies
# ============================================================================
# !pip install fastapi uvicorn python-multipart sse-starlette -q


# In[19]:


# ============================================================================
# CELL: FastAPI Backend with Streaming RAG Responses
# ============================================================================
# This creates a backend server that the React frontend will connect to

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import asyncio
from typing import Optional

# Create FastAPI app
app = FastAPI(
    title="Clinical Trial RAG API",
    description="API for clinical trial data analysis with AI-powered insights",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    question: str
    study_filter: Optional[str] = None
    k: int = 12
    chat_history: Optional[list[ChatMessage]] = None  # Last N messages for memory

class ChatResponse(BaseModel):
    answer: str
    sources: list

# Helper function to format chat history for the prompt
def format_chat_history(chat_history: Optional[list[ChatMessage]], max_messages: int = 10) -> str:
    """Format the last N chat messages into a string for the prompt."""
    if not chat_history:
        return "**Previous Conversation:** None (this is a new conversation)"
    
    # Take only the last max_messages
    recent_history = chat_history[-max_messages:] if len(chat_history) > max_messages else chat_history
    
    if not recent_history:
        return "**Previous Conversation:** None (this is a new conversation)"
    
    formatted = ["**Previous Conversation (for context):**"]
    for msg in recent_history:
        role_label = "User" if msg.role == "user" else "Assistant"
        # Truncate long messages to keep context manageable
        content = msg.content[:500] + "..." if len(msg.content) > 500 else msg.content
        formatted.append(f"\n**{role_label}:** {content}")
    
    return "\n".join(formatted)

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/")
async def root():
    return {"status": "healthy", "message": "Clinical Trial RAG API is running"}

@app.get("/health")
async def health():
    """Root-level health check for container orchestration."""
    return {"status": "healthy", "vector_store_loaded": vector_store is not None}

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "vector_store_loaded": vector_store is not None}

# Non-streaming chat endpoint
@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Process a question and return the AI-generated answer.
    Supports conversation memory via chat_history parameter.
    """
    try:
        # Retrieve documents
        docs = advanced_retrieve(
            question=request.question,
            k=request.k,
            study_filter=request.study_filter
        )

        if not docs:
            raise HTTPException(status_code=404, detail="No relevant documents found")

        # Format context
        context = format_docs_with_metadata(docs)
        
        # Format chat history for memory (last 10 messages)
        chat_history_str = format_chat_history(request.chat_history, max_messages=10)

        # Generate response with memory
        chain = RAG_PROMPT | model | StrOutputParser()
        response = chain.invoke({
            "context": context,
            "question": request.question,
            "chat_history": chat_history_str
        })

        # Extract sources
        sources = []
        seen = set()
        for doc in docs:
            source_info = {
                "doc_type": doc.metadata.get("doc_type", "unknown"),
                "study": doc.metadata.get("study", "Unknown"),
                "source": doc.metadata.get("source", "Unknown")
            }
            source_key = f"{source_info['study']}_{source_info['doc_type']}"
            if source_key not in seen:
                sources.append(source_info)
                seen.add(source_key)

        return ChatResponse(answer=response, sources=sources)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Streaming chat endpoint
@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Stream the AI-generated response using Server-Sent Events.
    Supports conversation memory via chat_history parameter.
    """
    async def generate():
        try:
            # Retrieve documents
            docs = advanced_retrieve(
                question=request.question,
                k=request.k,
                study_filter=request.study_filter
            )

            if not docs:
                yield f"data: {json.dumps({'error': 'No relevant documents found'})}\n\n"
                return

            # Format context
            context = format_docs_with_metadata(docs)
            
            # Format chat history for memory (last 10 messages)
            chat_history_str = format_chat_history(request.chat_history, max_messages=10)

            # Generate response with memory (non-streaming from HuggingFace, but we chunk it for SSE)
            chain = RAG_PROMPT | model | StrOutputParser()
            full_response = chain.invoke({
                "context": context,
                "question": request.question,
                "chat_history": chat_history_str
            })

            # Stream response in chunks
            chunk_size = 50
            for i in range(0, len(full_response), chunk_size):
                chunk = full_response[i:i+chunk_size]
                yield f"data: {json.dumps({'chunk': chunk, 'done': False})}\n\n"
                await asyncio.sleep(0.02)  # Small delay for streaming effect

            # Send sources at the end
            sources = []
            for doc in docs[:5]:
                sources.append({
                    "doc_type": doc.metadata.get("doc_type", "unknown"),
                    "study": doc.metadata.get("study", "Unknown")
                })

            yield f"data: {json.dumps({'done': True, 'sources': sources})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

# Dashboard data endpoints
@app.get("/api/dashboard")
async def get_dashboard_data():
    """Get main dashboard KPIs and overview data."""
    try:
        with open("consolidated_data/dashboard_api.json", "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/studies")
async def get_studies():
    """Get list of all studies with summaries."""
    try:
        with open("consolidated_data/dashboard_api.json", "r") as f:
            data = json.load(f)
            return {"studies": data.get("studies", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/studies/{study_id}")
async def get_study_details(study_id: str):
    """Get detailed data for a specific study."""
    try:
        # Load study summary
        study_data = None
        with open("consolidated_data/rag_study_documents.jsonl", "r") as f:
            for line in f:
                doc = json.loads(line)
                if doc.get("study", "").lower() == study_id.lower():
                    study_data = doc
                    break

        if not study_data:
            raise HTTPException(status_code=404, detail=f"Study {study_id} not found")

        return study_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sites")
async def get_sites():
    """Get list of all sites with performance data."""
    try:
        sites = []
        with open("consolidated_data/rag_site_documents.jsonl", "r") as f:
            for line in f:
                doc = json.loads(line)
                sites.append({
                    "id": doc.get("id"),
                    "study": doc.get("study"),
                    "site": doc.get("site"),
                    "total_subjects": doc.get("total_subjects", 0),
                    "total_issues": doc.get("total_issues", 0)
                })
        return {"sites": sites}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ml-results")
async def get_ml_results():
    """Get ML model results, feature importance, and strategy details."""
    try:
        import pandas as pd

        # Load ML models summary
        with open("consolidated_data/ml_models_summary.json", "r") as f:
            models_summary = json.load(f)

        # Load feature importance
        feature_df = pd.read_csv("consolidated_data/ml_feature_importance.csv")
        feature_importance = feature_df.to_dict('records')

        return {
            "models_summary": models_summary,
            "feature_importance": feature_importance,
            "ml_strategy": {
                "title": "Clinical Trial Risk Prediction ML Pipeline",
                "description": "A comprehensive machine learning approach to predict subject risk levels, pending items, and total issues in clinical trials.",
                "tasks": [
                    {
                        "name": "Risk Classification",
                        "type": "Multi-class Classification",
                        "target": "risk_category (Low/Medium/High)",
                        "description": "Predicts the risk category of each subject based on data quality indicators, coding completion rates, and issue counts."
                    },
                    {
                        "name": "Pending Items Classification",
                        "type": "Binary Classification", 
                        "target": "has_pending_items (0/1)",
                        "description": "Identifies subjects with pending coding items (MedDRA or WHO-DD) that require attention."
                    },
                    {
                        "name": "Issues Regression",
                        "type": "Regression",
                        "target": "total_issues (continuous)",
                        "description": "Predicts the expected number of total issues for each subject to prioritize interventions."
                    }
                ],
                "models_used": [
                    {"name": "Random Forest", "type": "Ensemble", "description": "Bagging-based ensemble with 100 decision trees for robust predictions."},
                    {"name": "Gradient Boosting", "type": "Ensemble", "description": "Sequential boosting algorithm that builds models iteratively to minimize errors."},
                    {"name": "Logistic Regression", "type": "Linear", "description": "Interpretable linear model for classification with regularization."},
                    {"name": "Ridge Regression", "type": "Linear", "description": "L2-regularized linear regression for issues prediction."}
                ],
                "evaluation_metrics": [
                    {"metric": "Accuracy", "description": "Proportion of correct predictions"},
                    {"metric": "F1 Score", "description": "Harmonic mean of precision and recall"},
                    {"metric": "Cross-Validation", "description": "5-fold CV to assess model generalization"},
                    {"metric": "R² Score", "description": "Variance explained by regression models"},
                    {"metric": "MAE/RMSE", "description": "Error metrics for regression tasks"}
                ],
                "features_used": [
                    "open_issues_count", "safety_discrepancy_count", "missing_lab_count",
                    "safety_completion_rate", "meddra_coding_pending", "whodd_coding_pending",
                    "meddra_completion_rate", "whodd_completion_rate", "inactivated_forms_count",
                    "outstanding_visits_count", "total_days_outstanding"
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/subjects")
async def get_subjects():
    """Get all subjects with their status and predictions."""
    try:
        import pandas as pd
        import numpy as np

        df = pd.read_csv("consolidated_data/all_subjects_full.csv")
        total_count = len(df)

        # Sample 1000 subjects for performance
        if len(df) > 1000:
            df = df.sample(n=1000, random_state=42)

        # Replace NaN values with appropriate defaults to make JSON serializable
        df = df.fillna({
            'Subject': 'Unknown',
            'Study': 'Unknown',
            'Country': 'Unknown',
            'Site': 'Unknown',
            'Region': 'Unknown',
            'LatestVisit': 'Unknown',
            'SubjectStatus': 'Unknown',
            'risk_category': 'Low',
            'predicted_risk': 'Low',
            'total_issues': 0,
            'open_issues_count': 0,
            'safety_discrepancy_count': 0,
            'missing_pages_count': 0,
            'missing_lab_count': 0,
            'outstanding_visits_count': 0,
            'risk_probability': 0.0,
            'pending_probability': 0.0,
            'predicted_issues': 0.0,
            'has_pending_items': 0
        })
        
        # Replace any remaining NaN/inf values
        df = df.replace([np.inf, -np.inf], 0)
        df = df.fillna(0)

        subjects = df.to_dict('records')

        # Get status distribution (filter out 'Unknown')
        status_dist = df[df['SubjectStatus'] != 'Unknown']['SubjectStatus'].value_counts().to_dict() if 'SubjectStatus' in df.columns else {}
        risk_dist = df['risk_category'].value_counts().to_dict() if 'risk_category' in df.columns else {}
        study_dist = df['Study'].value_counts().to_dict() if 'Study' in df.columns else {}

        return {
            "subjects": subjects,
            "total_count": total_count,
            "sample_count": len(subjects),
            "status_distribution": status_dist,
            "risk_distribution": risk_dist,
            "study_distribution": study_dist
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

print("✅ FastAPI app created with endpoints:")
print("   GET  /                     - Health check")
print("   GET  /api/health           - API health status")
print("   POST /api/chat             - Chat with RAG (non-streaming)")
print("   POST /api/chat/stream      - Chat with RAG (streaming SSE)")
print("   GET  /api/dashboard        - Dashboard KPIs")
print("   GET  /api/studies          - List all studies")
print("   GET  /api/studies/{id}     - Study details")
print("   GET  /api/sites            - List all sites")
print("   GET  /api/subjects         - Subject records with status")
print("   GET  /api/ml-results       - ML model results & strategy")


# In[20]:


# ============================================================================
# CELL: Run the FastAPI Server
# ============================================================================
# Run this cell to start the backend server on port 8000
# The React frontend will connect to this server

import threading
import uvicorn

def run_server():
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

if __name__ == "__main__":
    print("🚀 FastAPI server starting on http://localhost:8000")
    print("📖 API docs available at http://localhost:8000/docs")
    # Run directly in main thread
    run_server()


# In[ ]:


# Test retrieval
try:
    if 'vector_store' in globals():
        print(f"Vector store type: {type(vector_store)}")
        docs = advanced_retrieve("test", k=1)
        print(f"Retrieved {len(docs)} docs")
    else:
        print("vector_store is NOT defined")
except Exception as e:
    print(f"Error: {e}")

