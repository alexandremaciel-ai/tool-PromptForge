# 06 — Evals and Risks

## Categorias de risco

---

## 1. Riscos técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| PDF sem texto selecionável (imagem) | Média | Alto | Detectar e exibir mensagem clara: "PDF é imagem, não contém texto extraível" |
| Limite de contexto do modelo excedido | Média | Alto | Truncar chunks com priorização por relevância, exibir aviso |
| Timeout de API do provider | Média | Médio | Timeout de 30s, retry 1x, fallback automático |
| Parsing de PDF corrompido | Baixa | Médio | Try-catch com mensagem de erro amigável |
| Docker build falha por dependência | Baixa | Alto | Lock de versões no package.json, node:20-alpine estável |

---

## 2. Riscos de UX

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Usuário não entende a cadeia de valor | Média | Alto | Step indicator visual, labels claros, tooltips |
| Tempo de geração longo (>10s) | Média | Médio | Loading progressivo, skeleton, mensagem "Gerando..." |
| Usuário não configura provider antes de usar | Alta | Alto | Banner persistente, bloqueio de geração sem provider |
| Interface confusa em mobile | Média | Baixo | Foco em desktop, layout responsivo básico |
| Persona parece "formulário chato" | Média | Alto | Design visual rico: sliders, chips, preview em tempo real |

---

## 3. Riscos de qualidade de prompt

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Spec gerada genérica demais | Média | Alto | Instruções fortes no meta-prompt para especificidade |
| Prompt final não reflete persona | Média | Alto | Validação automática (P4) + checklist visual |
| Guardrails ausentes no prompt final | Baixa | Alto | Guardrails como campo obrigatório na spec |
| Exemplos few-shot incoerentes com tom | Média | Médio | Validação de tom nos exemplos via P4 |
| Prompt muito longo para o modelo | Baixa | Médio | Contagem de tokens, aviso quando exceder 80% |

---

## 4. Riscos de inconsistência de persona

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Formalidade alta + saudação informal | Média | Médio | Regra de validação cruzada entre campos |
| Vocabulário proibido presente no prompt | Baixa | Alto | Verificação por keyword no prompt final |
| Tom empático definido mas ausente nos exemplos | Média | Médio | Validação de padrões empáticos nos exemplos |
| Persona genérica ("seja útil e amigável") | Alta | Alto | Instruções no meta-prompt para evitar generalidades |
| Limites vagos ("não faça nada errado") | Média | Médio | Validação que exige limites específicos |

---

## 5. Riscos de provider/runtime

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| API key inválida | Alta | Alto | Teste de conexão na configuração, mensagem clara |
| Rate limiting do provider | Média | Médio | Retry com backoff exponencial, fallback |
| Provider fora do ar | Baixa | Alto | Fallback automático, indicação visual |
| Modelo indisponível no provider | Baixa | Médio | Usar modelo padrão do adapter |
| claude-subscription indisponível | Alta | Baixo | Modo opcional, fallback obrigatório |
| Resposta do provider em formato inesperado | Baixa | Alto | Parsing defensivo com try-catch e resposta de erro |

---

## 6. Riscos de alucinação

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Spec contém informação inventada | Média | Alto | Instrução explícita: "Use apenas o conhecimento fornecido" |
| Persona sugere comportamento não solicitado | Baixa | Médio | Validação contra spec |
| Prompt final adiciona regras inexistentes | Baixa | Alto | Validação cruzada prompt ↔ spec |
| Exemplos few-shot inventam cenários | Média | Médio | Instrução para basear exemplos no conhecimento |

---

## 7. Riscos de retrieval

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Chunks muito grandes (perda de foco) | Média | Médio | Chunking com tamanho alvo 500-1000 tokens |
| Chunks muito pequenos (perda de contexto) | Média | Médio | Overlap mínimo entre chunks |
| Todo o conhecimento enviado sem seleção | Alta (por design) | Baixo | Aceitável no MVP; truncar se exceder limite |
| Documento vazio após extração | Baixa | Alto | Validação pós-extração, mensagem de erro |

---

## Estratégias de mitigação consolidadas

### Mitigação de prompt quality
1. Meta-prompts com instruções fortes de especificidade.
2. Validação automática em cadeia (P4 após P3).
3. Checklist visual de consistência.
4. Campo obrigatório de guardrails em toda spec.

### Mitigação de persona consistency
1. Validação cruzada entre campos (ex: formalidade × saudação).
2. Verificação de vocabulário proibido por keyword.
3. Anti-exemplos gerados automaticamente para comparação.
4. Score de consistência visível ao usuário.

### Mitigação de provider reliability
1. Fallback automático entre providers.
2. Teste de conexão na configuração.
3. Timeout + retry + backoff.
4. Indicação visual do provider ativo e estado.

### Mitigação de UX
1. Step indicator sempre visível.
2. Loading states em todas as operações.
3. Empty states com orientação.
4. Erro states com ação sugerida.
5. Banner de configuração quando provider ausente.

---

## Testes adversariais

| Teste | Input | Resultado esperado |
|---|---|---|
| Upload de PDF-imagem | PDF escaneado sem OCR | Mensagem: "Não foi possível extrair texto" |
| Upload de arquivo vazio | TXT com 0 bytes | Mensagem: "Arquivo vazio" |
| Objetivo vazio | Campo de objetivo em branco | Bloqueio com mensagem orientadora |
| Todas as API keys inválidas | Keys erradas em todos os providers | Mensagem: "Nenhum provider disponível" |
| Persona com campos contraditórios | Formalidade 5 + saudação "E aí mano" | Alerta de inconsistência na validação |
| Vocabulário proibido no prompt | Palavra proibida aparece | Detecção e flag na validação |
| Arquivo de 50 MB | Upload acima do limite | Bloqueio: "Arquivo excede 10 MB" |
| 10 arquivos simultâneos | Upload acima do limite | Bloqueio: "Máximo 3 arquivos" |
| Provider timeout | Simular timeout de 60s | Retry → fallback → erro claro |
| Conhecimento em idioma não suportado | Documento em mandarim | Sistema gera spec (best effort) com aviso |

---

## Critérios de aprovação da demo

| Critério | Condição de aprovação |
|---|---|
| Fluxo completo | Upload → Export funciona sem erro não tratado |
| Tempo de valor | Primeira saída útil em menos de 60 segundos |
| Qualidade visual | Interface parece produto real, não protótipo |
| Persona forte | Feature de persona é percebida como central |
| Provider funcional | Pelo menos 1 provider funciona end-to-end |
| Fallback funcional | Fallback é executado quando primário falha |
| Validação útil | Checklist de consistência funciona e detecta problemas |
| Export funcional | MD e JSON gerados e baixáveis |
| Docker funcional | `docker-compose up` sobe tudo sem intervenção |
| Gravável | Demo pode ser gravada em vídeo curto sem constrangimento |
