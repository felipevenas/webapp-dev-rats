import { LegalPage } from '@/features/legal/ui/legal-page';

export default function TermsPage() {
  return (
    <LegalPage
      title="Termos de uso"
      updatedAt="28 de outubro de 2026"
      intro="O DevRats é uma plataforma de desafios de constância para desenvolvedores. Ao criar uma conta, você concorda com as regras abaixo, que existem para manter a competição justa e a privacidade de todos."
      sections={[
        {
          title: '1. Conta e elegibilidade',
          body: (
            <>
              <p>
                Você é responsável pelas informações da sua conta e pela segurança da sua senha. É necessário ter
                uma conta GitHub para participar de desafios com verificação de commits.
              </p>
              <p>
                Uma conta por pessoa. Contas duplicadas, automatizadas ou usadas para burlar limites podem ser
                suspensas.
              </p>
            </>
          ),
        },
        {
          title: '2. Verificação de atividade',
          body: (
            <>
              <p>
                A plataforma lê apenas metadados de commits em repositórios autorizados: repositório, autoria,
                data e identificador do commit. Nenhum código-fonte é copiado ou exibido.
              </p>
              <p>
                Um dia é válido quando existe pelo menos um commit elegível no horário de Brasília (GMT-3). Vários
                commits no mesmo dia contam uma vez. Commits de bots, vazios ou de merge não contam.
              </p>
            </>
          ),
        },
        {
          title: '3. Grupos, metas e resultados',
          body: (
            <>
              <p>
                Cada grupo define uma meta individual de dias válidos, uma modalidade de verificação e um fuso
                fixo. O primeiro participante a atingir a meta é declarado vencedor.
              </p>
              <p>
                A modalidade e a lista de repositórios não podem ser alteradas após o início. O criador pode
                cancelar um desafio antes da conclusão, com registro no histórico do grupo.
              </p>
            </>
          ),
        },
        {
          title: '4. Conduta',
          body: (
            <>
              <p>
                Não é permitido tentar fraudar a verificação, manipular eventos do GitHub, assediar participantes
                ou usar a plataforma para atividades ilícitas.
              </p>
              <p>
                O DevRats verifica atividade elegível, não a qualidade do código nem o aprendizado efetivo. Não
                há garantia de que um commit represente trabalho intelectual original.
              </p>
            </>
          ),
        },
        {
          title: '5. Disponibilidade e limitação',
          body: (
            <>
              <p>
                A integração com o GitHub pode ficar temporariamente indisponível. Nesses casos, o progresso é
                reconciliado depois e o participante não é penalizado automaticamente.
              </p>
              <p>
                O serviço é fornecido “como está” durante o piloto, sem garantia de disponibilidade contínua.
              </p>
            </>
          ),
        },
        {
          title: '6. Encerramento',
          body: (
            <p>
              Você pode excluir sua conta a qualquer momento nas configurações do perfil. A exclusão remove seus
              dados pessoais, observadas obrigações legais de retenção e registros de auditoria de resultados já
              finalizados.
            </p>
          ),
        },
      ]}
    />
  );
}
