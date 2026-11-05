# Relatório de responsividade - DevRats Web

Auditoria conduzida com o MCP do Playwright no frontend em execução (`http://localhost:5174`), com a API local (`http://localhost:8080`) e dados de um grupo ativo.

## Cobertura

**Larguras:** 320, 360, 390, 768, 1024, 1280 e 1440px (retrato e paisagem onde aplicável).

**Telas e fluxos:**

- Landing, login, cadastro (topo e rodapé), recuperação de senha, termos, 404.
- Convite público válido (deslogado), CTA de login com `next`.
- Onboarding autenticado.
- Dashboard, lista de desafios, wizard (etapas 1-4), grupo (visão geral, ranking, calendário, atividade), configurações, perfil, integrações, alertas.
- Chat: lista de conversas, thread privado/grupo, menu de anexos, composer com texto curto e longo, estado vazio e estado de carregamento.
- Modais: convite (bottom sheet), exclusão de conta (bottom sheet), início/cancelamento de desafio.
- Temas escuro e claro.

## Verificações executadas

1. `document.scrollWidth` vs `clientWidth` em todas as rotas e larguras para detectar overflow horizontal.
2. Elementos com `right` além da viewport (excluindo decorações absolutas) para localizar a origem do overflow.
3. Captura de tela por tela nas larguras críticas, com inspeção de:
   - header e ações;
   - navegação (sidebar/bottom nav/tabs);
   - formulários, selects, date inputs e checkboxes;
   - grids, cards, tabelas e calendário;
   - modais/bottom sheets e rodapés;
   - estados de loading, vazio e erro;
   - contraste e legibilidade nos dois temas.
4. Navegação por teclado no calendário (setas) e foco visível nos controles.
5. Rotas lazy e transições com barra de progresso no topo.

## Problemas corrigidos

| Problema | Onde aparecia | Correção |
|---|---|---|
| Tabs do desafio cortavam “Atividade” em 360/320 | Grupo e calendário | Tabs em grade de 4 colunas, rótulo curto “Geral” no mobile |
| Filtros de desafios estouravam em 320 | Lista de desafios | `select` nativo abaixo de `sm`; segmented a partir de `sm` |
| Cards em layout de duas colunas espremiam o conteúdo em 1024 | Grupo, perfil, integrações, configurações | Layouts main + rail passaram a iniciar em `xl`; cards e grids receberam `min-w-0` |
| Sidebar e conteúdo causavam overflow em configurações no mobile | Configurações do grupo | `min-width: 0` nos cards; grid children com `min-w-0` |
| Células do calendário ficavam enormes em tablet | Calendário | Grid com breakpoint `md` e largura máxima em `xl` |
| Bottom nav cobria formulários longos | Wizard e configurações | Navegação inferior oculta nessas rotas; back link no header |
| Rodapé do wizard não ficava acessível no mobile | Wizard | CTA fixo no rodapé com safe-area, sem nav sobreposta |
| Botões quebravam linha (“Gerar convite”, “Conectar GitHub”) | Convites/integrações | `whitespace-nowrap` global nos botões |
| Rodapé de modal invertia a ordem da ação primária | Bottom sheets | Ordem do DOM → primária no rodapé |
| Link de convite gerado pelo backend apontava para outra porta de dev | Convites | URL reconstruída a partir de `window.location.origin` + token |
| Header da landing quebrava o CTA em 360 | Landing | CTA de cadastro oculto no header mobile; hero mantém a ação principal |
| Header de autenticação não oferecia troca de tema no mobile | Login/cadastro | Theme toggle no header e no painel desktop |
| Sidebar desktop não tinha troca de tema | App logado | Theme toggle no topo da sidebar |
| Tema claro tinha labels pequenos com contraste baixo | App inteiro | Token `faint` ajustado para contraste AA |
| Preview de convite retornava 401 para visitantes | API (SecurityConfig) | `GET /api/v1/invites/**` liberado; aceite continua autenticado |
| Header do grupo ocupava a tela toda antes do calendário | Tabs do grupo | Header compacto no mobile nas abas que não são “Visão geral” |
| Banner do perfil espremia foto, informações e estatísticas na horizontal | Perfil | Foto e dados empilhados; cards dos grupos no canto superior direito a partir de `xl` |
| Lista de conversas não ocupava a largura da coluna no mobile | Chat | `w-full` no container da lista |
| Thread do chat media 393px em viewport de 390px | Chat | `min-w-0` no thread, no header, no composer e no textarea |
| Página do chat rolava 56px além da viewport e deslocava o composer | Chat | Shell fecha em `h-[calc(100dvh-3.5rem)]` (mobile) e `lg:h-dvh`; página usa `h-full` |
| Duas colunas do chat deixavam o thread com menos de 450px em 1024px | Chat | Breakpoint de `lg` para `xl`; abaixo disso a thread ocupa a tela com botão de voltar |
| Composer espremido e placeholder cortado em 320px | Chat | Menu único de anexos abaixo de `sm`, placeholder “Mensagem…” e envio com `shrink-0` |
| Texto longo ficava escondido no campo de uma linha | Chat | Auto-resize até 128px com rolagem interna |
| Skeleton da thread era uma pilha de blocos sem header e sem composer | Chat | Skeleton com header, bolhas alternadas e composer; lista com avatar e duas linhas |
| Chat do grupo só era acessível por um ícone no header, fácil de ignorar no mobile | Página do grupo | Botão “Chat do grupo” ao lado das abas, largura total abaixo de `sm` |

## Chat: medições após as correções

Medidas com o Playwright MCP no thread do grupo, tema escuro e claro:

| Viewport | Thread | Composer (campo) | `scrollWidth` | `scrollHeight` |
|---|---|---|---|---|
| 320×568 | 320px | 166px | 320 | 568 |
| 390×844 | 390px | 198px | 390 | 844 |
| 768×1024 | 768px | 581px | 768 | 1024 |
| 1024×768 | 784px (a partir de 240) | 581px | 1024 | 768 |
| 1280×900 | 700px (lista de 340) | 500px | 1280 | 900 |

- Em 320/390 o thread ocupa a viewport inteira, com botão de voltar e sem bottom nav.
- Em 1024 a sidebar do app tem 240px e a thread usa o restante; a lista de conversas aparece na rota `/app/chat`.
- Em 1280 lista (340px) e thread (700px) convivem; o botão “Abrir grupo” aparece no header.
- O menu de anexos no mobile abre acima do botão e não cobre o campo de mensagem.
- Texto longo expande o campo até 128px e mantém o botão de envio ancorado à direita.

## Resultado final

- Nenhum `scrollWidth` maior que `clientWidth` nas rotas auditadas em **320, 360, 768, 1024 e 1440px** (excluindo a barra de rolagem do navegador).
- Sem ações primárias cortadas nas telas testadas.
- Bottom sheets cabem em `92dvh` e mantêm a primária acessível.
- Sidebar em `≥1024px`, bottom nav em `<1024px`, sem duplicidade de navegação na mesma largura.
- Tema claro e escuro preservam hierarquia, contraste e estados.

## Observações residuais

- O calendário é um heatmap compacto: em 320/360px as células ficam em torno de 30-36px. A interação continua acessível por teclado e cada dia tem rótulo completo; para alvos de 44px, seria necessário um modo de calendário em lista ou zoom.
- A bottom nav fixa ocupa ~72px; todas as páginas têm padding inferior suficiente para rolar o conteúdo até acima dela.
- A alternância de tema é persistida em `localStorage`; o padrão é escuro.
