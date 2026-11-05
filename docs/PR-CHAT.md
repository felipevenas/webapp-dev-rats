# feat(web): chat em tempo real com STOMP, anexos e mensagens de voz

## Resumo

Adiciona a interface de chat do DevRats:

- lista de conversas com busca, última mensagem e badge de não lidas;
- thread privado entre amigos e chat de grupo;
- envio otimista de texto, imagem, voz e documento;
- atualização em tempo real por STOMP/WebSocket;
- atalhos no card de amigo, na página do grupo e na navegação.

## Motivação

O backend de chat já expõe histórico, envio, leitura e eventos. O frontend precisava de uma experiência de conversa integrada ao design system existente, sem polling agressivo e sem duplicar mensagens entre resposta HTTP e evento WebSocket.

## O que mudou

### Dados e tempo real

- `features/chat/data/chat-api.ts` com todos os endpoints.
- `chat-socket.ts`: cliente STOMP único por aba, token no `CONNECT`, heartbeats, backoff exponencial e reconexão com refresh quando o servidor fecha com `4001`.
- `chat-socket-provider.tsx`: assina `/user/queue/chat`, reconcilia cache do TanStack Query, atualiza não lidas e mantém “digitando”.
- `use-chat.ts`: queries de conversas/mensagens/não lidas e mutations com envio otimista, progresso e retry.
- Tipos de chat em `core/types/api.ts` e chaves em `core/config/query-keys.ts`.
- `resolveWsUrl` em `core/config/env.ts` deriva `ws/wss` da API ou usa `VITE_WS_URL`.

### Interface

- `chat-page.tsx`: layout de duas colunas no desktop e lista/thread separados no mobile.
- `conversation-list.tsx` + `conversation-item.tsx`: busca, presença, última mensagem, horário e não lidas.
- `message-thread.tsx`: carregamento de histórico por cursor, agrupamento por dia, auto-scroll, pílula de novas mensagens, marcação de leitura e indicador de digitação.
- `message-bubble.tsx`: bolhas próprias/terceiros, nome do remetente em grupo, status de envio, progresso, falha, retry e exclusão.
- `message-composer.tsx`: texto, imagem, documento, gravação de voz, `Enter` envia e `Shift+Enter` quebra linha.
- `voice-recorder.tsx`: MediaRecorder com timer, cancelamento e fallback de MIME (`webm`, `ogg`, `mp4`).
- `attachment-view.tsx`: imagem com lightbox, player de áudio, cartão de documento e renovação de URL assinada.
- `new-conversation-dialog.tsx`: seleção de amigos para iniciar chat privado.

### Navegação e integração

- Rotas `/app/chat` e `/app/chat/:conversationId`.
- Item Conversas na sidebar e na bottom nav, com badge de não lidas; o sino de alertas permanece no header mobile.
- Bottom nav escondida no thread para liberar o composer.
- Botão de mensagem no `FriendCard` e botão de chat na página do grupo.

## Decisões de UX/arquitetura

- **Envio otimista com `clientMessageId`**: a resposta HTTP e o evento do WebSocket reconciliam a mesma bolha, sem duplicar.
- **Cache por conversa**: eventos atualizam o thread aberto e invalidam lista/não lidas; o histórico não é recarregado a cada mensagem.
- **Fallback**: o thread aberto mantém um refetch de 30s; a lista, 60s. O WebSocket cobre o tempo real.
- **Acessibilidade**: labels nos botões de ícone, `aria-live` no thread, foco visível, composer por teclado e descrição de anexos.
- **Mobile**: thread com `h-[calc(100dvh-3.5rem)]`, composer com `safe-area` e bottom nav oculta.

## Testes

- `chat-message.test.ts`: merge por `clientMessageId`, dedupe por id, ordenação, exclusão e agrupamento por dia.
- `attachment-rules.test.ts`: JPEG/PNG, extensões de documento, duração de voz e MIME.
- `env.test.ts`: derivação de `ws/wss`.
- Gates executados: `npm run typecheck`, `npm run lint` (apenas warnings preexistentes), `npm test` (24 arquivos, 121 testes antes dos novos; 14 novos testes de chat).

## Configuração

```env
VITE_API_BASE_URL=
VITE_WS_URL=wss://api.devrats.app/ws
```

`VITE_WS_URL` é opcional em desenvolvimento (proxy `/ws` do Vite). Em produção ele é obrigatório: o REST continua
same-origin via rewrite da Vercel (`/api` → `https://api.devrats.app/api`), mas o WebSocket conecta direto em
`wss://api.devrats.app/ws`, porque a Vercel não faz upgrade de WebSocket.

## Limitações conhecidas

- Um anexo por mensagem na v1.
- Sem edição, busca, reações, replies ou chamadas.
- Sem push notification e sem criptografia ponta a ponta.
- Tempo real depende de uma única instância da API enquanto o broker simples estiver em uso.

## Pontos de melhoria documentados

- Migrar cache/rate limit/presença para Redis e adicionar broker distribuído quando houver múltiplas réplicas.
- Suportar múltiplos anexos, thumbnails, presigned PUT e virus scanning.
- Adicionar busca, edição, reações, replies e push.
- Criar testes E2E com dois contextos de browser e reconexão forçada.
- Adicionar Observabilidade específica de chat no frontend (taxa de reconexão, falha de upload, latência percebida).

## Checklist

- [x] Rotas e navegação
- [x] Data layer + socket
- [x] UI desktop/mobile
- [x] Texto, imagem, voz e documento
- [x] Não lidas e leitura
- [x] Reconexão e refresh de token
- [x] Testes de domínio
- [x] Typecheck/lint/test
- [x] CHANGELOG
- [x] Documentação de configuração e limitações
