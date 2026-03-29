# 02 — User Flow

## Visão geral do fluxo

```
[Upload] → [Extração] → [Spec] → [Persona] → [Prompt] → [Validação] → [Export]
                                                   ↑
                                          [Provider Config]
```

O fluxo é linear com uma camada lateral de configuração de provider acessível a qualquer momento.

---

## Fluxo principal ponta a ponta

### Etapa 1 — Landing e configuração inicial
**Tela**: Tela principal (single-page application com seções progressivas)

1. Usuário abre a aplicação.
2. Sistema verifica se há providers configurados.
3. Se nenhum provider configurado → exibe banner de configuração com CTA claro.
4. Se provider configurado → exibe indicador de provider ativo no header.
5. Usuário pode abrir painel lateral de configuração de provider a qualquer momento.

**Entrada**: Nenhuma  
**Saída**: Estado de provider resolvido  

---

### Etapa 2 — Upload de conhecimento
**Seção**: Área de upload (drag & drop + botão de seleção)

1. Usuário arrasta ou seleciona arquivos (PDF, TXT, MD).
2. Sistema valida tipo e tamanho (máx. 10 MB por arquivo, máx. 3 arquivos).
3. Sistema exibe card do arquivo: nome, tipo, tamanho, ícone.
4. Sistema inicia extração de texto e mostra progress bar.
5. Após extração, sistema exibe preview dos trechos extraídos com contagem de chunks.

**Entrada**: Arquivo(s)  
**Saída**: Texto extraído + metadata + chunks  

**Erro**: Arquivo inválido → mensagem: "Formato não suportado. Use PDF, TXT ou MD."  
**Erro**: Arquivo muito grande → mensagem: "Arquivo excede o limite de 10 MB."  
**Erro**: Falha de extração → mensagem: "Não foi possível extrair texto deste arquivo. Verifique se o PDF contém texto selecionável."  

**Empty state**: "Arraste um arquivo ou clique para selecionar. Formatos aceitos: PDF, TXT, Markdown."  

---

### Etapa 3 — Definição de objetivo
**Seção**: Campo de texto com label claro

1. Sistema sugere objetivo com base no conteúdo extraído.
2. Usuário pode aceitar a sugestão ou editar livremente.
3. Campo obrigatório para avançar.

**Entrada**: Texto livre descrevendo o objetivo do prompt  
**Saída**: Objetivo definido  

**Exemplo de sugestão**: "Criar um agente de suporte que responda dúvidas frequentes com base na documentação enviada."

---

### Etapa 4 — Geração de spec ✨ (momento wow #1)
**Seção**: Card de spec gerada com loading progressivo

1. Usuário clica "Gerar Spec".
2. Sistema envia conhecimento + objetivo ao provider ativo.
3. Loading: skeleton com animação pulse enquanto gera.
4. Sistema exibe spec estruturada:
   - Objetivo do prompt
   - Inputs esperados
   - Contexto obrigatório
   - Restrições
   - Guardrails
   - Formato de saída esperado
5. Usuário pode editar qualquer campo da spec.
6. Indicador de provider ativo visível durante a geração.

**Entrada**: Conhecimento extraído + objetivo  
**Saída**: Spec de prompt editável  

**Loading**: Skeleton com seções aparecendo progressivamente.  
**Erro de provider**: "Não foi possível conectar ao provider [nome]. Tentando fallback..." → tenta provider alternativo → se falhar: "Nenhum provider disponível. Verifique sua configuração."  

---

### Etapa 5 — Criação de persona ✨ (momento wow #2)
**Seção**: Painel visual de persona com campos interativos

1. Sistema sugere persona com base no conhecimento e na spec.
2. Usuário vê e edita:
   - Nome do agente
   - Papel
   - Tom principal (seletor visual: Formal ↔ Casual)
   - Personalidade (tags selecionáveis)
   - Formalidade (slider 1-5)
   - Empatia (slider 1-5)
   - Objetividade (slider 1-5)
   - Vocabulário preferido (chips editáveis)
   - Vocabulário proibido (chips editáveis)
   - Postura diante de incerteza (dropdown)
   - Limites comportamentais (lista editável)
3. Seção de exemplos: sistema gera exemplos de respostas boas e ruins com base na persona.
4. Usuário pode editar exemplos.

**Entrada**: Spec + conhecimento  
**Saída**: Persona completa especificada  

**Empty state**: "Defina a identidade do seu agente. O sistema vai sugerir uma persona com base no conhecimento e na spec."  

---

### Etapa 6 — Geração de prompt final ✨ (momento wow #3)
**Seção**: Card de prompt gerado com syntax highlighting

1. Usuário clica "Gerar Prompt Final".
2. Sistema combina spec + persona + conhecimento.
3. Loading: skeleton com animação.
4. Sistema exibe prompt final formatado:
   - System prompt completo
   - Guardrails integrados
   - Exemplos few-shot derivados da persona
   - Referências ao conhecimento-fonte
5. Indicador de provider ativo.
6. Usuário pode copiar, editar ou regenerar.

**Entrada**: Spec + persona + conhecimento  
**Saída**: Prompt final pronto para uso  

---

### Etapa 7 — Validação
**Seção**: Card de validação com indicadores visuais

1. Sistema executa checklist de consistência automaticamente:
   - Persona refletida no prompt? ✅/❌
   - Guardrails presentes? ✅/❌
   - Formato de saída definido? ✅/❌
   - Exemplos coerentes com tom? ✅/❌
   - Limites comportamentais respeitados? ✅/❌
   - Vocabulário proibido ausente? ✅/❌
2. Score geral: porcentagem ou nota A/B/C.
3. Sugestões de melhoria, quando aplicável.

**Entrada**: Prompt final + persona + spec  
**Saída**: Relatório de validação  

---

### Etapa 8 — Export
**Seção**: Botões de exportação

1. Usuário escolhe formato: Markdown ou JSON.
2. Sistema gera arquivo com todos os artefatos:
   - Spec
   - Persona
   - Prompt final
   - Validação
3. Download automático.

**Entrada**: Artefatos gerados  
**Saída**: Arquivo .md ou .json  

---

## Fluxo lateral — Configuração de provider

Acessível a qualquer momento via ícone de engrenagem no header.

1. Usuário abre painel lateral/modal de configuração.
2. Vê lista de providers com status:
   - OpenRouter: ✅ Configurado / ⚠️ Não configurado
   - Anthropic: ✅ Configurado / ⚠️ Não configurado
   - MiniMax: ✅ Configurado / ⚠️ Não configurado
   - Claude Subscription: ✅ Disponível / ⚠️ Indisponível
3. Para cada provider, pode inserir API key (mascarada no frontend).
4. Pode selecionar provider padrão e provider de fallback.
5. Pode testar conexão.
6. Salvar.

**Nota**: API keys são enviadas ao backend e nunca armazenadas no frontend.

---

## Estados da interface

| Estado | Comportamento |
|---|---|
| Vazio | Mensagem orientadora com CTA |
| Loading | Skeleton com pulse animation |
| Sucesso | Conteúdo exibido com transição suave |
| Erro | Mensagem vermelha com ação sugerida |
| Sem provider | Banner amarelo com link para configuração |
| Fallback ativo | Badge indicando "Usando [provider] (fallback)" |

---

## Momentos wow

| # | Momento | Descrição |
|---|---|---|
| 1 | Spec aparece | Conhecimento vira especificação estruturada em segundos |
| 2 | Persona ganha forma | Sliders, tags e exemplos dão vida ao agente |
| 3 | Prompt final surge | Tudo se conecta em um prompt profissional pronto |
| 4 | Validação confirma | Checklist verde mostra que está tudo coerente |
| 5 | Export instantâneo | Artefatos prontos para usar no mundo real |
