# 07 — Implementation Plan

## Phase overview

```
Phase 0: Setup           → Project, Docker, environment variables
Phase 1: Provider Layer  → Provider abstraction, adapters, selection, fallback
Phase 2: Ingestion       → Upload, parsing, chunking
Phase 3: Spec Engine     → Prompt spec generation
Phase 4: Persona Engine  → Persona designer, suggestion, editing
Phase 5: Prompt Builder  → Final prompt generation
Phase 6: Validation      → Consistency checklist, score
Phase 7: Export          → Export in Markdown and JSON
Phase 8: Polish          → UX, loading states, animations, responsiveness
```

---

## Phase 0 — Project setup

**Objective**: Functional project with Next.js, Docker, and environment variables.

**Dependencies**: None  

**Deliverables**:
- Next.js 14 project initialized with TypeScript strict and Tailwind
- Functional Dockerfile and docker-compose.yml
- `.env.example` with all variables documented
- Global layout with header, provider badge (placeholder), and step indicator
- Main page with section structure (empty)

**Definition of done**:
- `docker-compose up` starts the application on port 3000.
- Main page loads with visual layout.
- Environment variables are validated at startup.

---

## Phase 1 — Provider Layer

**Objective**: Functional provider abstraction layer with at least 1 adapter.

**Dependencies**: Phase 0  

**Deliverables**:
- `ProviderAdapter` interface defined
- OpenRouter adapter implemented
- Anthropic adapter implemented
- MiniMax adapter implemented (structure)
- claude-subscription adapter implemented (structure, optional)
- Provider registry and selector with fallback
- API route `/api/provider/config` to save/read configuration
- API route `/api/provider/test` to test connection
- Functional `ProviderPanel` component on the frontend
- Active provider badge in the header

**Definition of done**:
- At least 1 provider can be configured and tested.
- Fallback works between configured providers.
- Active provider is displayed in the interface.
- Secrets never appear on the frontend.

---

## Phase 2 — File ingestion

**Objective**: Upload, extraction, and chunking of PDF, TXT, and MD.

**Dependencies**: Phase 0  

**Deliverables**:
- `FileDropZone` component with drag & drop
- `FileCard` component with metadata
- API route `/api/upload` to receive and process files
- PDF parser (`pdf-parse`)
- TXT and MD parser (direct read)
- Text chunker
- `ChunkPreview` component to display excerpts
- Type and size validation

**Definition of done**:
- Upload of PDF, TXT, and MD works.
- Text is extracted and chunks are displayed.
- File errors are handled with clear messages.

---

## Phase 3 — Spec Engine

**Objective**: Generate prompt spec from knowledge.

**Dependencies**: Phase 1 + Phase 2  

**Deliverables**:
- `spec-generator` meta-prompt implemented
- API route `/api/generate/spec`
- `ObjectiveInput` component
- `SpecCard` component with generated spec visualization
- `SpecEditor` component for editing
- Loading state with skeleton

**Definition of done**:
- Spec is generated from knowledge + objective.
- Spec is editable.
- Active provider is indicated during generation.
- Fallback works if primary provider fails.

---

## Phase 4 — Persona Engine

**Objective**: Full persona creation and editing feature.

**Dependencies**: Phase 3  

**Deliverables**:
- `persona-generator` meta-prompt implemented
- API route `/api/generate/persona`
- `PersonaDesigner` component with all fields
- `ToneSlider` component (formality, empathy, objectivity sliders)
- `VocabularyChips` component (preferred and prohibited vocabulary)
- `ExamplePreview` component (good and bad examples)
- Automatic persona suggestion
- Manual editing of all fields

**Definition of done**:
- Persona is automatically suggested based on knowledge and spec.
- All fields are editable.
- Examples and anti-examples are generated.
- Interface is visually impactful (sliders, chips, preview).

---

## Phase 5 — Prompt Builder

**Objective**: Generate final prompt combining spec + persona + knowledge.

**Dependencies**: Phase 3 + Phase 4  

**Deliverables**:
- `prompt-builder` meta-prompt implemented
- API route `/api/generate/prompt`
- `PromptOutput` component with syntax highlighting
- `PromptActions` component (copy, regenerate, edit)
- References to source knowledge
- Loading state

**Definition of done**:
- Final prompt is generated and displayed with professional formatting.
- Prompt reflects spec and persona.
- Copy and regenerate actions work.

---

## Phase 6 — Validation

**Objective**: Validate consistency between spec, persona, and prompt.

**Dependencies**: Phase 5  

**Deliverables**:
- `consistency-validator` meta-prompt implemented
- API route `/api/generate/validate`
- `ValidationCard` component with visual checklist
- `ScoreIndicator` component
- Improvement suggestions

**Definition of done**:
- Validation runs automatically after prompt generation.
- Checklist displays ✅/❌ for each criterion.
- Overall score is calculated and displayed.
- Improvement suggestions are presented.

---

## Phase 7 — Export

**Objective**: Export all artifacts in Markdown and JSON.

**Dependencies**: Phase 5 + Phase 6  

**Deliverables**:
- API route `/api/export`
- `ExportButtons` component
- Consolidated Markdown file generation
- Structured JSON file generation
- Automatic download

**Definition of done**:
- MD export works and generates a readable file.
- JSON export works and generates a complete structure.
- All artifacts are included (spec, persona, prompt, validation).

---

## Phase 8 — Polish

**Objective**: Polish UX, animations, responsiveness, and overall experience.

**Dependencies**: All previous phases  

**Deliverables**:
- Loading states with skeleton and animations in all steps
- Smooth transitions between states
- Empty states with guidance
- Error states with suggested actions
- Basic responsiveness (desktop-first, tablet acceptable)
- Dark mode or refined visual theme
- Micro-animations on interactions

**Definition of done**:
- The demo looks like a real product.
- No loading/error/empty state is left untreated.
- The experience is fluid and recordable on video.

---

## Execution order

```
Phase 0 ────→ Phase 1 ────→ Phase 3 ────→ Phase 5 ────→ Phase 7
                ↓              ↓              ↓
             Phase 2        Phase 4        Phase 6 ────→ Phase 8
```

Phases 1 and 2 can be partially parallel (provider layer and ingestion are independent).
Phase 3 depends on 1+2. Phase 4 depends on 3. Phase 5 depends on 3+4.
Phase 8 is cross-cutting, but only makes sense at the end.

---

## Effort estimate

| Phase | Estimated effort |
|---|---|
| Phase 0 — Setup | Small |
| Phase 1 — Provider Layer | Medium |
| Phase 2 — Ingestion | Medium |
| Phase 3 — Spec Engine | Medium |
| Phase 4 — Persona Engine | Large (main feature) |
| Phase 5 — Prompt Builder | Medium |
| Phase 6 — Validation | Medium |
| Phase 7 — Export | Small |
| Phase 8 — Polish | Medium |
