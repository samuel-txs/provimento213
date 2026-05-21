export type AnswerValue = 'sim' | 'parcial' | 'nao'

export interface Question {
  id: string
  categoryId: string
  text: string
  recommendation: string
}

export interface Category {
  id: string
  title: string
  description: string
}

export const CATEGORIES: Category[] = [
  {
    id: 'c1',
    title: 'Link de Dados',
    description: 'Avaliação da redundância e estabilidade da sua conexão com a internet.',
  },
  {
    id: 'c2',
    title: 'Segurança de Perímetro',
    description:
      'Verificação das barreiras de proteção da sua rede contra acessos externos não autorizados.',
  },
  {
    id: 'c3',
    title: 'Armazenamento e Backup',
    description: 'Garantia da integridade e disponibilidade dos dados críticos da serventia.',
  },
  {
    id: 'c4',
    title: 'Infraestrutura Elétrica',
    description:
      'Avaliação da continuidade dos serviços em caso de falhas no fornecimento de energia.',
  },
  {
    id: 'c5',
    title: 'Gestão e Monitoramento',
    description: 'Controle contínuo de acessos, atualizações e prevenção contra malwares.',
  },
]

export const QUESTIONS: Question[] = [
  // C1: Link de Dados
  {
    id: 'q1',
    categoryId: 'c1',
    text: 'A serventia possui no mínimo dois links de internet de provedores (operadoras) distintos?',
    recommendation:
      'Contrate um segundo link de internet de uma operadora diferente para garantir redundância e continuidade dos serviços, conforme exigido pelo Provimento.',
  },
  // C2: Segurança de Perímetro
  {
    id: 'q2',
    categoryId: 'c2',
    text: 'Existe um firewall corporativo configurado para o controle rigoroso de acesso à rede interna?',
    recommendation:
      'Implemente um firewall corporativo (hardware ou software avançado) para proteger o perímetro da rede contra invasões e controlar o tráfego.',
  },
  {
    id: 'q3',
    categoryId: 'c2',
    text: 'O acesso remoto à rede da serventia é feito exclusivamente por meio de VPN com autenticação segura?',
    recommendation:
      'Configure serviços de VPN (Virtual Private Network) para qualquer tipo de acesso externo aos sistemas internos, desativando acessos diretos inseguros.',
  },
  // C3: Armazenamento e Backup
  {
    id: 'q4',
    categoryId: 'c3',
    text: 'São realizados backups diários de forma híbrida (uma cópia local e outra em nuvem)?',
    recommendation:
      'Estabeleça uma rotina de backup híbrida (local e em nuvem) com periodicidade mínima diária para todos os dados essenciais da serventia.',
  },
  {
    id: 'q5',
    categoryId: 'c3',
    text: 'Os testes de restauração de backup (restore) são executados e documentados periodicamente?',
    recommendation:
      'Crie um cronograma formal de testes de restauração de backup (mínimo semestral) e documente os resultados para garantir que os dados são recuperáveis.',
  },
  // C4: Infraestrutura Elétrica
  {
    id: 'q6',
    categoryId: 'c4',
    text: 'Há no-breaks (UPS) dimensionados corretamente para manter os servidores e equipamentos de rede ativos em caso de queda de energia curta?',
    recommendation:
      'Adquira e dimensione no-breaks adequados para a carga total de seus servidores e equipamentos críticos de infraestrutura.',
  },
  {
    id: 'q7',
    categoryId: 'c4',
    text: 'A serventia possui um gerador de energia para interrupções prolongadas? (Recomendado para serventias de maior porte)',
    recommendation:
      'Avalie a contratação ou aquisição de um gerador de energia para garantir o funcionamento contínuo do cartório durante blecautes prolongados.',
  },
  // C5: Gestão e Monitoramento
  {
    id: 'q8',
    categoryId: 'c5',
    text: 'Todos os computadores e servidores possuem solução de antivírus corporativo gerenciada e atualizada?',
    recommendation:
      'Instale e mantenha atualizada uma solução de antivírus gerenciada (Endpoint Protection) centralizada em todas as estações de trabalho e servidores.',
  },
  {
    id: 'q9',
    categoryId: 'c5',
    text: 'Existe uma política ativa de gestão de logs para rastrear acessos e alterações nos sistemas e na rede?',
    recommendation:
      'Ative e retenha logs de acesso aos sistemas e equipamentos de rede, garantindo a rastreabilidade exigida pelo Provimento 213.',
  },
]
