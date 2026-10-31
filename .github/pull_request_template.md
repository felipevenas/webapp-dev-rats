# Descrição do Pull Request

Inclua um resumo das alterações, o problema ou funcionalidade abordada e o impacto esperado na experiência do usuário.

---

## Tipo de Alteração

- [ ] 🚀 Nova funcionalidade (`feature`)
- [ ] 🐞 Correção de bug (`bug fix`)
- [ ] 🔧 Refatoração sem alteração funcional (`refactor`)
- [ ] 📝 Documentação (`docs`)
- [ ] 🎨 Estilo / UI / responsividade (`style`)
- [ ] ⚙️ Infraestrutura, CI/CD ou dependências (`chore`)
- [ ] 🔒 Segurança, privacidade ou acessibilidade (`security` / `a11y`)

## Como foi testado?

Descreva as validações executadas e como reproduzir no ambiente local.

- [ ] **Lint:** `npm run lint` sem erros.
- [ ] **Tipos:** `npm run typecheck` sem erros.
- [ ] **Testes:** `npm test` passou.
- [ ] **Build:** `npm run build` concluiu.
- [ ] **Responsividade:** validei em 320, 360, 390, 768, 1024, 1280 e 1440 px.
- [ ] **Temas:** validei claro e escuro.
- [ ] **Console:** sem erros novos de React, rede ou acessibilidade.
- [ ] **Fluxo afetado:** autenticação, cadastro, perfil, desafio, convite, progresso ou integração foram testados.
- [ ] Outros testes executados:

## Evidência Visual

*Se aplicável, cole capturas de tela (mobile e desktop) ou GIFs demonstrando a mudança.*

## Checklist

- [ ] Meu código segue a arquitetura feature-based (`domain`, `data`, `ui`).
- [ ] Fiz auto-revisão e removi código morto ou experimental.
- [ ] Nenhum token, cookie ou segredo foi persistido no navegador ou no bundle.
- [ ] Nenhuma mensagem privada de commit, código-fonte ou dado de terceiro é exibido.
- [ ] Considerei estados de loading, vazio, erro e sem permissão.
- [ ] A interface mantém contraste AA, foco visível e navegação por teclado.
- [ ] Atualizei `README.md`, `docs/RESPONSIVE-QA.md` e `CHANGELOG.md` quando aplicável.
