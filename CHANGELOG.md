# Changelog

Todas as mudanças notáveis deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Não publicado]

### 📝 Documentação

- README padronizado com print da landing, badges, arquitetura, governança e licença.
- Descrição e topics do repositório alinhados ao ecossistema DevRats.

## [0.1.0] - 2026-10-29

### 🚀 Adicionado

- Landing page pública com direção visual “terminal arcade”, preview real do produto, modos de verificação e FAQ.
- Autenticação completa: cadastro, login, recuperação e redefinição de senha, com política de senha espelhando o backend.
- Sessão com access token em memória, refresh HttpOnly, renovação single-flight e restauração após reload.
- Onboarding com conexão GitHub, criação do primeiro desafio e convite do grupo.
- Dashboard com progresso por grupo, sequência, ranking, status da integração e atalhos.
- Lista de desafios com filtros por estado e busca.
- Wizard de criação em cinco etapas: grupo, regras, janela, repositórios e revisão.
- Página do grupo com visão geral, ranking, calendário, feed de atividade e estado de desafio concluído/cancelado.
- Calendário de atividade com status por dia, navegação por teclado, seleção de membro e adaptação por fuso.
- Ranking com progresso, sequência, último dia válido, destaque do usuário e pódio de vencedor.
- Resultado final com vencedor, dias válidos, dia decisivo e compartilhamento.
- Perfil com edição de nome/fuso, preferências de notificação, exportação LGPD e exclusão de conta.
- Integração GitHub com status, permissões, sincronização, desconexão e catálogo de repositórios.
- Convites privados com validade, limite de usos, revogação e página pública de aceite.
- Central de notificações com marcação individual e em lote.
- Estados de carregamento, vazio, erro, sem permissão, offline, integração desconectada e processamento pendente.
- Tema escuro (padrão) e claro, persistidos com troca na top bar, sidebar, landing e autenticação.
- Design system com tokens semânticos, componentes acessíveis e suporte a `prefers-reduced-motion`.
- QA responsivo com Playwright em 320, 360, 390, 768, 1024, 1280 e 1440px, documentado em `docs/RESPONSIVE-QA.md`.
- Testes unitários para datas/fuso, política de senha e validação do wizard (20 testes).
- Governança: CI, templates de PR/issues, código de conduta, política de segurança, licença, changelog, editorconfig e labels.

### 🐛 Corrigido

- Overflow horizontal em filtros e layouts de duas colunas em telas pequenas.
- Tabs do desafio e navegação inferior sobrepondo conteúdo em mobile.
- Células do calendário em tamanho excessivo em tablet.
- Rodapé de modais com ação primária fora da posição esperada.
- Link de convite apontando para outra porta de desenvolvimento.
- Data de expiração do convite exibida em UTC em vez do fuso local.
- Preview público de convite bloqueado por regra de segurança no backend.

### 🔐 Segurança

- Nenhum token é persistido no navegador.
- Segredos permanecem exclusivamente no backend; variáveis `VITE_*` são tratadas como públicas.
- Rotas protegidas com restauração de sessão e `next` restrito a caminhos internos.
- Documentação de escopo de segurança e canal privado de divulgação.
