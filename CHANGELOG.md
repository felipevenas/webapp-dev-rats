# Changelog

Todas as mudanças notáveis deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Não publicado]

### 🚀 Adicionado

- Sistema de amizades: busca por @usuário, solicitações com aceite, recusa e cancelamento, além de remoção com confirmação.
- Perfil público em `/app/users/:username` com bio, localização, site, nível, stack, contagem de amigos e status de amizade.
- Presença online, ausente e offline com heartbeat a cada 60 segundos apenas com a aba visível.
- Notificações sociais `FRIEND_REQUEST` e `FRIEND_REQUEST_ACCEPTED` com ações inline de aceitar e recusar na central de alertas.
- Item Amigos na sidebar e na bottom nav mobile, com badge de solicitações pendentes.
- Atalho para o perfil público e botão de amizade na lista de participantes do grupo.
- Contagem e atalho da sua rede no perfil.
- **Chat em tempo real**: lista de conversas, thread privado e chat de grupo com envio otimista, mensagens de texto, imagem, voz e documento.
- **WebSocket/STOMP**: conexão autenticada por token, reconexão com backoff, renovação automática quando o token expira, indicador de conexão e indicador de "digitando".
- **Anexos**: upload com progresso, preview de imagem com lightbox, player de áudio, cartão de documento e renovação transparente de URL assinada.
- **Não lidas**: badge no item Conversas da sidebar e da bottom nav, atualizado por evento e por refetch.
- **Atalhos**: botão "Mensagem" no card de amigo, botão "Chat" na página do grupo e rota `/app/chat/:conversationId`.
- **Mobile**: thread ocupa a viewport, esconde a bottom nav, composer com área segura e lista com busca.
- **Acesso ao chat do grupo**: botão dedicado ao lado das abas do grupo, com largura total no mobile, resolve ou cria a conversa e abre a thread.
- **Skeletons do chat**: lista, thread e composer têm estados de carregamento que espelham o layout real (avatar, bolhas alternadas e campo de mensagem), sem tela em branco.
- **Recuperação de senha**: confirmação com o destino informado, validade do link, orientação de spam e opção de enviar para outro e-mail.
- **Link de redefinição**: token lido do fragmento (`#token=...`) com fallback para query, estado inline de link inválido/expirado e CTA para solicitar outro.
- **Token local**: bloco de desenvolvimento exibido apenas quando `import.meta.env.DEV` e o backend devolvem `resetToken`.

### 🎨 Alterado

- Navegação mobile troca o atalho de Alertas por Conversas; o sino de alertas permanece no header.
- Cache de conversas e mensagens passa a ser reconciliado por `clientMessageId` e por evento do WebSocket, sem invalidar o thread inteiro a cada mensagem.
- Chat: layout de duas colunas (lista + thread) passa a iniciar em `xl`; abaixo disso a thread ocupa a tela com botão de voltar, evitando thread apertado em 1024px.
- Chat: anexos de imagem e documento ficam em um menu único no mobile, liberando espaço para o campo de mensagem em telas de 320px.

### 🐛 Corrigido

- Chat: lista de conversas usava largura de conteúdo e deixava uma faixa vazia no mobile; agora ocupa 100% da coluna.
- Chat: thread estourava a viewport em 390px por causa do `min-width` intrínseco do textarea e dos botões do composer; containers receberam `min-w-0`.
- Chat: rota do chat somava 56px além da viewport (`min-h-dvh` + header) e criava rolagem vertical com o composer deslocado; o shell agora fecha em `100dvh`.
- Chat: campo de mensagem não crescia ao digitar; agora expande até 128px e rola internamente, sem esconder o texto.
- Chat: placeholder do composer era cortado em 320px; texto reduzido para “Mensagem…” e botão de envio com `shrink-0`.
- Scroll: hash do reset (`#token=...`) não é um seletor CSS válido e quebrava o `ScrollToTop`; a busca do elemento passou a usar `getElementById`.

### 🧪 Testes

- Schemas de recuperação de senha cobrem e-mail inválido, senha fraca e confirmação divergente.

- Testes de domínio para merge/idempotência de mensagens, agrupamento por dia, regras de anexo e derivação da URL do WebSocket.

### ⚠️ Limitações conhecidas

- A v1 aceita um anexo por mensagem e não tem edição, busca, reações ou chamadas.
- Sem broker distribuído, o tempo real funciona em uma única instância da API.
- Sem criptografia ponta a ponta e sem push notification.

### 🎨 Alterado

- Central de alertas reescrita para suportar ações inline sem botões aninhados.
- Banner do perfil com foto no topo, informações abaixo e cards dos grupos no canto superior direito.
- Lateral da autenticação com identidade visual compacta, sem rolagem.
- Lado esquerdo da autenticação simplificado, sem elementos gráficos e sem rolagem.
- Copy padronizada sem travessões e autenticação centralizada no viewport.
- Sombras mais suaves em cards, modais e superfícies flutuantes.

### 🚀 Adicionado

- Exclusão individual de alertas na central de notificações.
- Exclusão de grupo pelo criador, com confirmação por nome e notificação aos participantes.
- Onboarding interativo pós-cadastro com perfil, GitHub, desafio e convite.
- Paginação padronizada nas listas de repositórios e notificações.
- Fuso horário fixo em Brasília nos novos cadastros e desafios.
- Login com e-mail ou nome de usuário.

### 🚀 Adicionado

- Novos campos de perfil: bio, localização, site, nível e stack.
- Exibição dos commits que validaram cada dia.
### 🚀 Adicionado

- Foto de perfil com upload e fallback para o GitHub.

### 📝 Documentação

- README padronizado com print da landing, badges, arquitetura, governança e licença.
- Descrição e topics do repositório alinhados ao ecossistema DevRats.
- Configuração do domínio `devrats.app`: rewrite de `/api` para `https://api.devrats.app`, canonical/OG em `https://devrats.app` e `VITE_WS_URL=wss://api.devrats.app/ws` para o WebSocket.
- `docs/PR-CHAT.md` documenta o deploy com domínio próprio e a separação entre REST same-origin e WebSocket direto.

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
- Documentação de escopo de segurança e canal privado de divulgação.## [N?o publicado]

### ?? Alterado

- Sombras mais suaves em cards, modais e superf?cies flutuantes.

### ?? Adicionado

- Pagina??o padronizada nas listas de reposit?rios e notifica??es.
- Fuso hor?rio fixo em Bras?lia nos novos cadastros e desafios.
- Login com e-mail ou nome de usu?rio.
- Novos campos de perfil: bio, localiza??o, site, n?vel e stack.
- Exibi??o dos commits que validaram cada dia.
- Foto de perfil com upload e fallback para o GitHub.


