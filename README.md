# FinSight RAG 🔍

A production-grade **Multi-Agent RAG system** for financial document analysis, built on SEC 10-K filings and deployed on AWS.

## Agentic Architecture

<img width="747" height="640" alt="image" src="https://github.com/user-attachments/assets/133f058e-4dbc-498c-8815-640e4deff3a3" />

- **Supervisor Agent**: Classifies queries and routes to five independent specialist agents, each with their own retrieve → generate pipeline
- **Guardrails**: Validates query before routing; blocks off-topic questions and unrecognised ticker/year combinations with a clean user-facing message
- **Retrieval Agent**: BM25 (keyword) + vector (semantic) search merged with Reciprocal Rank Fusion.
- **Calculation Agent**: For financial ratio calculation queries with predefined formulae
- **Comparison Agent**: Handles cross-period comparison queries
- **Summarization Agent**: Full section summarization queries (chunks ranked by page)

## Ingestion Pipeline
<img width="785" height="538" alt="image" src="https://github.com/user-attachments/assets/ddcefd98-a4ce-4d72-afbb-08a2371dc8ce" />



## Additional Features

- **Structured answers** — every response includes citations with section and page number
- **Session Memory** - a read-before / write-after wrapper, reads formatted history in before the graph runs, then writes the new turn back after. 
- **RAGAS evaluation** — quantitative quality scoring with faithfulness, relevancy, precision and recall
- **LangSmith Tracing** — end-to-end observability with per-specialist subgraph traces, enabling node-level debugging of retrieval vs generation issues in production
- **Production AWS deployment** — ECS Fargate + OpenSearch + S3 + Secrets Manager


## AWS Infrastructure
```
ECR          — Private Docker image registry
ECS Fargate  — Serverless container runtime (1 vCPU, 2GB RAM)
OpenSearch   — Managed vector + keyword search (t3.small)
S3           — Document storage with versioning
Secrets Manager — Encrypted API key storage
CloudWatch   — Container logging and monitoring
```

## Quick Start

### Option 1 — Docker (recommended)
```bash
git clone https://github.com/YOUR_USERNAME/finsight-rag.git
cd finsight-rag
cp .env.example .env        # add your OPENAI_API_KEY
docker compose up -d
```

API at `http://localhost:8000` — Swagger UI at `http://localhost:8000/docs`

### Option 2 — Local
```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn api.main:app --reload --port 8000
```

## Usage

### 1. Ingest a document
```bash
curl -X POST http://localhost:8000/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "pdf_path": "data/raw/AAPL_10K_2025.pdf",
    "ticker": "AAPL",
    "year": 2025
  }'
```

### 2. Query the agent
```bash
# Retrieval query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the main risk factors for Apple?",
    "ticker": "AAPL",
    "year": 2025
  }'

# Calculation query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is Apples gross margin for 2025?",
    "ticker": "AAPL",
    "year": 2025
  }'

# Summary query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Summarize the MD&A section",
    "ticker": "AAPL",
    "year": 2025
  }'

# Cross-company comparison
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Compare Apple and Google risk factors",
    "ticker": "AAPL",
    "year": 2025
  }'
```

### 3. Run evaluation
```bash
python -m evaluation.run_eval
```

## Evaluation Results

| Metric | Score |
|---|---|
| Faithfulness | 0.723 |
| Answer Relevancy | 0.859 |
| Context Precision | 0.544 |
| Context Recall | 0.450 |

*Evaluated on 10 financial Q&A pairs from AAPL 2025 10-K*
