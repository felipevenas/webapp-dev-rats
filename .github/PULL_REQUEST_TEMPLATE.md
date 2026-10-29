# Descrição do Pull Request

Inclua um resumo das alterações, o problema ou funcionalidade abordada e o impacto esperado na experiência do usuário.

---

## Tipo de Alteração

- [ ] 🚀 Nova funcionalidade (`feature`)
- [ ] 🐞 Correção de bug (`bug fix`)
- [ ] 🔒 Correção/endurecimento de segurança (`security`)
- [ ] ♿ Acessibilidade (`a11y`)
- [ ] 🔧 Refatoração sem alteração funcional (`refactor`)
- [ ] 📝 Documentação (`docs`)
- [ ] 🧪 Testes e QA (`test`)
- [ ] 🎨 Ajuste visual ou responsividade (`enhancement`)
- [ ] ⚙️ Infraestrutura, CI/CD ou governança (`ci/cd`, `governance`)

## Como foi testado?

- [ ] **Lint:** `npm run lint` sem erros.
- [ ] **Tipos:** `npm run typecheck` sem erros.
- [ ] **Testes:** `npm test` passou 100%.
- [ ] **Build:** `npm run build` concluiu.
- [ ] **Responsividade:** validei em 320, 360, 390, 768, 1024, 1280 e 1440px.
- [ ] **Temas:** validei claro e escuro.
- [ ] **Console:** sem erros novos de React, rede ou acessibilidade.
- [ ] **Fluxo crítico:** autenticação, criação de desafio, convite, progresso ou integração afetados foram testados.

## Checklist de Qualidade, Segurança e Privacidade

- [ ] Meu código respeita a arquitetura feature-based e as fronteiras de `domain`, `data` e `ui`.
- [ ] Fiz auto-revisão do código e removi código morto/experimental.
- [ ] Nenhum token, cookie ou segredo foi persistido no navegador ou embutido no bundle.
- [ ] Nenhuma mensagem privada de commit, código-fonte ou dado de repositório de terceiros é exibido.
- [ ] Estados de loading, vazio, erro e sem permissão foram considerados.
- [ ] A interface mantém contraste AA, foco visível e navegação por teclado.
- [ ] Atualizei `README.md`, `docs/RESPONSIVE-QA.md` e `CHANGELOG.md` quando aplicável.

## Evidências

_Cole logs, saídas de teste, capturas de tela (mobile e desktop) ou excertos que comprovem a mudança._
