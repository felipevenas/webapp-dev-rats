# Guia de Contribuição 🤝

Obrigado pelo interesse em contribuir com o **DevStreak Web**! Este documento orienta o processo de desenvolvimento para manter a interface consistente, acessível e sustentável.

> **Regra de ouro:** o DevStreak comprova atividade elegível, não aprendizado. Nenhuma contribuição pode expor código-fonte, mensagens privadas de commit, tokens ou dados de repositórios de terceiros. A API é a fonte de verdade para autorização e progresso.

---

## 🛠️ Ambiente de Desenvolvimento

### Pré-requisitos

- **Node.js >= 22** (validado com Node 24.11).
- **npm >= 10**.
- API Spring Boot (`../api-dev-rats`) e PostgreSQL em execução para os fluxos autenticados.

### Instalação

```bash
git clone https://github.com/felipevenas/webapp-devstreak.git
cd webapp-devstreak
npm install
cp .env.example .env.local
npm run dev
```

A aplicação sobe em **http://localhost:5174**. Em desenvolvimento, o Vite faz proxy de `/api` para `http://localhost:8080`.

> A porta 5173 é evitada porque outro projeto local costuma ocupá-la. Para o OAuth do GitHub, a API deve ter `APP_FRONTEND_URL=http://localhost:5174` e a origem correspondente em `APP_CORS_ALLOWED_ORIGINS`.

Detalhes completos de setup, arquitetura e integração estão no [`README.md`](README.md).

---

## 🌿 Branches e Commits

Adotamos **Trunk-Based Development** com branches curtas a partir de `main`, mescladas por Pull Request.

### Nomes de branches

- `funcionalidade/nome-da-feature`
- `correcao/nome-do-bug`
- `documentacao/nome-do-documento`
- `melhoria/nome-do-ajuste`

Exemplos: `funcionalidade/calendario-por-membro`, `correcao/refresh-na-reabertura`.

### Commits

Mensagens em português com prefixos convencionais:

| Prefixo     | Uso                                                        |
| ----------- | ---------------------------------------------------------- |
| `feat:`     | Nova funcionalidade visível ao usuário                     |
| `fix:`      | Correção de comportamento ou layout                        |
| `refactor:` | Refatoração sem alteração funcional                        |
| `docs:`     | Documentação, README ou comentários relevantes             |
| `test:`     | Testes unitários ou de integração                          |
| `style:`    | Ajuste puramente visual ou de formatação                   |
| `chore:`    | Build, dependências, CI/CD ou configuração                 |

Exemplo: `feat: adiciona filtro por status na lista de desafios`.

---

## 🏛️ Diretrizes Arquiteturais

A organização é **feature-based**, com fronteiras simples e explícitas:

```
src/features/<feature>/
├── domain/   # tipos e regras puras, sem React
├── data/     # clients da API, hooks de servidor e query keys
└── ui/       # páginas e componentes de apresentação
```

Regras:

1. **Domínio puro.** `domain` não importa React, axios, hooks ou APIs do navegador.
2. **Dados isolados.** Chamadas HTTP ficam em `data` (ou em `core/http`); componentes não devem espalhar URLs da API.
3. **UI previsível.** Componentes pequenos, estados explícitos (loading, vazio, erro, sem permissão) e sem regra de negócio duplicada.
4. **Design system.** Tokens semânticos ficam em `src/styles/globals.css`; evite cores mágicas no markup.
5. **Contratos da API.** Tipos em `src/core/types/api.ts` espelham o backend; mudanças de contrato exigem atualização da UI e dos testes.
6. **Sessão.** Access token somente em memória; refresh em cookie HttpOnly; nunca persistir tokens em `localStorage`.
7. **Sem segredos no frontend.** Tudo em `VITE_*` é público. Credenciais da GitHub App ficam exclusivamente no backend.
8. **Acessibilidade e responsividade fazem parte da definição de pronto**, não são polimento opcional.

---

## 🧪 Gates de Qualidade

Execute antes de abrir um Pull Request:

```bash
npm run lint        # oxlint
npm run typecheck   # TypeScript
npm test            # Vitest
npm run build       # build de produção
```

Para mudanças de UI, valide manualmente ou com Playwright em **320, 360, 390, 768, 1024, 1280 e 1440px**, nos temas claro e escuro. Consulte [`docs/RESPONSIVE-QA.md`](docs/RESPONSIVE-QA.md).

Checklist mínimo de UI:

- Sem rolagem horizontal.
- Ações primárias visíveis e alcançáveis em mobile.
- Foco visível, labels e contraste AA.
- Estados de carregamento, vazio, erro e integração desconectada.
- Nenhum erro novo no console.

---

## 🔐 Segurança e Privacidade

- Nunca exponha tokens, cookies, chaves ou dados de repositórios privados.
- Não registre payloads de autenticação em logs ou analytics.
- Não confie apenas em esconder botões: a API valida permissões.
- Trate `next` de login/convite como caminho interno apenas.
- Dependências novas exigem justificativa e revisão de licença/segurança.
- Vulnerabilidades devem seguir [`SECURITY.md`](SECURITY.md), nunca uma issue pública.

---

## 📬 Submetendo um Pull Request

1. Crie uma branch curta a partir de `main`.
2. Mantenha lint, tipos, testes e build verdes.
3. Atualize o [`CHANGELOG.md`](CHANGELOG.md) quando a mudança for relevante ao usuário.
4. Preencha o template de PR com evidências e passos de teste.
5. Para mudanças visuais, anexe capturas em mobile e desktop.
6. Aguarde a CI e a revisão antes do merge (squash).

Alterações em autenticação, integração GitHub, permissões, convites ou privacidade exigem atenção explícita à segurança no PR.

---

## ✅ Definição de Pronto

- Comportamento descrito e testado.
- Sem regressões de responsividade ou acessibilidade.
- Estados de erro e indisponibilidade tratados.
- Documentação e changelog atualizados quando aplicável.
- CI verde e PR aprovado.
