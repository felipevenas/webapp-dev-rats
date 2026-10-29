import { LegalPage } from '@/features/legal/ui/legal-page';

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de privacidade"
      updatedAt="28 de outubro de 2026"
      intro="Esta política explica quais dados o DevStreak trata, para quê e por quanto tempo. O princípio é simples: coletar o mínimo necessário para comprovar atividade elegível e manter o desafio funcionando."
      sections={[
        {
          title: '1. Dados que tratamos',
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>Conta: nome de exibição, nome de usuário, e-mail, fuso horário e preferências de notificação.</li>
              <li>GitHub: identificador numérico da conta, nome de usuário, avatar e permissões concedidas.</li>
              <li>Atividade: repositório, SHA do commit, autoria, data do commit e dia validado.</li>
              <li>Grupos: nome, descrição, participantes, convites, ranking e resultado.</li>
              <li>Segurança: registros de auditoria de ações que afetam o resultado do desafio.</li>
            </ul>
          ),
        },
        {
          title: '2. O que não coletamos',
          body: (
            <p>
              Não armazenamos código-fonte, conteúdo de arquivos, mensagens de commit privadas, tokens do GitHub no
              navegador ou dados de repositórios para os quais a aplicação não foi autorizada.
            </p>
          ),
        },
        {
          title: '3. Finalidades e base legal',
          body: (
            <>
              <p>
                Tratamos os dados para executar o contrato de uso da plataforma (conta, grupos, ranking e
                resultados), cumprir obrigações legais e garantir a segurança do serviço.
              </p>
              <p>
                Notificações não essenciais podem ser desativadas nas preferências do perfil. A conexão com o
                GitHub é uma autorização separada e pode ser revogada a qualquer momento.
              </p>
            </>
          ),
        },
        {
          title: '4. Compartilhamento',
          body: (
            <p>
              Os dados de progresso são visíveis apenas para membros do mesmo grupo. Não vendemos dados pessoais.
              Provedores de infraestrutura atuam como operadores e recebem apenas o necessário para hospedar o
              serviço.
            </p>
          ),
        },
        {
          title: '5. Retenção',
          body: (
            <p>
              Eventos de webhook são mantidos por até 90 dias; notificações, por até 180 dias; registros de
              auditoria, por até 2 anos. Resultados finalizados permanecem enquanto o grupo existir, para preservar
              o histórico do desafio.
            </p>
          ),
        },
        {
          title: '6. Seus direitos',
          body: (
            <>
              <p>
                Você pode acessar, corrigir, exportar e excluir seus dados. O perfil oferece exportação em JSON e
                exclusão de conta com confirmação de senha.
              </p>
              <p>
                Para solicitações adicionais, escreva para contato@devstreak.app. Responderemos dentro dos prazos
                previstos na LGPD.
              </p>
            </>
          ),
        },
        {
          title: '7. Segurança',
          body: (
            <p>
              Tokens do GitHub são cifrados no backend e nunca expostos ao frontend. Senhas são armazenadas com
              hash, webhooks têm assinatura validada e o acesso a grupos é verificado no servidor, não apenas na
              interface.
            </p>
          ),
        },
      ]}
    />
  );
}
