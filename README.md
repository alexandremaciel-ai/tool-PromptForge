# ⚡ PromptForge

**Engenharia de Prompt por Especificação (Spec-Driven Development)**

PromptForge é uma aplicação de demonstração que transforma conhecimento bruto (documentos estruturados e não-estruturados) em artefatos operacionais finais, automatizando o pipeline completo de *Prompt Engineering*. 

Construída em **Next.js 14**, a aplicação ilustra na prática como ir do texto solto até um prompt final testável através de uma abordagem orientada a especificações rigorosas, alavancando arquiteturas profissionais de RAG local.

---

## ✨ Features Principais

- **Ingestão Profissional de Conhecimento:** Upload local de **PDFs, DOCX, PPTX, XLSX, TXT e Markdown**. Utiliza parsing contínuo e chunking automático.
- **RAG Inteligente (Supabase pgvector):** Arquitetura incorporada de vetores baseada em `pgvector`. Evita a injeção do "calhamaço" de contexto no LLM, processando Embeddings e recuperando via *Busca Semântica* apenas as 5 frações mais essenciais ao objetivo do usuário.
- **Embeddings Resilientes:** Geração em bath para os provedores MiniMax e OpenRouter de forma polimórfica, garantida por um controle de *Exponential Backoff* que suporta e mitiga gargalos ou tetos de "Rate Limit (RPM)" nas interações.
- **Spec-Driven Pipeline:** Um fluxo de trabalho de 6 etapas que não pula o planejamento:
  1. Conhecimento (Upload & Vector Storage)
  2. Objetivo Semântico
  3. Especificação Formal (JSON)
  4. Persona do Agente (JSON)
  5. Prompt Final (Markdown)
  6. Validação de Consistência
- **Provider Layer Abstraída:** Adaptadores para múltiplas APIs (OpenRouter, Anthropic, MiniMax) com **Fallback** ativo e abstrações JSON de resposta transparentes.
- **Controle Total de Estado:** Deleção em cascata integrada com Supabase para expurgar arquivos indesejados e zerar os fluxos, evitando vetores e chunks de conhecimento "órfãos".
- **Exportação Universal:** Exporte o "pacote" do prompt final validado em Markdown ou JSON visando deploy em produção.

---

## 🚀 Quickstarts

### Inicialização Total Integrada (Recomendado)

O PromptForge acompanha todo um ecossistema Docker para o RAG funcionar offline de forma indolor. Nós unimos Node.js e orquestração Docker num único comando:

**1. Clone e instale as dependências:**
\`\`\`bash
npm ci
\`\`\`

**2. Configure o ambiente:**
Copie as variáveis do exemplo. Você precisará de pelo menos a chave da MiniMax ou OpenRouter/Anthropic:
\`\`\`bash
cp .env.example .env
\`\`\`

**3. Suba o Backend Completo (Supabase DB + Next.js App):**
\`\`\`bash
npm run all
\`\`\`
*(Este comando levanta os contêineres Docker essenciais do Supabase em background, aguarda eles ficarem "saudáveis", executa localmente as migrations do db, e dispara o servidor Next.js em localhost:3000 amarrando os encerramentos com trap actions)*

**4. Derrubando a Aplicação:**
\`\`\`bash
npm run stop:all
\`\`\`
*(Fecha o Next.js e derruba os recursos massivos do Supabase para poupar memória na sua máquina).*

---

## 🛠️ Stack Tecnológica

- **Framework Front:** Next.js 14 (App Router)
- **Linguagem:** TypeScript 
- **DB e Vector Storage:** Supabase (PostgreSQL 15 + pgvector via Docker)
- **Estilização:** Tailwind CSS v4 + Integrações customizadas de CSS Globals
- **Parser de Arquivos:** `pdf-parse` e `officeparser` para processamento complexo
- **Geração de IA:** Integração simplificada via `fetch` local com tratativas customizadas para provedores incompatíveis entre si.

## 📂 Visão Geral da Arquitetura

- \`/supabase\`: Esquemas, Configurações em TOML, e Migrations do banco de dados (Tabelas e HNSW Indexes).
- \`/src/app\`: Páginas da aplicação e Serverless API Routes (Upload, Spec, Prompts).
- \`/src/components/ProviderPanel\`: Ferramenta visual flutuante com Test-Connection.
- \`/src/lib/db\`: Abstrações SQL do SDK do `@supabase/supabase-js`.
- \`/src/lib/embeddings\`: Orquestramento de vetores OpenRouter vs MiniMax com sistema de *Retry Control* inteligente.
- \`/src/lib/parser\`: Ingestão assíncrona dos arquivos cru e picote deles (chunking) via algoritmos textuais.

## 📋 Como Contribuir

Toda a conceptualização central está fundamentada na documentação arquitetural sob \`docs/prd/\`. Siga a filosofia **Spec-Driven Development** baseando suas interações com o Agente de Código lendo o \`CLAUDE.md\` incluso para absorver as constraints arquitetônicas.
