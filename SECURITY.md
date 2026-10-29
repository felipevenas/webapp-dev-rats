# Política de Segurança 🔒

O **DevStreak Web** é a interface de uma plataforma que lê metadados de commits no GitHub para validar constância. A segurança e a privacidade são pilares do produto: nenhum código-fonte, mensagem privada de commit ou token do GitHub deve chegar ao navegador.

Se você acredita ter encontrado uma vulnerabilidade, agradecemos a divulgação responsável.

---

## Versões Suportadas

Apenas a versão mais recente em `main` recebe atualizações ativas de segurança:

| Versão  | Suportada          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

---

## Relatando uma Vulnerabilidade

**Por favor, não relate vulnerabilidades de segurança publicamente em Issues abertas.**

1. Abra um relatório confidencial pelo recurso de **[Private Vulnerability Reporting](https://github.com/felipevenas/webapp-devstreak/security/advisories/new)**.
2. Se o recurso não estiver disponível, entre em contato diretamente com o mantenedor pelo perfil [@felipevenas](https://github.com/felipevenas), sem abrir uma Issue pública.
3. Descreva os detalhes, passos para reprodução, impacto potencial e qualquer prova de conceito (PoC).
4. Responderemos em até **48 horas úteis** com avaliação e plano de mitigação.

---

## Escopo de Segurança do Frontend

São consideradas vulnerabilidades de alta prioridade:

- **Token exposto no navegador**: access token persistido em `localStorage`/`sessionStorage`, refresh token legível por JavaScript ou token do GitHub presente no bundle.
- **Segredo no bundle**: qualquer credencial em variáveis `VITE_*` ou no `dist/` (variáveis `VITE_*` são públicas por definição).
- **XSS**: injeção de HTML/script via respostas da API, nomes de grupo, mensagens de feed, payloads de notificação ou parâmetros de URL.
- **Bypass de autorização percebido**: ação destrutiva executada apenas com lógica de UI, sem validação correspondente na API (a API é a fonte de verdade).
- **Open redirect**: manipulação do parâmetro `next` em login/convite para redirecionar a domínios externos.
- **Vazamento de convite**: exposição do token de convite em logs, analytics, referrer ou histórico de forma desnecessária.
- **Privacidade**: exibição de código-fonte, mensagens de commit privadas ou dados de repositórios de terceiros.
- **Dependências vulneráveis** com impacto no build ou no runtime.
- **Configuração de sessão**: cookie de refresh sem `HttpOnly`, `SameSite` inadequado, CORS permissivo ou origem de OAuth incorreta.

Vulnerabilidades no backend (`api-dev-rats`) devem ser reportadas pelo mesmo canal, indicando o componente afetado.

---

## Processo de Resolução

1. Confirmamos o relatório e classificamos o impacto.
2. Preparamos a correção em ambiente controlado, com testes.
3. Publicamos a correção em `main` e registramos no `CHANGELOG.md`.
4. Damos crédito ao pesquisador, se desejado, após a correção.

Obrigado por ajudar a manter o DevStreak seguro.
