"""
ClinicalAI - Clinical Trial RAG Assistant
Hugging Face Spaces Deployment
"""

import os
import json
import gradio as gr
from collections import defaultdict
from langchain_huggingface import HuggingFaceEmbeddings, ChatHuggingFace, HuggingFaceEndpoint
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# ============================================================================
# Configuration
# ============================================================================

# Set HuggingFace token from environment or use default
# Load HuggingFace token from environment variable (set in Space secrets)
HF_TOKEN = os.environ.get("HUGGINGFACEHUB_API_TOKEN")
if not HF_TOKEN:
    print("⚠️ Warning: HUGGINGFACEHUB_API_TOKEN not set. Please add it to Space secrets.")

# ============================================================================
# Initialize LLM
# ============================================================================

print("🚀 Initializing LLM...")
llm = HuggingFaceEndpoint(
    repo_id="google/gemma-3-27b-it",
    temperature=0.4,
    max_new_tokens=2048,
)
model = ChatHuggingFace(llm=llm)
print("✅ LLM initialized: Gemma 27B")

# ============================================================================
# Initialize Embeddings
# ============================================================================

print("🔄 Loading embeddings model...")
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={'device': 'cpu'},
    encode_kwargs={
        'normalize_embeddings': True,
        'batch_size': 32
    }
)
print("✅ Embeddings initialized: all-MiniLM-L6-v2")

# ============================================================================
# Load Documents and Create Vector Store
# ============================================================================

def load_documents():
    """Load RAG documents from JSONL files."""
    documents = []
    doc_types = defaultdict(int)
    
    # Check if we have the combined documents file
    combined_path = "data/rag_combined_documents.jsonl"
    
    if os.path.exists(combined_path):
        print(f"📄 Loading from {combined_path}...")
        with open(combined_path, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    data = json.loads(line.strip())
                    doc = Document(
                        page_content=data.get('content', ''),
                        metadata=data.get('metadata', {})
                    )
                    documents.append(doc)
                    doc_type = data.get('metadata', {}).get('doc_type', 'unknown')
                    doc_types[doc_type] += 1
                except json.JSONDecodeError:
                    continue
    else:
        # Load from individual files
        data_files = [
            ("data/rag_subject_documents.jsonl", "subject"),
            ("data/rag_study_documents.jsonl", "study"),
            ("data/rag_site_documents.jsonl", "site"),
            ("data/rag_cra_reports.jsonl", "cra_report"),
        ]
        
        for file_path, doc_type in data_files:
            if os.path.exists(file_path):
                print(f"📄 Loading {file_path}...")
                with open(file_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        try:
                            data = json.loads(line.strip())
                            doc = Document(
                                page_content=data.get('content', ''),
                                metadata={**data.get('metadata', {}), 'doc_type': doc_type}
                            )
                            documents.append(doc)
                            doc_types[doc_type] += 1
                        except json.JSONDecodeError:
                            continue
    
    print(f"✅ Loaded {len(documents)} documents")
    for dtype, count in doc_types.items():
        print(f"   - {dtype}: {count}")
    
    return documents

def create_vector_store(documents):
    """Create or load FAISS vector store."""
    index_path = "faiss_index"
    
    # Try to load existing index
    if os.path.exists(f"{index_path}/index.faiss"):
        print("📂 Loading existing FAISS index...")
        try:
            vector_store = FAISS.load_local(
                index_path, 
                embeddings,
                allow_dangerous_deserialization=True
            )
            print("✅ FAISS index loaded")
            return vector_store
        except Exception as e:
            print(f"⚠️ Failed to load index: {e}")
    
    # Create new index
    if documents:
        print("🔧 Creating new FAISS index...")
        vector_store = FAISS.from_documents(documents, embeddings)
        
        # Save for future use
        os.makedirs(index_path, exist_ok=True)
        vector_store.save_local(index_path)
        print("✅ FAISS index created and saved")
        return vector_store
    
    return None

# Load documents and create vector store
print("\n" + "="*60)
print("Loading Clinical Trial RAG System")
print("="*60 + "\n")

documents = load_documents()
vector_store = create_vector_store(documents)

# ============================================================================
# RAG Chain Setup
# ============================================================================

RAG_PROMPT = """You are ClinicalAI, an expert assistant for clinical trial data analysis.
Your role is to help Clinical Research Associates (CRAs) and data managers understand trial data.

CONTEXT FROM RETRIEVED DOCUMENTS:
{context}

USER QUESTION: {question}

INSTRUCTIONS:
1. Answer based ONLY on the provided context
2. If the context doesn't contain relevant information, say so clearly
3. Use specific numbers and data points when available
4. Format your response with clear sections using markdown
5. Highlight critical risks and actionable items
6. Be concise but thorough

RESPONSE:"""

prompt = ChatPromptTemplate.from_template(RAG_PROMPT)
output_parser = StrOutputParser()

def retrieve_documents(question: str, k: int = 8):
    """Retrieve relevant documents using MMR."""
    if vector_store is None:
        return []
    
    try:
        docs = vector_store.max_marginal_relevance_search(
            question,
            k=k,
            fetch_k=k * 3,
            lambda_mult=0.7
        )
        return docs
    except Exception as e:
        print(f"Retrieval error: {e}")
        return []

def format_context(docs):
    """Format retrieved documents into context string."""
    if not docs:
        return "No relevant documents found."
    
    context_parts = []
    for i, doc in enumerate(docs, 1):
        metadata = doc.metadata
        doc_type = metadata.get('doc_type', 'unknown')
        study = metadata.get('study', 'N/A')
        
        context_parts.append(f"[Document {i} - {doc_type.upper()} - Study: {study}]")
        context_parts.append(doc.page_content[:1500])  # Limit content length
        context_parts.append("")
    
    return "\n".join(context_parts)

def chat(message: str, history: list) -> str:
    """Process chat message and return response."""
    if not message.strip():
        return "Please enter a question about clinical trial data."
    
    try:
        # Retrieve relevant documents
        docs = retrieve_documents(message, k=8)
        
        # Format context
        context = format_context(docs)
        
        # Generate response
        chain = prompt | model | output_parser
        response = chain.invoke({
            "context": context,
            "question": message
        })
        
        # Add source information
        if docs:
            sources = set()
            for doc in docs:
                study = doc.metadata.get('study', 'N/A')
                doc_type = doc.metadata.get('doc_type', 'unknown')
                sources.add(f"{study} ({doc_type})")
            
            source_text = "\n\n---\n📚 **Sources**: " + ", ".join(list(sources)[:5])
            response += source_text
        
        return response
        
    except Exception as e:
        return f"❌ Error processing your request: {str(e)}\n\nPlease try rephrasing your question."

# ============================================================================
# Gradio Interface
# ============================================================================

# Example questions
EXAMPLES = [
    "How many subjects are at critical risk across all studies?",
    "What are the main data quality issues in Study 16?",
    "Show me the safety discrepancy summary",
    "Which studies have the highest number of pending items?",
    "What is the risk distribution across all clinical trials?",
    "Give me an overview of Study 1's performance",
]

# Custom CSS for better styling
CUSTOM_CSS = """
.gradio-container {
    font-family: 'Inter', sans-serif !important;
}
.chat-message {
    padding: 1rem;
    border-radius: 0.5rem;
}
footer {
    display: none !important;
}
"""

# Create Gradio interface
with gr.Blocks(css=CUSTOM_CSS, title="ClinicalAI - Clinical Trial Assistant") as demo:
    gr.Markdown("""
    # 🏥 ClinicalAI - Clinical Trial RAG Assistant
    
    Ask questions about clinical trial data, subject risks, study performance, and data quality issues.
    """)
    
    chatbot = gr.ChatInterface(
        fn=chat,
        examples=EXAMPLES,
        title="",
        description="",
        retry_btn="🔄 Retry",
        undo_btn="↩️ Undo",
        clear_btn="🗑️ Clear",
    )
    
    gr.Markdown("""
    ---
    ### 💡 Tips
    - Ask about **risk levels**, **data quality**, or **specific studies**
    - Use study names like "Study 1", "Study 16", etc.
    - Ask for **summaries**, **comparisons**, or **specific metrics**
    
    ### 📊 Available Data
    - 24 clinical trial studies
    - ~29,000 subject records
    - Risk assessments, DQI scores, CRA reports
    """)

# Launch the app
if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False
    )
