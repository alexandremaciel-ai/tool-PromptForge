# 08 — Tasks

## Conventions
- Each task starts with a verb.
- Format: `T{phase}{number} — {title}`
- Status: `[ ]` pending, `[/]` in progress, `[x]` completed.

---

## Phase 0 — Setup

### T01 — Initialize Next.js project with TypeScript and Tailwind
- **Description**: Create Next.js 14 project with App Router, strict TypeScript, and Tailwind CSS. Configure folder structure as per `03-architecture.md`.
- **Affected files**: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.js`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- **Dependencies**: None
- **Completion criterion**: `npm run dev` runs without errors and displays a styled blank page.
- `[ ]`

### T02 — Create Dockerfile and docker-compose.yml
- **Description**: Create a multi-stage Dockerfile and docker-compose.yml for building and running the application on port 3000.
- **Affected files**: `Dockerfile`, `docker-compose.yml`, `.dockerignore`
- **Dependencies**: T01
- **Completion criterion**: `docker-compose up --build` starts the application on port 3000.
- `[ ]`

### T03 — Create .env.example and variable validation
- **Description**: Create `.env.example` with all variables documented. Create validation utility that checks variables at startup and displays clear messages.
- **Affected files**: `.env.example`, `.gitignore`, `src/lib/utils/config.ts`
- **Dependencies**: T01
- **Completion criterion**: Application starts without error even without variables (degraded mode). Clear messages appear in the log.
- `[ ]`

### T04 — Create global layout with Header and StepIndicator
- **Description**: Implement global layout with header (logo, provider badge placeholder), visual step indicator showing the flow stages, and main page structure with empty sections.
- **Affected files**: `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/layout/Header.tsx`, `src/components/layout/StepIndicator.tsx`, `src/components/layout/ProviderBadge.tsx`
- **Dependencies**: T01
- **Completion criterion**: Main page displays header with visual step indicator. Dark or professional theme applied.
- `[ ]`

---

## Phase 1 — Provider Layer

### T05 — Define ProviderAdapter types and interface
- **Description**: Create TypeScript types for the common provider interface: `ProviderAdapter`, `GenerateParams`, `GenerateResult`, `ProviderConfig`.
- **Affected files**: `src/lib/providers/types.ts`
- **Dependencies**: T01
- **Completion criterion**: Types compile without error. Interface is self-explanatory.
- `[ ]`

### T06 — Implement OpenRouter adapter
- **Description**: Create adapter for OpenRouter following the `ProviderAdapter` interface. Implement `generate()`, `isAvailable()`, `listModels()`, `getDefaultModel()`.
- **Affected files**: `src/lib/providers/openrouter.ts`
- **Dependencies**: T05
- **Completion criterion**: Adapter works with a valid API key. Returns generated text.
- `[ ]`

### T07 — Implement Anthropic adapter
- **Description**: Create adapter for the Anthropic Messages API following the `ProviderAdapter` interface.
- **Affected files**: `src/lib/providers/anthropic.ts`
- **Dependencies**: T05
- **Completion criterion**: Adapter works with a valid API key.
- `[ ]`

### T08 — Implement MiniMax adapter (structure)
- **Description**: Create adapter for MiniMax following the `ProviderAdapter` interface. Implement base structure.
- **Affected files**: `src/lib/providers/minimax.ts`
- **Dependencies**: T05
- **Completion criterion**: Adapter compiles and has a functional structure.
- `[ ]`

### T09 — Implement claude-subscription adapter (structure)
- **Description**: Create adapter for claude-subscription mode. Implement as optional with availability detection.
- **Affected files**: `src/lib/providers/claude-subscription.ts`
- **Dependencies**: T05
- **Completion criterion**: Adapter returns "unavailable" when the environment doesn't support it. Compiles without error.
- `[ ]`

### T10 — Implement registry and selector with fallback
- **Description**: Create provider registry, selector that respects user preference, and automatic fallback logic.
- **Affected files**: `src/lib/providers/registry.ts`, `src/lib/providers/selector.ts`
- **Dependencies**: T06, T07, T08, T09
- **Completion criterion**: Selector tries preferred provider, falls back if it fails, returns clear error if none available.
- `[ ]`

### T11 — Create provider API routes (config and test)
- **Description**: Create `/api/provider/config` (GET/POST) and `/api/provider/test` (POST) for provider configuration and testing.
- **Affected files**: `src/app/api/provider/config/route.ts`, `src/app/api/provider/test/route.ts`
- **Dependencies**: T10
- **Completion criterion**: API accepts configuration, tests connection, and returns result.
- `[ ]`

### T12 — Create ProviderPanel component
- **Description**: Implement side panel/modal for provider configuration with cards per provider, API key field (masked), test button, and status indicator.
- **Affected files**: `src/components/provider/ProviderPanel.tsx`, `src/components/provider/ProviderCard.tsx`, `src/components/provider/ApiKeyInput.tsx`
- **Dependencies**: T11, T04
- **Completion criterion**: Panel opens via gear icon in header. Providers are listed with status. API key can be entered and tested.
- `[ ]`

### T13 — Implement functional ProviderBadge
- **Description**: Connect `ProviderBadge` in the header to the real active provider state. Display provider name, visual fallback indicator.
- **Affected files**: `src/components/layout/ProviderBadge.tsx`, `src/hooks/useProvider.ts`
- **Dependencies**: T12
- **Completion criterion**: Badge shows active provider in real time. Changes when provider is altered.
- `[ ]`

---

## Phase 2 — File ingestion

### T14 — Create PDF, TXT, and MD parsers
- **Description**: Implement text extraction functions for each format. PDF via `pdf-parse`, TXT and MD via direct reading. Include text cleanup.
- **Affected files**: `src/lib/parser/pdf.ts`, `src/lib/parser/text.ts`, `src/lib/parser/markdown.ts`
- **Dependencies**: T01
- **Completion criterion**: Each parser correctly extracts text from a test file.
- `[ ]`

### T15 — Implement text chunker
- **Description**: Create paragraph-based chunking function with a 500–1000 token target size and minimum overlap. Return array of chunks with metadata (position, size).
- **Affected files**: `src/lib/parser/chunker.ts`
- **Dependencies**: T14
- **Completion criterion**: Long text is segmented into chunks within the size range.
- `[ ]`

### T16 — Create upload API route
- **Description**: Implement `/api/upload` that receives FormData with files, validates type and size, extracts text, and returns chunks.
- **Affected files**: `src/app/api/upload/route.ts`
- **Dependencies**: T14, T15
- **Completion criterion**: API accepts PDF/TXT/MD, rejects other formats, returns chunks.
- `[ ]`

### T17 — Create FileDropZone component
- **Description**: Implement drag & drop area with file selection button. Attractive visuals, hover/active states, type validation.
- **Affected files**: `src/components/upload/FileDropZone.tsx`
- **Dependencies**: T04
- **Completion criterion**: Drag & drop works. Files are sent to the backend.
- `[ ]`

### T18 — Create FileCard and ChunkPreview components
- **Description**: Implement file card (name, type, size, status) and scrollable preview of extracted chunks.
- **Affected files**: `src/components/upload/FileCard.tsx`, `src/components/upload/ChunkPreview.tsx`
- **Dependencies**: T16, T17
- **Completion criterion**: After upload, card shows file info and chunks are viewable.
- `[ ]`

---

## Phase 3 — Spec Engine

### T19 — Implement spec-generator meta-prompt
- **Description**: Create the prompt template for spec generation. Define instructions, output format (JSON), guardrails.
- **Affected files**: `src/lib/prompts/spec-generator.ts`
- **Dependencies**: T05
- **Completion criterion**: Template produces a structured spec when fed with knowledge and objective.
- `[ ]`

### T20 — Create API route /api/generate/spec
- **Description**: Implement endpoint that receives chunks + objective, calls provider via selector, returns generated spec.
- **Affected files**: `src/app/api/generate/spec/route.ts`
- **Dependencies**: T10, T19
- **Completion criterion**: API returns spec in JSON. Fallback works.
- `[ ]`

### T21 — Create ObjectiveInput and SpecCard components
- **Description**: Implement objective field with automatic suggestion. Implement spec card with structured visualization and edit button.
- **Affected files**: `src/components/objective/ObjectiveInput.tsx`, `src/components/spec/SpecCard.tsx`, `src/components/spec/SpecEditor.tsx`
- **Dependencies**: T18, T20
- **Completion criterion**: Objective can be defined. Spec is generated and displayed with loading state.
- `[ ]`

---

## Phase 4 — Persona Engine

### T22 — Define persona types
- **Description**: Create TypeScript types for PersonaSpec with all fields defined in `04-agent-persona-spec.md`.
- **Affected files**: `src/lib/types/persona.ts`
- **Dependencies**: T01
- **Completion criterion**: Types compile and cover all spec fields.
- `[ ]`

### T23 — Implement persona-generator meta-prompt
- **Description**: Create the prompt template for persona suggestion. Instructs the model to generate a concrete, non-generic persona with examples and anti-examples.
- **Affected files**: `src/lib/prompts/persona-generator.ts`
- **Dependencies**: T19, T22
- **Completion criterion**: Template produces a structured persona coherent with the domain.
- `[ ]`

### T24 — Create API route /api/generate/persona
- **Description**: Implement endpoint that receives spec + chunks, calls provider, returns suggested persona.
- **Affected files**: `src/app/api/generate/persona/route.ts`
- **Dependencies**: T10, T23
- **Completion criterion**: API returns persona in JSON. Persona is coherent with spec.
- `[ ]`

### T25 — Create PersonaDesigner component
- **Description**: Implement visual persona creation panel with all interactive fields: sliders (formality, empathy, objectivity), chips (vocabulary), selects (main tone, posture), textarea (limits), examples preview.
- **Affected files**: `src/components/persona/PersonaDesigner.tsx`, `src/components/persona/ToneSlider.tsx`, `src/components/persona/VocabularyChips.tsx`, `src/components/persona/ExamplePreview.tsx`
- **Dependencies**: T22, T24
- **Completion criterion**: All fields are editable. Suggested persona populates fields automatically. Interface is visually impactful.
- `[ ]`

---

## Phase 5 — Prompt Builder

### T26 — Implement prompt-builder meta-prompt
- **Description**: Create prompt template that combines spec + persona + knowledge to generate an operational final prompt.
- **Affected files**: `src/lib/prompts/prompt-builder.ts`
- **Dependencies**: T19, T23
- **Completion criterion**: Template produces a structured final prompt with all sections.
- `[ ]`

### T27 — Create API route /api/generate/prompt
- **Description**: Implement endpoint that receives spec + persona + chunks, calls provider, returns final prompt.
- **Affected files**: `src/app/api/generate/prompt/route.ts`
- **Dependencies**: T10, T26
- **Completion criterion**: API returns final prompt in Markdown.
- `[ ]`

### T28 — Create PromptOutput and PromptActions components
- **Description**: Implement final prompt visualization with syntax highlighting (Markdown). Buttons to copy, regenerate, and edit.
- **Affected files**: `src/components/prompt/PromptOutput.tsx`, `src/components/prompt/PromptActions.tsx`
- **Dependencies**: T27
- **Completion criterion**: Final prompt is displayed with professional formatting. Copy works.
- `[ ]`

---

## Phase 6 — Validation

### T29 — Implement consistency-validator meta-prompt
- **Description**: Create prompt template that validates consistency between spec, persona, and final prompt. Returns checklist and score.
- **Affected files**: `src/lib/prompts/validator.ts`
- **Dependencies**: T26
- **Completion criterion**: Template identifies inconsistencies and suggests improvements.
- `[ ]`

### T30 — Create API route /api/generate/validate
- **Description**: Implement endpoint that receives spec + persona + final prompt, calls provider, returns validation.
- **Affected files**: `src/app/api/generate/validate/route.ts`
- **Dependencies**: T10, T29
- **Completion criterion**: API returns checklist with ✅/❌ and score.
- `[ ]`

### T31 — Create ValidationCard and ScoreIndicator components
- **Description**: Implement validation card with visual checklist, circular score, and improvement suggestions.
- **Affected files**: `src/components/validation/ValidationCard.tsx`, `src/components/validation/ScoreIndicator.tsx`
- **Dependencies**: T30
- **Completion criterion**: Validation is displayed with clear visual indicators.
- `[ ]`

---

## Phase 7 — Export

### T32 — Implement export logic
- **Description**: Create functions that consolidate spec, persona, prompt, and validation into Markdown and JSON for download.
- **Affected files**: `src/lib/utils/export.ts`, `src/app/api/export/route.ts`
- **Dependencies**: T28, T31
- **Completion criterion**: Markdown and JSON are correctly generated with all artifacts.
- `[ ]`

### T33 — Create ExportButtons component
- **Description**: Implement export buttons with icons, automatic download, success feedback.
- **Affected files**: `src/components/export/ExportButtons.tsx`
- **Dependencies**: T32
- **Completion criterion**: Download works in MD and JSON.
- `[ ]`

---

## Phase 8 — Polish

### T34 — Implement loading states and skeletons
- **Description**: Add skeleton loading in all generation steps. Pulse animations. Progress messages.
- **Affected files**: All generation components
- **Dependencies**: Phases 3–7
- **Completion criterion**: No generation occurs without visual feedback.
- `[ ]`

### T35 — Implement empty states and error states
- **Description**: Add guidance messages in empty states and suggested actions in error states throughout the application.
- **Affected files**: All components
- **Dependencies**: Phases 3–7
- **Completion criterion**: No empty or error state is left without visual treatment.
- `[ ]`

### T36 — Implement visual theme and micro-animations
- **Description**: Refine dark/professional theme. Add smooth transitions, hover effects, micro-animations on interactions.
- **Affected files**: `src/app/globals.css`, various components
- **Dependencies**: T34, T35
- **Completion criterion**: Interface looks like a real product. Interactions are fluid.
- `[ ]`

### T37 — Test complete end-to-end flow
- **Description**: Run the full flow with a real file: upload → spec → persona → prompt → validation → export. Verify each step.
- **Affected files**: None (test)
- **Dependencies**: All previous tasks
- **Completion criterion**: Full flow works without unhandled error. Demo is recordable.
- `[ ]`

---

## Ideal execution order

```
T01 → T02, T03, T04 (parallel) → T05 → T06, T07, T08, T09 (parallel)
→ T10 → T11 → T12 → T13 → T14, T15 (parallel) → T16 → T17 → T18
→ T19 → T20 → T21 → T22 → T23 → T24 → T25 → T26 → T27 → T28
→ T29 → T30 → T31 → T32 → T33 → T34 → T35 → T36 → T37
```
