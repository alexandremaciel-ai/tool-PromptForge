# 01 — Requisitos

## Objetivo do sistema
Permitir que um usuário transforme conhecimento bruto em artefatos operacionais de engenharia de prompt, incluindo especificações, personas de agente, prompts finais com guardrails, validações e exportações — usando providers de modelo configuráveis com fallback.

---

## Requisitos funcionais

### RF01 — Ingestão de conhecimento
- O sistema deve aceitar upload de arquivos PDF, TXT e Markdown.
- O sistema deve extrair texto dos arquivos enviados.
- O sistema deve segmentar o texto em chunks previsíveis.
- O sistema deve exibir feedback imediato sobre o upload (nome do arquivo, tamanho, status).
- O sistema deve exibir os trechos extraídos para transparência.

### RF02 — Geração de spec de prompt
- O sistema deve gerar uma especificação de prompt a partir do conhecimento extraído.
- A spec deve conter: objetivo, inputs, contexto obrigatório, restrições, guardrails e formato de saída.
- O usuário deve poder editar a spec gerada antes de prosseguir.

### RF03 — Criação de persona do agente
- O sistema deve permitir criação e edição de persona com os seguintes campos mínimos:
  - Nome interno
  - Papel do agente
  - Objetivo conversacional
  - Público-alvo
  - Tom principal e tons secundários
  - Personalidade
  - Nível de formalidade (escala 1-5)
  - Nível de empatia (escala 1-5)
  - Nível de objetividade (escala 1-5)
  - Vocabulário preferido
  - Vocabulário proibido
  - Postura diante de incerteza
  - Limites comportamentais
  - Exemplos de resposta (bons e ruins)
- O sistema deve poder sugerir persona automaticamente com base no conhecimento extraído.
- O usuário deve poder ajustar a persona sugerida.

### RF04 — Geração de prompt final
- O sistema deve gerar prompt final vinculado à spec e à persona.
- O prompt gerado deve conter: papel, objetivo, regras, contexto, guardrails, formato de saída e exemplos few-shot.
- O sistema deve indicar quais trechos do conhecimento sustentam o prompt.

### RF05 — Validação e score
- O sistema deve exibir pelo menos uma validação do prompt gerado.
- Opções aceitas: checklist de consistência, score de qualidade, ou lista de guardrails atendidos.
- A validação deve verificar coerência entre persona e prompt.

### RF06 — Configuração de provider
- O sistema deve permitir configuração de providers: OpenRouter, Anthropic, MiniMax.
- O sistema deve suportar modo opcional `claude-subscription`.
- O sistema deve permitir seleção de provider por etapa ou global.
- O sistema deve exibir provider ativo.
- O sistema deve executar fallback quando o provider primário falhar.
- O sistema deve exibir mensagem clara quando nenhum provider estiver configurado.

### RF07 — Export
- O sistema deve exportar artefatos em Markdown.
- O sistema deve exportar artefatos em JSON.
- A exportação deve incluir: spec, persona, prompt final e validação.

### RF08 — Indicação de runtime
- A interface deve mostrar qual provider/runtime está ativo em cada momento.
- A interface deve indicar fallback quando ocorrer.

---

## Requisitos não funcionais

### RNF01 — Performance
- A geração de spec deve iniciar em menos de 3 segundos após submissão.
- O upload de arquivos deve aceitar até 10 MB por arquivo.
- A interface deve fornecer feedback de loading durante gerações.

### RNF02 — Segurança
- Secrets nunca devem ser expostos no frontend.
- Chamadas autenticadas a providers devem passar pelo backend.
- O projeto deve incluir `.env.example` sem chaves reais.
- O sistema deve funcionar com pelo menos um provider configurado.

### RNF03 — Usabilidade
- A interface deve ser usável sem manual.
- O fluxo principal deve ser completável em menos de 5 cliques após o upload.
- Estados de loading, erro e vazio devem ter tratamento visual explícito.

### RNF04 — Portabilidade
- A aplicação deve rodar com Docker e docker-compose.
- O bootstrap local deve requerer apenas `docker-compose up`.
- A aplicação deve funcionar em macOS e Linux.

### RNF05 — Manutenibilidade
- Código modular com separação clara entre frontend, backend e camada de provider.
- Nomes de arquivo e função descritivos.
- Sem abstrações desnecessárias.

---

## Restrições
- Não há autenticação de usuários no MVP.
- Não há persistência de longo prazo — dados existem durante a sessão.
- Não há deploy em cloud — apenas execução local.
- Máximo de 3 arquivos por sessão de upload.
- O modo `claude-subscription` é opcional e não garantido.

---

## Critérios de aceite

| Critério | Condição |
|---|---|
| Upload funciona | PDF, TXT e MD são aceitos e texto é extraído |
| Spec é gerada | Spec contém objetivo, inputs, restrições e formato |
| Persona é criável | Todos os campos mínimos são editáveis |
| Prompt final é gerado | Prompt reflete spec + persona |
| Validação existe | Pelo menos um mecanismo de validação funciona |
| Provider é configurável | Pelo menos um provider funciona via API key |
| Fallback funciona | Sistema tenta provider alternativo em caso de falha |
| Export funciona | Markdown e JSON são gerados corretamente |
| Docker roda | `docker-compose up` inicia a aplicação |

---

## Casos de uso principais

### CU01 — Gerar prompt a partir de documento
**Ator**: Prompt engineer  
**Pré-condição**: Pelo menos um provider configurado  
**Fluxo**: Upload → Extração → Spec → Persona → Prompt → Validação → Export  
**Pós-condição**: Artefatos exportáveis gerados  

### CU02 — Criar persona de agente
**Ator**: Designer conversacional  
**Pré-condição**: Conhecimento extraído ou inserido manualmente  
**Fluxo**: Definir campos de persona → Gerar persona-spec → Gerar system prompt → Validar consistência  
**Pós-condição**: Persona especificada com exemplos e anti-exemplos  

### CU03 — Configurar provider
**Ator**: Usuário técnico  
**Pré-condição**: Pelo menos uma API key disponível  
**Fluxo**: Acessar configuração → Inserir API key → Selecionar provider → Testar conexão → Salvar  
**Pós-condição**: Provider ativo exibido na interface  

### CU04 — Exportar artefatos
**Ator**: Qualquer usuário  
**Pré-condição**: Prompt final gerado  
**Fluxo**: Selecionar formato → Exportar  
**Pós-condição**: Arquivo MD ou JSON baixado  

---

## Suposições explícitas
1. O usuário possui pelo menos uma API key de um dos providers suportados.
2. Os documentos enviados estão em português ou inglês.
3. O ambiente local tem Docker instalado.
4. O usuário tem familiaridade básica com conceitos de IA generativa.
5. A conexão com internet está disponível para chamadas a providers via API.
6. Os modelos dos providers suportam geração em português do Brasil.
7. A qualidade da saída depende diretamente da qualidade do conhecimento enviado.
