# 06 — Evals and Risks

## Risk categories

---

## 1. Technical risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| PDF without selectable text (image) | Medium | High | Detect and display clear message: "PDF is an image and contains no extractable text" |
| Model context limit exceeded | Medium | High | Truncate chunks with relevance prioritization, display warning |
| Provider API timeout | Medium | Medium | 30s timeout, 1 retry, automatic fallback |
| Corrupted PDF parsing | Low | Medium | Try-catch with friendly error message |
| Docker build fails due to dependency | Low | High | Version lock in package.json, stable node:20-alpine |

---

## 2. UX risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| User doesn't understand the value chain | Medium | High | Visual step indicator, clear labels, tooltips |
| Long generation time (>10s) | Medium | Medium | Progressive loading, skeleton, "Generating..." message |
| User doesn't configure provider before using | High | High | Persistent banner, generation blocked without provider |
| Confusing interface on mobile | Medium | Low | Desktop focus, basic responsive layout |
| Persona feels like a "boring form" | Medium | High | Rich visual design: sliders, chips, real-time preview |

---

## 3. Prompt quality risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Generated spec is too generic | Medium | High | Strong instructions in meta-prompt for specificity |
| Final prompt does not reflect persona | Medium | High | Automatic validation (P4) + visual checklist |
| Guardrails absent from final prompt | Low | High | Guardrails as required field in spec |
| Few-shot examples inconsistent with tone | Medium | Medium | Tone validation in examples via P4 |
| Prompt too long for the model | Low | Medium | Token count, warning when exceeding 80% |

---

## 4. Persona inconsistency risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| High formality + informal greeting | Medium | Medium | Cross-validation rule between fields |
| Prohibited vocabulary present in prompt | Low | High | Keyword check in final prompt |
| Empathetic tone defined but absent in examples | Medium | Medium | Empathetic pattern validation in examples |
| Generic persona ("be helpful and friendly") | High | High | Instructions in meta-prompt to avoid generalities |
| Vague limits ("don't do anything wrong") | Medium | Medium | Validation requiring specific limits |

---

## 5. Provider/runtime risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Invalid API key | High | High | Connection test in configuration, clear message |
| Provider rate limiting | Medium | Medium | Retry with exponential backoff, fallback |
| Provider outage | Low | High | Automatic fallback, visual indication |
| Model unavailable at provider | Low | Medium | Use adapter's default model |
| claude-subscription unavailable | High | Low | Optional mode, mandatory fallback |
| Provider response in unexpected format | Low | High | Defensive parsing with try-catch and error response |

---

## 6. Hallucination risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Spec contains fabricated information | Medium | High | Explicit instruction: "Use only the provided knowledge" |
| Persona suggests unsolicited behavior | Low | Medium | Validation against spec |
| Final prompt adds non-existent rules | Low | High | Cross-validation prompt ↔ spec |
| Few-shot examples invent scenarios | Medium | Medium | Instruction to base examples on knowledge |

---

## 7. Retrieval risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Chunks too large (loss of focus) | Medium | Medium | Chunking with 500–1000 token target size |
| Chunks too small (loss of context) | Medium | Medium | Minimum overlap between chunks |
| All knowledge sent without selection | High (by design) | Low | Acceptable in MVP; truncate if limit exceeded |
| Empty document after extraction | Low | High | Post-extraction validation, error message |

---

## Consolidated mitigation strategies

### Prompt quality mitigation
1. Meta-prompts with strong specificity instructions.
2. Automatic chain validation (P4 after P3).
3. Visual consistency checklist.
4. Required guardrails field in every spec.

### Persona consistency mitigation
1. Cross-validation between fields (e.g., formality × greeting).
2. Prohibited vocabulary keyword check.
3. Anti-examples generated automatically for comparison.
4. Consistency score visible to the user.

### Provider reliability mitigation
1. Automatic fallback between providers.
2. Connection test in configuration.
3. Timeout + retry + backoff.
4. Visual indication of active provider and state.

### UX mitigation
1. Step indicator always visible.
2. Loading states in all operations.
3. Empty states with guidance.
4. Error states with suggested action.
5. Configuration banner when provider is absent.

---

## Adversarial tests

| Test | Input | Expected result |
|---|---|---|
| Upload of image-only PDF | Scanned PDF without OCR | Message: "Could not extract text" |
| Upload of empty file | TXT with 0 bytes | Message: "Empty file" |
| Empty objective | Blank objective field | Blocked with guidance message |
| All API keys invalid | Wrong keys in all providers | Message: "No provider available" |
| Persona with contradictory fields | Formality 5 + greeting "Hey dude" | Inconsistency alert in validation |
| Prohibited vocabulary in prompt | Prohibited word appears | Detection and flag in validation |
| 50 MB file | Upload above limit | Blocked: "File exceeds 10 MB" |
| 10 simultaneous files | Upload above limit | Blocked: "Maximum 3 files" |
| Provider timeout | Simulate 60s timeout | Retry → fallback → clear error |
| Knowledge in unsupported language | Document in Mandarin | System generates spec (best effort) with warning |

---

## Demo approval criteria

| Criterion | Approval condition |
|---|---|
| Full flow | Upload → Export works without unhandled error |
| Time to value | First useful output in less than 60 seconds |
| Visual quality | Interface looks like a real product, not a prototype |
| Strong persona | Persona feature is perceived as central |
| Functional provider | At least 1 provider works end-to-end |
| Functional fallback | Fallback is executed when primary fails |
| Useful validation | Consistency checklist works and detects issues |
| Functional export | MD and JSON generated and downloadable |
| Functional Docker | `docker-compose up` starts everything without intervention |
| Recordable | Demo can be recorded in a short video without embarrassment |
