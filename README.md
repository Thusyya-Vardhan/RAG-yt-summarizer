# RAG-Powered YouTube Summarizer & Q&A System (CuePoint)

> **CuePoint** is an end-to-end full-stack AI system that transforms any YouTube video into an interactive, grounded knowledge base. Ask targeted questions with verbatim transcript citations and clickable timestamp links, or generate comprehensive structured summaries using hierarchical map-reduce.

🌐 **Live Demo**: [https://rag-yt-summarizer.vercel.app](https://rag-yt-summarizer.vercel.app/)  
⚡ **Backend API**: [https://rag-yt-summarizer.onrender.com/docs](https://rag-yt-summarizer.onrender.com/docs)  
📦 **Repository**: [https://github.com/Thusyya-Vardhan/RAG-yt-summarizer](https://github.com/Thusyya-Vardhan/RAG-yt-summarizer)

---

## ✨ Key Features

- **🎯 Temporal Grounding & Timestamp Citations**: Answers are anchored directly to transcript excerpts with clickable timestamp badges (`▶ 03:24`) that jump directly to that exact second in the video.
- **🧠 Intelligent Intent Routing**: Uses LLM function calling (`temperature=0`) to classify user intent, dynamically routing between targeted top-K vector search and whole-transcript map-reduce summarization.
- **⚡ Parallel Map-Reduce Pipeline**: Summarizes long-form videos by concurrently processing transcript batches via `asyncio.gather()`, cutting generation time by up to 80%.
- **💾 Automatic Summary Caching**: Stores verified video summaries in PostgreSQL so subsequent summary requests return instantly at zero LLM cost.
- **📐 Matryoshka Truncatable Embeddings**: Leverages Gemini embeddings truncated from 3072 to 768 dimensions, slashing vector storage and index search overhead by 75% with zero perceptible loss in recall.
- **🎨 Modern Zero-Dependency UI**: A sleek, dark-slate 2-screen interface built with vanilla CSS, smooth micro-animations, and clean lifecycle state management.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────┐        ┌─────────────────────────────┐        ┌─────────────────────────────┐
│    Frontend (React + Vite)  │        │   Backend (FastAPI Async)   │        │    Database & AI Services   │
│                             │        │                             │        │                             │
│  • Video Ingest Input       │ ─────► │  • Ingestion BackgroundTask │ ─────► │  • Gemini Embedding 001    │
│  • Single Unified Query Bar │        │  • Intent Router (Temp = 0) │        │  • PostgreSQL + pgvector    │
│  • Clickable Citations      │ ◄───── │  • Top-K Vector Retrieval   │ ◄───── │  • Gemini 2.5 Flash         │
│  • Summary View             │        │  • Parallel Map-Reduce      │        │  • Video Summary Cache      │
└─────────────────────────────┘        └─────────────────────────────┘        └─────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | Python 3.12, FastAPI, Uvicorn | High-throughput asynchronous REST API & background tasks |
| **Database** | PostgreSQL + pgvector, SQLAlchemy 2.0 | Relational video metadata & HNSW cosine distance vector indexing |
| **AI / LLMs** | Google GenAI SDK (`google-genai`) | Asymmetric embeddings, intent function calling, synthesis |
| **Transcript**| `youtube-transcript-api` | Direct caption extraction and timestamp synchronization |
| **Frontend** | React 19, Vite, Vanilla CSS | Single-page 2-screen utility UI with custom hooks and zero UI packages |
| **Deployment**| Vercel (Frontend), Render (Backend) | Globally distributed frontend and cloud API container |

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL instance with the `pgvector` extension enabled
- Google Gemini API Key ([Get one here](https://aistudio.google.com/))

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/Thusyya-Vardhan/RAG-yt-summarizer.git
cd RAG-yt-summarizer

# Activate virtual environment
python -m venv myenv
source myenv/bin/activate  # On Windows: myenv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cat <<EOF > .env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/cuepoint_db
GEMINI_API_KEY=your_gemini_api_key_here
EOF

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create frontend environment config (or point to live backend)
cat <<EOF > .env
VITE_API_URL=http://localhost:8000
EOF

# Start Vite dev server
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 📡 API Reference

### `POST /videos`
Ingests a YouTube URL.
```json
// Request Body
{ "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }

// Response (200 OK)
{
  "video_id": "dQw4w9WgXcQ",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "status": "pending",
  "chunk_count": 0
}
```

### `GET /videos/{video_id}`
Polls video ingestion and embedding status (`pending` → `processing` → `ready` / `failed`).

### `POST /videos/{video_id}/ask`
Accepts a natural language question or summary request.
```json
// Request Body
{ "query": "What is deja vu?" }

// Response (Grounded Q&A)
{
  "answer": "Deja vu is a neurological glitch where...",
  "sources": [
    { "start_sec": 134.0, "timestamp_url": "https://youtube.com/watch?v=...&t=134s" }
  ]
}
```
