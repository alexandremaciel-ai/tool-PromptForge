# ⚡ PromptForge

**Spec-Driven Prompt Engineering**

PromptForge is a demo application that transforms raw knowledge (structured and unstructured documents) into final operational artifacts, automating the complete *Prompt Engineering* pipeline.

Built on **Next.js 14**, the application demonstrates in practice how to go from loose text to a testable final prompt through a rigorous spec-oriented approach, leveraging professional local RAG architectures.

---

## ✨ Key Features

- **Professional Knowledge Ingestion:** Local upload of **PDFs, DOCX, PPTX, XLSX, TXT, and Markdown**. Uses continuous parsing and automatic chunking.
- **Intelligent RAG (Supabase pgvector):** Embedded vector architecture based on `pgvector`. Avoids injecting a "wall of context" into the LLM by processing Embeddings and retrieving via *Semantic Search* only the 5 most relevant chunks to the user's objective.
- **Resilient Embeddings:** Polymorphic batch generation for MiniMax and OpenRouter providers, guaranteed by an *Exponential Backoff* control that supports and mitigates bottlenecks or Rate Limit (RPM) ceilings during interactions.
- **Spec-Driven Pipeline:** A 6-step workflow that doesn't skip planning:
  1. Knowledge (Upload & Vector Storage)
  2. Semantic Objective
  3. Formal Specification (JSON)
  4. Agent Persona (JSON)
  5. Final Prompt (Markdown)
  6. Consistency Validation
- **Abstracted Provider Layer:** Adapters for multiple APIs (OpenRouter, Anthropic, MiniMax) with active **Fallback** and transparent JSON response abstractions.
- **Full State Control:** Cascade deletion integrated with Supabase to purge unwanted files and reset flows, preventing orphaned knowledge vectors and chunks.
- **Universal Export:** Export the validated final prompt "package" in Markdown or JSON for production deployment.

---

## 🚀 Quickstarts

### Full Integrated Initialization (Recommended)

PromptForge ships with a complete Docker ecosystem for painless offline RAG. We combine Node.js and Docker orchestration into a single command:

**1. Clone and install dependencies:**
```bash
npm ci
```

**2. Configure the environment:**
Copy the example variables. You'll need at least a MiniMax or OpenRouter/Anthropic key:
```bash
cp .env.example .env
```

**3. Start the Full Backend (Supabase DB + Next.js App):**
```bash
npm run all
```
*(This command spins up the essential Supabase Docker containers in the background, waits for them to become "healthy", runs db migrations locally, and starts the Next.js server at localhost:3000, binding shutdowns with trap actions)*

**4. Tearing Down the Application:**
```bash
npm run stop:all
```
*(Closes Next.js and brings down the heavy Supabase resources to save memory on your machine).*

---

## 🛠️ Tech Stack

- **Frontend Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **DB and Vector Storage:** Supabase (PostgreSQL 15 + pgvector via Docker)
- **Styling:** Tailwind CSS v4 + Custom CSS Globals integrations
- **File Parsers:** `pdf-parse` and `officeparser` for complex processing
- **AI Generation:** Simplified integration via local `fetch` with custom handling for mutually incompatible providers.

## 📂 Architecture Overview

- `/supabase`: Schemas, TOML Configurations, and database Migrations (Tables and HNSW Indexes).
- `/src/app`: Application pages and Serverless API Routes (Upload, Spec, Prompts).
- `/src/components/ProviderPanel`: Floating visual tool with Test-Connection.
- `/src/lib/db`: SQL abstractions from the `@supabase/supabase-js` SDK.
- `/src/lib/embeddings`: Vector orchestration for OpenRouter vs MiniMax with intelligent *Retry Control* system.
- `/src/lib/parser`: Async ingestion of raw files and chunking via textual algorithms.

## 📋 How to Contribute

All core conceptualization is grounded in the architectural documentation under `docs/prd/`. Follow the **Spec-Driven Development** philosophy by basing your interactions with the Code Agent on reading the included `CLAUDE.md` to absorb the architectural constraints.
