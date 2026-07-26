export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  tags: string[];
  readTime: string;
  related?: string[];
}

export interface HelpTutorial {
  id: string;
  title: string;
  objective: string;
  steps: string[];
  bestPractices: string[];
  commonMistakes?: string[];
  tips?: string[];
  category: string;
  readTime: string;
  related?: string[];
}

export interface ModuleGuide {
  moduleId: string;
  title: string;
  objective: string;
  whenToUse: string;
  howToUse: string[];
  bestPractices: string[];
  commonMistakes: string[];
  tips: string[];
  related: string[];
  readTime: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "getting-started",
    title: "Primeiros passos no Atlas",
    category: "Primeiros Passos",
    excerpt: "Como começar a usar o Atlas em 5 minutos.",
    content:
      "O Atlas é seu sistema operacional pessoal. Em poucos minutos você configura o essencial e começa a acompanhar sua vida em um só lugar. Comece cadastrando uma conta em Finanças, depois crie categorias para organizar seus lançamentos, registre seu primeiro lançamento e explore a Dashboard para ver seus indicadores. Configure também seu perfil em Pessoal para habilitar o cálculo de IMC.",
    tags: ["inicio", "configuracao", "conta", "comecar", "primeiros-passos"],
    readTime: "3 min",
    related: ["dashboard-guide", "tut-first-steps", "tut-account"],
  },
  {
    id: "dashboard-guide",
    title: "Entendendo a Dashboard",
    category: "Dashboard",
    excerpt: "Como interpretar cada indicador da Dashboard.",
    content:
      "A Dashboard é sua central de comando. Ela abre com uma saudação dinâmica baseada no horário e no seu nome cadastrado em Perfil. Os cards de resumo mostram saldo total, receitas e despesas do mês, número de contas e total de transações. O card de saldo geral destaca a variação em relação ao mês anterior. A meta principal mostra progresso e valor restante. As mensagens inteligentes destacam pontos de atenção. Os cards de Planejamento, Objetivos e Patrimônio resumem outros módulos. A atividade recente lista seus últimos lançamentos. Cada card é clicável e leva ao módulo correspondente.",
    tags: ["dashboard", "indicadores", "saldo", "resumo", "saudacao", "metas"],
    readTime: "4 min",
    related: ["getting-started", "finance-guide", "objectives-guide"],
  },
  {
    id: "finance-guide",
    title: "Módulo Financeiro — Visão geral",
    category: "Financeiro",
    excerpt: "Contas, lançamentos, categorias, cartões, recorrências e favoritos.",
    content:
      "O módulo Financeiro é o coração do Atlas. Ele organiza contas, lançamentos, categorias, cartões, recorrências, favoritos e parcelamentos. Use a aba Lançamentos para registrar receitas e despesas, a aba Contas para cadastrar contas bancárias e carteiras, a aba Recorrências para automatizar despesas fixas, a aba Favoritos para atalhos de um clique e a aba Categorias para organizar tudo. Os gráficos de despesas por categoria e dos últimos 6 meses ajudam a identificar tendências.",
    tags: ["financas", "financeiro", "contas", "lancamentos", "categorias", "cartoes"],
    readTime: "5 min",
    related: ["tut-account", "tut-transaction", "tut-category", "tut-card"],
  },
  {
    id: "accounts-guide",
    title: "Contas — Como gerenciar",
    category: "Contas",
    excerpt: "Criar, editar e excluir contas bancárias e carteiras.",
    content:
      "As contas representam onde seu dinheiro está — contas corrente, poupança, carteiras digitais e dinheiro físico. Cada conta tem nome, cor e saldo inicial. O saldo total na Dashboard soma o saldo inicial mais todas as transações. Para criar: vá em Finanças > Contas > Adicionar. Para editar: clique na conta e depois no lápis. Para excluir: clique na conta e depois no ícone de lixeira — a exclusão não apaga transações vinculadas, mas elas deixam de contar no saldo da conta.",
    tags: ["contas", "conta", "saldo", "banco", "carteira"],
    readTime: "3 min",
    related: ["tut-account", "finance-guide"],
  },
  {
    id: "categories-guide",
    title: "Categorias — Como organizar",
    category: "Categorias",
    excerpt: "Criar e gerenciar categorias de receita e despesa.",
    content:
      "As categorias organizam seus lançamentos em grupos como Moradia, Alimentação, Transporte, Lazer. Cada categoria tem um nome, cor e tipo (receita ou despesa). O Atlas já vem com categorias padrão, mas você pode criar quantas quiser. Para criar: vá em Finanças > Categorias > Adicionar. Para editar ou excluir: clique na categoria. As categorias são usadas nos gráficos de despesas e no planejamento 50/30/20 através do mapeamento.",
    tags: ["categorias", "categoria", "organizacao", "receita", "despesa"],
    readTime: "3 min",
    related: ["tut-category", "planning-50-30-20", "finance-guide"],
  },
  {
    id: "transactions-guide",
    title: "Lançamentos — Como registrar",
    category: "Lançamentos",
    excerpt: "Receitas, despesas, transferências, filtros e edição.",
    content:
      "Os lançamentos são o registro de cada movimentação financeira. Cada lançamento tem descrição, valor, data, conta, categoria e tipo (receita, despesa ou transferência). Você pode adicionar notas e tags. Para registrar: clique em Novo Lançamento na Dashboard ou em Finanças. Use o campo de busca para filtrar por descrição, valor ou #tag. Use o filtro de período para ver lançamentos de 7 dias, 30 dias, este mês ou um intervalo personalizado. Para editar: clique no lançamento. Para excluir: clique no ícone de lixeira.",
    tags: ["lancamentos", "transacao", "receita", "despesa", "transferencia", "filtro"],
    readTime: "4 min",
    related: ["tut-transaction", "finance-guide", "accounts-guide"],
  },
  {
    id: "objectives-guide",
    title: "Objetivos — Como acompanhar metas",
    category: "Objetivos",
    excerpt: "Criar, acompanhar e concluir objetivos pessoais.",
    content:
      "Os objetivos são metas pessoais com acompanhamento de progresso. Existem quatro tipos: financeiro (valor alvo), quantidade (número alvo), recorrente (check-in periódico) e check-in (hábito). Para criar: vá em Objetivos > Novo. Escolha o tipo, defina a meta e o prazo. O Atlas calcula o progresso automaticamente. Para concluir: marque como concluído quando atingir a meta. Para acompanhar: o card na Dashboard mostra objetivos ativos e concluídos.",
    tags: ["objetivos", "meta", "metas", "progresso", "check-in", "recorrente"],
    readTime: "4 min",
    related: ["tut-objective", "dashboard-guide"],
  },
  {
    id: "projects-guide",
    title: "Projetos — Como gerenciar",
    category: "Projetos",
    excerpt: "Criar projetos, adicionar tarefas e acompanhar progresso.",
    content:
      "Os projetos acompanham iniciativas com valor alvo e tarefas vinculadas. Cada projeto tem título, descrição, valor alvo, valor atual e prazo. Para criar: vá em Projetos > Novo. Para editar: clique no projeto. Para excluir: clique no ícone de lixeira. Dentro de cada projeto você cria tarefas com status (pendente, em andamento, concluída). O progresso do projeto é calculado automaticamente com base nas tarefas e no valor aportado.",
    tags: ["projetos", "projeto", "tarefas", "tarefa", "progresso"],
    readTime: "4 min",
    related: ["tut-project", "dashboard-guide"],
  },
  {
    id: "pessoal-guide",
    title: "Pessoal — Saúde e evolução",
    category: "Pessoal",
    excerpt: "Perfil, peso, altura, IMC, treinos e histórico.",
    content:
      "O módulo Pessoal acompanha sua evolução corporal. O cartão de perfil mostra nome, data de nascimento, idade, altura, peso atual, peso objetivo e IMC. Para editar o perfil: clique no lápis. Para registrar peso: vá na aba Saúde e clique em Registrar. Para registrar treino: vá na aba Treinos e clique em Registrar. O IMC é calculado automaticamente quando você tem altura e peso cadastrados. A aba Estatísticas mostra resumos e a aba Linha do tempo mostra sua evolução cronológica.",
    tags: ["pessoal", "perfil", "peso", "altura", "imc", "treino", "saude"],
    readTime: "4 min",
    related: ["tut-weight", "tut-workout", "dashboard-guide"],
  },
  {
    id: "account-security",
    title: "Minha Conta e Segurança",
    category: "Minha Conta",
    excerpt: "Alterar nome, senha, sessão e privacidade.",
    content:
      "A página Minha Conta gerencia suas informações pessoais e segurança. Você pode alterar seu nome, e-mail e senha. A sessão ativa é mostrada com opção de sair. Seus dados são protegidos por Row Level Security no banco de dados — cada usuário só vê e edita seus próprios registros. Ninguém mais, nem administradores, podem acessar seus dados. Para alterar a senha: vá em Minha Conta > Segurança > Alterar senha. Para sair de todos os dispositivos: encerre a sessão.",
    tags: ["minha-conta", "conta", "seguranca", "senha", "sessao", "privacidade", "dados"],
    readTime: "3 min",
    related: ["faq-1", "faq-5", "faq-6"],
  },
  {
    id: "settings-guide",
    title: "Configurações — Aparência e preferências",
    category: "Configurações",
    excerpt: "Tema, backup, histórico e informações do sistema.",
    content:
      "As Configurações têm quatro seções. Aparência permite alternar entre tema claro, escuro e sistema — a preferência é salva automaticamente. Backup permite exportar todos os seus dados em um arquivo JSON e importar de volta quando precisar. Sistema mostra o histórico de atividades recentes. Sobre mostra a versão do Atlas, data da build, banco de dados e novidades da versão atual.",
    tags: ["configuracoes", "tema", "backup", "sistema", "aparencia"],
    readTime: "3 min",
    related: ["backup-guide", "about-guide"],
  },
  {
    id: "backup-guide",
    title: "Como fazer backup dos seus dados",
    category: "Backup",
    excerpt: "Exporte e importe seus dados com segurança.",
    content:
      "O backup é sua rede de segurança. Vá em Configurações > Backup. Clique em Exportar Backup para baixar um arquivo JSON com todos os seus dados — contas, lançamentos, categorias, objetivos, projetos, treinos, pesos e mais. Para restaurar: clique em Importar Backup, selecione o arquivo e confirme. A restauração substitui os dados atuais, então use com cuidado. Recomendamos exportar um backup mensalmente ou antes de qualquer mudança grande.",
    tags: ["backup", "exportar", "importar", "configuracao", "dados", "restaurar"],
    readTime: "2 min",
    related: ["settings-guide", "faq-1", "faq-2"],
  },
  {
    id: "about-guide",
    title: "Sobre o Atlas",
    category: "Sobre",
    excerpt: "O que é o Atlas, objetivo e versão atual.",
    content:
      "O Atlas é um sistema operacional pessoal que reúne finanças, objetivos, projetos, saúde e patrimônio em uma única interface. O objetivo é que você entenda sua situação completa em segundos, sem precisar abrir cinco abas. Tudo o que você cadastra pertence a você, fica protegido por segurança em nível de linha e pode ser exportado quando quiser. A versão atual é 1.0.0 (MVP). Acesse a página Sobre no menu lateral para ver informações detalhadas do sistema.",
    tags: ["sobre", "atlas", "versao", "sistema", "mvp"],
    readTime: "2 min",
    related: ["getting-started", "settings-guide"],
  },
  {
    id: "command-palette",
    title: "Usando a Central de Ações (Ctrl+K)",
    category: "Primeiros Passos",
    excerpt: "Acesse qualquer ação rapidamente com Ctrl+K.",
    content:
      "Pressione Ctrl+K (ou Cmd+K no Mac) em qualquer lugar para abrir a central de ações. Sem texto, mostra ações rápidas e navegação para todos os módulos. Com texto, funciona como busca global, localizando lançamentos, metas, projetos e atalhos. Use as setas para navegar e Enter para selecionar. Pressione Esc para fechar.",
    tags: ["atalho", "busca", "ctrl+k", "command", "acoes"],
    readTime: "1 min",
    related: ["getting-started", "faq-6"],
  },
  {
    id: "planning-50-30-20",
    title: "Planejamento Financeiro 50/30/20",
    category: "Planejamento",
    excerpt: "Como usar a regra 50/30/20 no Atlas.",
    content:
      "A regra 50/30/20 é um método simples de orçamento: 50% para essenciais (moradia, alimentação, transporte), 30% para investimentos e 20% para pessoal (lazer, hobbies). Vá em Planejamento, informe sua renda mensal e o Atlas divide automaticamente. Mapeie suas categorias para cada grupo. O painel mostra se você está dentro, acima ou abaixo do orçado em cada grupo. Revise mensalmente para manter o controle.",
    tags: ["planejamento", "50-30-20", "orcamento", "financas", "renda"],
    readTime: "4 min",
    related: ["finance-guide", "categories-guide", "tut-planning"],
  },
  {
    id: "patrimony-guide",
    title: "Como registrar seu patrimônio",
    category: "Patrimônio",
    excerpt: "Acompanhe seus investimentos e aportes.",
    content:
      "O módulo Patrimônio registra seus aportes e investimentos. Para adicionar: vá em Patrimônio > Adicionar Aporte. Informe o valor, categoria (reserva, ações, CDB, etc.), instituição e data. O Atlas gera um histórico mensal e mostra o total aportado no mês na Dashboard. Use a categoria correta para análise por tipo de investimento.",
    tags: ["patrimonio", "investimento", "aporte", "reserva", "acoes"],
    readTime: "3 min",
    related: ["tut-patrimony", "dashboard-guide"],
  },
  {
    id: "reports-guide",
    title: "Como usar os Relatórios",
    category: "Relatórios",
    excerpt: "Entenda os indicadores e comparativos.",
    content:
      "Vá em Relatórios. Use as abas para navegar entre Resumo Executivo, Financeiro, Pessoal, Objetivos e Projetos. Use Comparativos para analisar períodos diferentes lado a lado. Exporte relatórios em PDF, Excel ou CSV usando o botão de exportação. Revise mensalmente para identificar tendências e tomar decisões melhores.",
    tags: ["relatorio", "analise", "comparativo", "exportar", "pdf", "excel"],
    readTime: "3 min",
    related: ["dashboard-guide", "finance-guide"],
  },
];

export const HELP_TUTORIALS: HelpTutorial[] = [
  {
    id: "tut-first-steps",
    title: "Primeiros passos",
    objective: "Configurar o Atlas do zero e fazer o primeiro lançamento.",
    steps: [
      "Crie sua primeira conta em Finanças > Contas > Adicionar.",
      "Cadastre suas categorias de receita e despesa em Finanças > Categorias.",
      "Registre seu primeiro lançamento clicando em Novo Lançamento.",
      "Configure seu perfil em Pessoal > Perfil (nome, altura e peso).",
      "Explore a Dashboard para ver seus indicadores atualizados.",
    ],
    bestPractices: [
      "Cadastre contas reais para acompanhar seu saldo verdadeiro.",
      "Use categorias específicas para facilitar a análise.",
      "Configure seu perfil logo no início para habilitar o IMC.",
    ],
    commonMistakes: [
      "Esquecer de cadastrar o saldo inicial correto da conta.",
      "Não configurar o perfil antes de registrar o peso.",
    ],
    tips: [
      "Use Ctrl+K para navegar rapidamente entre módulos.",
      "A Dashboard atualiza automaticamente ao cadastrar novos dados.",
    ],
    category: "Primeiros Passos",
    readTime: "5 min",
    related: ["getting-started", "dashboard-guide"],
  },
  {
    id: "tut-account",
    title: "Cadastrar uma conta",
    objective: "Adicionar uma conta bancária ou carteira ao Atlas.",
    steps: [
      "Vá em Finanças > Contas.",
      "Clique em Adicionar Conta.",
      "Informe o nome (ex.: Conta Itaú, Nubank, Carteira).",
      "Escolha uma cor para identificar a conta.",
      "Informe o saldo inicial correto.",
      "Clique em Salvar.",
    ],
    bestPractices: [
      "Use o saldo inicial correto para cálculos precisos.",
      "Dê nomes claros como 'Conta Itaú' ou 'Nubank'.",
      "Cadastre todas as contas que você usa no dia a dia.",
    ],
    commonMistakes: [
      "Informar saldo inicial zerado quando a conta já tem dinheiro.",
      "Esquecer de cadastrar carteiras digitais como contas.",
    ],
    tips: ["Você pode editar a conta a qualquer momento clicando nela."],
    category: "Contas",
    readTime: "2 min",
    related: ["accounts-guide", "finance-guide"],
  },
  {
    id: "tut-transaction",
    title: "Registrar um lançamento",
    objective: "Adicionar uma receita, despesa ou transferência.",
    steps: [
      "Clique em Novo Lançamento na Dashboard ou em Finanças.",
      "Escolha o tipo: receita, despesa ou transferência.",
      "Informe a descrição (ex.: Salário, Mercado, Aluguel).",
      "Digite o valor.",
      "Selecione a conta e a categoria.",
      "Informe a data (padrão: hoje).",
      "Opcionalmente, adicione notas e tags.",
      "Clique em Salvar.",
    ],
    bestPractices: [
      "Registre lançamentos no dia para não esquecer.",
      "Use categorias específicas para facilitar a análise.",
      "Adicione tags para buscas rápidas com #nome.",
    ],
    commonMistakes: [
      "Esquecer de registrar pequenas despesas.",
      "Misturar receitas e despesas na mesma categoria.",
    ],
    tips: [
      "Use a busca com #nome da tag para filtrar rapidamente.",
      "Você pode duplicar lançamentos recorrentes com os Favoritos.",
    ],
    category: "Lançamentos",
    readTime: "3 min",
    related: ["transactions-guide", "finance-guide"],
  },
  {
    id: "tut-category",
    title: "Criar uma categoria",
    objective: "Organizar lançamentos em grupos.",
    steps: [
      "Vá em Finanças > Categorias.",
      "Clique em Adicionar Categoria.",
      "Informe o nome (ex.: Moradia, Alimentação).",
      "Escolha o tipo: receita ou despesa.",
      "Escolha uma cor para identificação visual.",
      "Clique em Salvar.",
    ],
    bestPractices: [
      "Use nomes claros e específicos.",
      "Crie categorias para todos os tipos de gasto recorrente.",
      "Mapeie as categorias no Planejamento 50/30/20.",
    ],
    commonMistakes: [
      "Criar categorias genéricas demais (ex.: 'Outros').",
      "Esquecer de mapear categorias no planejamento.",
    ],
    tips: ["O Atlas já vem com categorias padrão — você pode editá-las."],
    category: "Categorias",
    readTime: "2 min",
    related: ["categories-guide", "planning-50-30-20"],
  },
  {
    id: "tut-card",
    title: "Cadastrar um cartão",
    objective: "Registrar um cartão de crédito com limite e datas.",
    steps: [
      "Vá em Finanças > Cartões.",
      "Clique em Adicionar Cartão.",
      "Informe nome, banco e bandeira.",
      "Informe o limite total do cartão.",
      "Configure o dia de fechamento e vencimento da fatura.",
      "Clique em Salvar.",
    ],
    bestPractices: [
      "Mantenha o limite atualizado.",
      "Use os dias corretos de fechamento para cálculos precisos.",
      "Cadastre todos os cartões que usa.",
    ],
    commonMistakes: [
      "Informar limite incorreto.",
      "Confundir dia de fechamento com vencimento.",
    ],
    tips: ["O Atlas calcula o limite disponível somando as parcelas pendentes."],
    category: "Cartões",
    readTime: "2 min",
    related: ["finance-guide", "card-limit"],
  },
  {
    id: "tut-objective",
    title: "Criar um objetivo",
    objective: "Definir uma meta pessoal com acompanhamento de progresso.",
    steps: [
      "Vá em Objetivos.",
      "Clique em Novo Objetivo.",
      "Escolha o tipo: financeiro, quantidade, recorrente ou check-in.",
      "Defina a meta (valor alvo ou quantidade).",
      "Defina o prazo (data limite).",
      "Clique em Salvar.",
    ],
    bestPractices: [
      "Defina prazos realistas.",
      "Revise semanalmente.",
      "Use objetivos automáticos quando possível.",
    ],
    commonMistakes: [
      "Criar metas irreais.",
      "Não dar feedback de progresso.",
      "Esquecer de marcar como concluído ao atingir.",
    ],
    tips: ["Objetivos aparecem na Dashboard para lembrete constante."],
    category: "Objetivos",
    readTime: "3 min",
    related: ["objectives-guide", "dashboard-guide"],
  },
  {
    id: "tut-project",
    title: "Criar um projeto",
    objective: "Acompanhar uma iniciativa com valor alvo e tarefas.",
    steps: [
      "Vá em Projetos.",
      "Clique em Novo Projeto.",
      "Informe título e descrição.",
      "Defina o valor alvo (se aplicável).",
      "Defina o prazo (opcional).",
      "Clique em Salvar.",
      "Dentro do projeto, adicione tarefas com status.",
    ],
    bestPractices: [
      "Defina valores realistas.",
      "Atualize aportes mensalmente.",
      "Mantenha as tarefas atualizadas.",
    ],
    commonMistakes: [
      "Não atualizar progresso.",
      "Misturar projetos com objetivos.",
    ],
    tips: ["O progresso do projeto é calculado com base nas tarefas concluídas."],
    category: "Projetos",
    readTime: "3 min",
    related: ["projects-guide", "dashboard-guide"],
  },
  {
    id: "tut-workout",
    title: "Registrar um treino",
    objective: "Acompanhar sua rotina de exercícios.",
    steps: [
      "Vá em Pessoal > Treinos.",
      "Clique em Registrar Treino.",
      "Selecione a atividade (musculação, corrida, jiu-jitsu, etc.).",
      "Informe a data e duração.",
      "Marque os grupos musculares trabalhados.",
      "Clique em Salvar.",
    ],
    bestPractices: [
      "Registre logo após o treino.",
      "Marque os grupos musculares para análise.",
      "Seja consistente para acompanhar a evolução.",
    ],
    commonMistakes: [
      "Registrar treino dias depois (esquece detalhes).",
      "Não marcar grupos musculares.",
    ],
    tips: ["A linha do tempo mostra sua evolução cronológica."],
    category: "Pessoal",
    readTime: "2 min",
    related: ["pessoal-guide", "tut-weight"],
  },
  {
    id: "tut-weight",
    title: "Registrar peso",
    objective: "Acompanhar a evolução do peso e IMC.",
    steps: [
      "Vá em Pessoal > Saúde.",
      "Clique em Registrar Peso.",
      "Informe o peso atual.",
      "Confirme a data (padrão: hoje).",
      "Clique em Salvar.",
    ],
    bestPractices: [
      "Pese-se sempre no mesmo horário.",
      "Cadastre sua altura no perfil para cálculo do IMC.",
      "Registre pelo menos uma vez por semana.",
    ],
    commonMistakes: [
      "Registrar peso irregularmente.",
      "Esquecer de cadastrar altura para IMC.",
    ],
    tips: ["O IMC é calculado automaticamente se você tem altura e peso."],
    category: "Pessoal",
    readTime: "1 min",
    related: ["pessoal-guide", "tut-workout"],
  },
  {
    id: "tut-planning",
    title: "Planejamento Financeiro",
    objective: "Configurar o orçamento 50/30/20.",
    steps: [
      "Vá em Planejamento.",
      "Informe sua renda mensal.",
      "Ajuste as porcentagens se necessário (padrão: 50/30/20).",
      "Mapeie suas categorias para cada grupo (Essenciais, Investimentos, Pessoal).",
      "Acompanhe o status no painel.",
    ],
    bestPractices: [
      "Revise mensalmente.",
      "Mapeie todas as categorias para análise completa.",
      "Ajuste as porcentagens conforme sua realidade.",
    ],
    commonMistakes: [
      "Não mapear todas as categorias.",
      "Esquecer de atualizar a renda mensal.",
    ],
    tips: ["O painel destaca em vermelho quando você ultrapassa o orçado."],
    category: "Planejamento",
    readTime: "3 min",
    related: ["planning-50-30-20", "categories-guide"],
  },
  {
    id: "tut-patrimony",
    title: "Registrar patrimônio",
    objective: "Adicionar aportes e acompanhar investimentos.",
    steps: [
      "Vá em Patrimônio.",
      "Clique em Adicionar Aporte.",
      "Informe o valor.",
      "Selecione a categoria (reserva, ações, CDB, etc.).",
      "Informe a instituição e a data.",
      "Clique em Salvar.",
    ],
    bestPractices: [
      "Registre todos os aportes mensais.",
      "Use a categoria correta para análise por tipo.",
      "Atualize regularmente para acompanhar a evolução.",
    ],
    commonMistakes: [
      "Esquecer de registrar aportes pequenos.",
      "Misturar categorias de investimento.",
    ],
    tips: ["O total aportado no mês aparece na Dashboard."],
    category: "Patrimônio",
    readTime: "2 min",
    related: ["patrimony-guide", "dashboard-guide"],
  },
];

export const MODULE_GUIDES: ModuleGuide[] = [
  {
    moduleId: "dashboard",
    title: "Dashboard",
    objective: "Visão geral e rápida da sua vida financeira e pessoal.",
    whenToUse:
      "Use a Dashboard diariamente para entender sua situação em segundos. É o ponto de partida ideal para ver indicadores, mensagens inteligentes e atividade recente.",
    howToUse: [
      "Acesse pela barra lateral ou pelo logo no cabeçalho.",
      "Veja saldo, receitas, despesas, contas e transações nos cards.",
      "Confira as mensagens inteligentes para pontos de atenção.",
      "Clique nos cards para ir ao módulo detalhado.",
    ],
    bestPractices: [
      "Acesse diariamente para acompanhar tendências.",
      "Use as mensagens como lembretes de ação.",
      "Clique nos cards para detalhar qualquer indicador.",
    ],
    commonMistakes: [
      "Ignorar as mensagens inteligentes.",
      "Não cadastrar contas e dados para os indicadores.",
    ],
    tips: [
      "A saudação muda conforme o horário do dia.",
      "O card de saldo geral mostra a variação em relação ao mês anterior.",
    ],
    related: ["Finanças", "Objetivos", "Pessoal"],
    readTime: "2 min",
  },
  {
    moduleId: "financas",
    title: "Finanças",
    objective: "Gerenciar contas, lançamentos, cartões e categorias.",
    whenToUse:
      "Use o módulo Financeiro para registrar toda movimentação de dinheiro — receitas, despesas, transferências — e organizar em categorias e contas.",
    howToUse: [
      "Cadastre contas em Finanças > Contas.",
      "Crie categorias em Finanças > Categorias.",
      "Registre lançamentos clicando em Novo Lançamento.",
      "Use cartões para controle de crédito e parcelamentos.",
      "Configure recorrências para despesas fixas.",
      "Use favoritos para atalhos de um clique.",
    ],
    bestPractices: [
      "Registre lançamentos no dia.",
      "Use categorias específicas.",
      "Configure recorrências para despesas fixas.",
      "Revise os gráficos mensalmente.",
    ],
    commonMistakes: [
      "Não cadastrar o saldo inicial correto.",
      "Esquecer de registrar pequenas despesas.",
      "Misturar receitas e despesas na mesma categoria.",
    ],
    tips: [
      "Use a busca com #tag para filtrar rapidamente.",
      "Os gráficos atualizam automaticamente ao cadastrar lançamentos.",
    ],
    related: ["Contas", "Categorias", "Cartões", "Planejamento"],
    readTime: "4 min",
  },
  {
    moduleId: "objetivos",
    title: "Objetivos",
    objective: "Definir e acompanhar metas pessoais e financeiras.",
    whenToUse:
      "Use o módulo Objetivos quando quiser definir uma meta — financeira, de quantidade, recorrente ou de check-in — e acompanhar o progresso ao longo do tempo.",
    howToUse: [
      "Crie objetivos de diferentes tipos.",
      "Acompanhe o progresso automático.",
      "Use check-in para hábitos recorrentes.",
      "Marque como concluído ao atingir a meta.",
    ],
    bestPractices: [
      "Defina prazos realistas.",
      "Revise semanalmente.",
      "Use objetivos automáticos quando possível.",
    ],
    commonMistakes: [
      "Criar metas irreais.",
      "Não dar feedback de progresso.",
      "Esquecer de marcar como concluído.",
    ],
    tips: ["Objetivos ativos aparecem na Dashboard para lembrete constante."],
    related: ["Metas", "Finanças", "Dashboard"],
    readTime: "3 min",
  },
  {
    moduleId: "projetos",
    title: "Projetos",
    objective: "Acompanhar iniciativas com valor alvo e tarefas.",
    whenToUse:
      "Use o módulo Projetos para gerenciar iniciativas que precisam de acompanhamento de progresso — com valor alvo, tarefas e prazos.",
    howToUse: [
      "Crie projetos com título, descrição e valor alvo.",
      "Adicione tarefas com status (pendente, em andamento, concluída).",
      "Registre aportes ao longo do tempo.",
      "Acompanhe o progresso automático.",
    ],
    bestPractices: [
      "Defina valores realistas.",
      "Atualize aportes mensalmente.",
      "Mantenha as tarefas atualizadas.",
    ],
    commonMistakes: [
      "Não atualizar progresso.",
      "Misturar projetos com objetivos.",
    ],
    tips: ["O progresso do projeto é calculado com base nas tarefas concluídas."],
    related: ["Finanças", "Patrimônio", "Dashboard"],
    readTime: "3 min",
  },
  {
    moduleId: "pessoal",
    title: "Pessoal",
    objective: "Acompanhar peso, treinos e evolução corporal.",
    whenToUse:
      "Use o módulo Pessoal para acompanhar sua saúde — peso, IMC, treinos — e ver sua evolução ao longo do tempo.",
    howToUse: [
      "Edite seu perfil em Pessoal > Perfil.",
      "Registre peso regularmente na aba Saúde.",
      "Cadastre treinos após cada sessão na aba Treinos.",
      "Acompanhe a timeline na aba Linha do tempo.",
    ],
    bestPractices: [
      "Pese-se no mesmo horário.",
      "Registre treinos no dia.",
      "Configure meta de peso no perfil.",
      "Cadastre altura para cálculo do IMC.",
    ],
    commonMistakes: [
      "Registrar peso irregularmente.",
      "Esquecer de cadastrar altura para IMC.",
    ],
    tips: ["O IMC é calculado automaticamente quando você tem altura e peso."],
    related: ["Minha Vida", "Dashboard"],
    readTime: "3 min",
  },
  {
    moduleId: "relatorios",
    title: "Relatórios",
    objective: "Transformar dados em informações para tomada de decisão.",
    whenToUse:
      "Use o módulo Relatórios mensalmente para analisar tendências, comparar períodos e exportar dados para arquivamento.",
    howToUse: [
      "Navegue entre as 5 áreas (Resumo, Financeiro, Pessoal, Objetivos, Projetos).",
      "Use comparativos para análise temporal.",
      "Exporte relatórios em PDF, Excel ou CSV.",
    ],
    bestPractices: [
      "Revise mensalmente.",
      "Use comparativos para identificar tendências.",
      "Exporte relatórios para arquivamento.",
    ],
    commonMistakes: [
      "Focar em gráficos ao invés de indicadores.",
      "Não usar comparativos.",
    ],
    tips: ["A exportação em PDF é ideal para compartilhar com seu contador."],
    related: ["Dashboard", "Finanças"],
    readTime: "3 min",
  },
  {
    moduleId: "configuracoes",
    title: "Configurações",
    objective: "Gerenciar aparência, backup, sistema e informações.",
    whenToUse:
      "Use as Configurações para personalizar o tema, fazer backup dos dados, ver o histórico de atividades e consultar informações do sistema.",
    howToUse: [
      "Ajuste o tema em Aparência (claro, escuro ou sistema).",
      "Exporte e importe backups em Backup.",
      "Veja o histórico de atividades em Sistema.",
      "Consulte a versão e novidades em Sobre.",
    ],
    bestPractices: [
      "Faça backups regularmente.",
      "Mantenha o Atlas atualizado.",
      "Exporte backup antes de formatar o dispositivo.",
    ],
    commonMistakes: [
      "Não fazer backup dos dados.",
      "Esquecer de exportar antes de formatar.",
    ],
    tips: ["A página Sobre mostra a versão, data da build e banco de dados."],
    related: ["Backup", "Sobre"],
    readTime: "2 min",
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-1",
    question: "Esqueci minha senha, como recuperar?",
    answer:
      "Na tela de login, clique em 'Esqueci a senha'. Informe seu e-mail e enviaremos um link de recuperação. Acesse o link e cadastre uma nova senha.",
    category: "Segurança",
  },
  {
    id: "faq-2",
    question: "Como alterar meu nome?",
    answer:
      "Vá em Minha Conta ou Pessoal > Perfil e clique no lápis de edição. Altere o nome e clique em Salvar. O nome atualiza em toda a aplicação, incluindo a saudação da Dashboard.",
    category: "Minha Conta",
  },
  {
    id: "faq-3",
    question: "Como excluir uma conta bancária?",
    answer:
      "Vá em Finanças > Contas, clique na conta que deseja excluir e depois no ícone de lixeira. Confirme a exclusão. As transações vinculadas não são apagadas, mas deixam de contar no saldo da conta.",
    category: "Contas",
  },
  {
    id: "faq-4",
    question: "Posso recuperar dados excluídos?",
    answer:
      "Não é possível recuperar registros excluídos individualmente. Por isso, recomendamos exportar um backup regularmente em Configurações > Backup. Se você tiver um backup, pode restaurá-lo integralmente.",
    category: "Backup",
  },
  {
    id: "faq-5",
    question: "Meus dados são privados?",
    answer:
      "Sim. Todos os seus dados são protegidos por Row Level Security no banco de dados. Cada usuário só vê e edita seus próprios registros. Ninguém mais, nem administradores, podem acessar seus dados.",
    category: "Segurança",
  },
  {
    id: "faq-6",
    question: "Como funciona a sincronização?",
    answer:
      "O Atlas usa um banco de dados na nuvem (Supabase). Seus dados são salvos automaticamente quando você está online. Faça login com a mesma conta em outro dispositivo para acessar seus dados.",
    category: "Sistema",
  },
  {
    id: "faq-7",
    question: "Como faço backup dos meus dados?",
    answer:
      "Vá em Configurações > Backup e clique em Exportar Backup. Um arquivo JSON será baixado com todos os seus dados.",
    category: "Backup",
  },
  {
    id: "faq-8",
    question: "Como restauro um backup?",
    answer:
      "Vá em Configurações > Backup, clique em Importar Backup e selecione o arquivo JSON. Confirme a restauração quando solicitado. A página será recarregada após a restauração.",
    category: "Backup",
  },
  {
    id: "faq-9",
    question: "O Atlas funciona offline?",
    answer:
      "O Atlas tem suporte básico a offline via PWA. As páginas visitadas ficam em cache e podem ser abertas sem conexão. Operações que dependem do banco de dados exigem conexão.",
    category: "Sistema",
  },
  {
    id: "faq-10",
    question: "Como funciona o planejamento 50/30/20?",
    answer:
      "A regra divide sua renda em 50% essenciais, 30% investimentos e 20% pessoal. Configure em Planejamento com sua renda mensal e mapeie suas categorias para cada grupo.",
    category: "Finanças",
  },
  {
    id: "faq-11",
    question: "Como calcular o IMC?",
    answer:
      "Cadastre sua altura em Pessoal > Perfil. O Atlas calcula o IMC automaticamente ao registrar seu peso. O resultado aparece no cartão de perfil e na aba Saúde.",
    category: "Pessoal",
  },
  {
    id: "faq-12",
    question: "Como uso a busca global?",
    answer:
      "Pressione Ctrl+K (ou Cmd+K no Mac) em qualquer lugar para abrir a central de ações. Digite para buscar em todos os módulos ou use as setas para navegar.",
    category: "Sistema",
  },
  {
    id: "faq-13",
    question: "Posso exportar relatórios?",
    answer:
      "Sim, vá em Relatórios e use o botão de exportação. Escolha PDF, Excel ou CSV conforme sua necessidade.",
    category: "Relatórios",
  },
  {
    id: "faq-14",
    question: "Como funcionam os objetivos automáticos?",
    answer:
      "Objetivos automáticos conectam-se às métricas do Atlas (saldo, treinos, peso) e atualizam o progresso sem intervenção manual. Crie um objetivo e escolha o tipo automático quando disponível.",
    category: "Objetivos",
  },
  {
    id: "faq-15",
    question: "Como alterar minha senha?",
    answer:
      "Vá em Minha Conta > Segurança > Alterar senha. Informe a senha atual e a nova senha. A nova senha deve ter pelo menos 6 caracteres.",
    category: "Segurança",
  },
  {
    id: "faq-16",
    question: "Como instalar o Atlas como aplicativo?",
    answer:
      "O Atlas é uma PWA instalável. No Chrome, clique no ícone de instalação na barra de endereço ou use o menu > Instalar. No mobile, use Adicionar à tela inicial. O app funciona como aplicativo nativo.",
    category: "Sistema",
  },
];

export const HELP_CATEGORIES = [
  "Primeiros Passos",
  "Dashboard",
  "Financeiro",
  "Contas",
  "Categorias",
  "Lançamentos",
  "Cartões",
  "Objetivos",
  "Projetos",
  "Pessoal",
  "Minha Conta",
  "Configurações",
  "Segurança",
  "Backup",
  "Planejamento",
  "Patrimônio",
  "Relatórios",
  "Sobre",
];

export const KEYBOARD_SHORTCUTS = [
  { keys: "Ctrl + K", description: "Abrir central de ações e busca global" },
  { keys: "Esc", description: "Fechar central de ações" },
];
