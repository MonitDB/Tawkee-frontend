# Tawkee

## Estado Atual

### Visão Geral
A API Tawkee é um sistema backend sofisticado para uma plataforma inteligente de automação de comunicação, que aprimora interações multicanais por meio de estratégias adaptativas baseadas em IA. O sistema tem como foco principal a automação do atendimento ao cliente via WhatsApp usando inteligência artificial.

#### Arquitetura
- Framework da Aplicação: NestJS (v11), um framework progressivo para Node.js com TypeScript
- Acesso ao Banco de Dados: Prisma ORM para operações seguras com tipagem
- Autenticação: Autenticação baseada em JWT com blacklist de tokens
- Orquestração de Serviços: Padrão de injeção de dependência com módulos bem separados
- Agendamento de Tarefas: NestJS Scheduler para lidar com tarefas recorrentes

#### Padrões de Projeto
- Design Modular: A aplicação é dividida em módulos de funcionalidades
- Padrão Controller-Service: Separação clara entre o tratamento de requisições HTTP e a lógica de negócio
- Padrão Repository: Operações de banco de dados abstraídas com o Prisma
- Padrão Middleware: Para validação de requisições, autenticação e tratamento de erros
- Padrão Strategy: Para diferentes estilos de comunicação e tipos de agentes

#### Tecnologias
- Runtime: Node.js com TypeScript
- Framework: NestJS para desenvolvimento da API
- Banco de Dados: PostgreSQL como banco principal
- ORM: Prisma para interação com o banco e gestão de esquema
- Integração com IA: OpenAI API (usando GPT-4o) para respostas geradas por IA
- Integração com WhatsApp: Evolution API para conexão com o WhatsApp
- Autenticação: Tokens JWT com expiração e blacklist
- Validação: Class-validator e class-transformer para validação de DTOs
- Documentação: Swagger/OpenAPI para documentação da API
- Ambiente: Configuração gerenciada pelo ConfigService

#### Dependências Externas
- OpenAI API: Para geração de respostas inteligentes
- Evolution API: Para tratamento de mensagens WhatsApp e geração de QR code

#### Esquema do Banco de Dados
O banco de dados é estruturado com as seguintes entidades principais:

1. User: Autenticação e gerenciamento de usuários
2. Workspace: Contêiner para agentes, interações e permissões
3. Agent: Assistentes com comportamentos, estilos de comunicação e tipos específicos
4. Channel: Canais de comunicação (principalmente WhatsApp) conectados aos agentes
5. Chat: Diálogos entre usuários e agentes por meio dos canais
6. Message: Mensagens individuais dentro das conversas
7. Interaction: Acompanhamento de estados e métricas de conversas
8. AgentSettings: Opções de configuração dos agentes
9. AgentWebhooks: Pontos de integração com sistemas externos
10. BlacklistToken: Armazenamento de tokens JWT inválidos
11. WebhookEvents: Eventos recebidos da Evolution API

#### Funcionalidades Implementadas

##### Autenticação e Gerenciamento de Usuários
- Endpoints de registro, login e logout
- Autenticação baseada em tokens JWT
- Blacklist de token no logout
- Recuperação de perfil

##### Gerenciamento de Espaços de Trabalho
- Operações CRUD em espaços de trabalho
- Alocação e acompanhamento de créditos

##### Gerenciamento de Agentes
- Criação, leitura, atualização e exclusão de agentes
- Funcionalidade de ativação/desativação
- Acompanhamento de gastos de crédito
- Tipos de agentes customizáveis (SUPORTE, VENDAS, PESSOAL)
- Estilos de comunicação (NORMAL, FORMAL, DESCONTRAÍDO)
- Configuração de contexto profissional (cargo, site, descrição)

##### Gerenciamento de Canais (WhatsApp)
- Conexão de canal WhatsApp via QR code
- Atualização do QR code
- Monitoramento de status de conexão
- Desconexão de canal (sem exclusão)
- Exclusão de canal com limpeza apropriada

##### Conversa e Mensagens
- Criação automática de conversas a partir de mensagens recebidas no WhatsApp
- Recuperação do histórico de mensagens
- Função de assumir o controle humano (início/parada do atendimento humano)
- Envio manual de mensagens via UI para o WhatsApp
- Tratamento avançado de erros e recuperação durante a criação de conversas
- Validação de entrada robusta e registro detalhado de erros

##### Conversa com IA
- Geração de resposta com IA sensível ao contexto
- Guias de estilo de comunicação com base no tipo de agente
- Acompanhamento do histórico da conversa e inclusão nos prompts
- Geração de respostas com o modelo GPT-4o da OpenAI
- Tratamento de falhas da API com fallback

##### Processamento de Webhooks
- Endpoint seguro de webhook para a Evolution API
- Detecção avançada de tipos de mensagens (texto, áudio, imagem, localização etc.)
- Filtro de mensagens de grupo
- Monitoramento de estado de conexão
- Tratamento e recuperação de erros abrangente
- Log detalhado ao longo do fluxo do webhook

##### Gerenciamento de Interações
- Criação automática de interações para novas conversas
- Acompanhamento de status (EM_ANDAMENTO, ALERTA, RESOLVIDO, ENCERRADO)
- Detecção de inatividade e alertas automáticos
- Endpoints para resolução de interações

##### Tarefas Agendadas
- Limpeza de tokens expirados na blacklist
- Processamento de interações inativas

##### Limitações e Considerações Atuais
1. Timeouts de Transações: Erros ocasionais de timeout observados em tarefas agendadas (conforme logs)
2. Tratamento de Mídia: Suporte básico atual para mensagens com mídia, com potencial de expansão
3. Mensagens de Grupo: Mensagens de grupo são identificadas, mas ainda não totalmente processadas
4. Escalabilidade: Sistema projetado para escalonamento horizontal, mas requer configuração de balanceador de carga

##### Requisitos de Ambiente
A aplicação requer as seguintes variáveis de ambiente:

- DATABASE_URL: String de conexão com o PostgreSQL
- OPENAI_API_KEY: Para geração de respostas com IA
- EVOLUTION_API_URL: Endpoint da API do WhatsApp
- EVOLUTION_API_KEY: Autenticação para a API do WhatsApp
- JWT_SECRET: Para assinar tokens de autenticação
- WEBHOOK_TOKEN: Para autenticação do webhook
- OUR_ADDRESS: URL publicamente acessível da aplicação

Essa visão geral reflete o estado atual do sistema Tawkee API, destacando sua arquitetura sofisticada, conjunto de tecnologias e recursos voltados à automação de comunicação baseada em inteligência artificial.

## Análise do Frontend da GPT Maker AI
##### Header
- Busca de agentes por nome, direcionando direto pra página agents/agent_id
- Total de créditos do workspace
- Sininho de notificações: exibe uma lista de notificações por usuário, então será interessante ter
uma table específica referente à notificações:

###### Notifications
- id
- event (SUBSCRIPTION, CONNECTION, PAYMENT)
> SUBSCRIPTION anota updates na SubscriptionPlan, PAYMENT anota updates no Pagamento, CONNECTION anota updates em conexões com Channels
- timestamp
- description
> Cada notificação é clicável e direciona pra página de interesse

###### Settings
- Ao invés de um ícone, tem logo nome, empresa e avatar do usuário
- Abre Menu contendo mais opções:
    - Nome completo
    - Email
    - Settings de idioma
    - Settings de tema (dark/light)
    - Link para Tutoriais
    - Link para Suporte (redirecionamento para WhatsApp dedicado)
    - Link para Comunidade no Discord
    - Link para Chave de API (acho que não é interessante)
    - Logout

##### Sidebar
###### Estrutura do Sidebar
- Destaque para Workspace selecionado
- Visão Geral: Link para página Home (Dashboard), página inicial após Login
- Meu Time: Link para página Agentes e página Equipe
- Comunicação: Link para página Chat e página Contatos
- Conta: Link para página de Faturamento e Configurações

- Permissionamento:
    -Conta criada de forma regular tem acesso à todas as seções do Sidebar
    - Conta Atendente tem acesso apenas às páginas de Comunicação e Conta: Configurações
    - Conta Treinador tem acesso apenas às páginas Meu Time: Agentes, Comunicação e Conta: Configurações
    - Conta Gerente tem acesso à todas as páginas, exceto Conta: Faturamento

###### Workspace selecionado
- Há a possibilidade de criar outros Workspaces, que vão inicializados com status de assinatura TRIAL
- Créditos e gestão de agentes são separados para cada Workspace

##### Página Home: Dashboard
###### Opções de filtragem
- Há possibilidade de filtrar os dados abaixo na escala de 7 / 14 / 30 dias.
> Podemos extender isso e permitir o usuário também filtrar pra QUALQUER período selecionado (no limite de 6 meses pra não sobrecarregar tanto o banco)

###### Cards com métricas
- Quantidade de Interactions concluídos (e percentual de quanto foi feito pelos agentes)
> Basta fazer uma busca no por interactions cujo status é RESOLVED e ver quantos tem userId não undefined

- Interactions em andamento (e quantos estão aguardando atendimento humano)
> Basta fazer uma busca por interactions cusjo status é WAITING

- Tempo médio de interactions (e informação se equipe humana já foi solicitada ou não)
> Requer calcular a diferença entre resolvedAt e startAt de cada interaction. Por questões de eficiência da busca, talvez seja melhor anotar esse valor já como um atributo a mais na table Interaction (duration)

> Nosso dashboard pode oferecer mais valor ao usuário: o GPT Maker oferece essas métricas mas não permite que, ao clicar nelas, já vá pra página com maiores detalhamentos. Exemplo, só saber quantos atendimentos estão aguardando atendimento não é suficiente: é preciso ser assertivo e mostrar QUAIS atendimento humanos estão precisando de atendimento e tornar possível já responder direto pela plataforma.

###### Gráfico de consumo de créditos por dia
- Gráfico simples de datas no eixo X e créditos no eixo Y
> Podemos incluir no gráfico uma série pra cada agente, de forma empilhada

###### Listas
- 5 Top agentes: avatar, nome, jobName e créditos gastos no período em ordem crescente
- 5 Top modelos: nome do modelo e créditos no período
> A rota @Get('agent/:agentId/credits-spent'), pra cada agent existente, nos entrega esses dados

##### Página Agentes
###### Botão Criar Agente
- Abre Modal com espécie de Slider pra responder as perguntas uma a uma (UI melhor que apresentar todos os campos de uma só vez:
1. Nome do agente (avatar aleatório incluso automaticamente) -> 
2. Objetivo do agente (SUPPORT | SALE | PERSONAL) -> 
3. Agente de quem (caso PERSONAL, deve atualizar o jobName pra algo nesse sentido) OU onde o agente vai trabalhar (jobName, caso SUPPORT ou SALE) ->
4. Descrição da empresa ou pessoa para qual vai trabalhar (jobDescription: max de 500 caracteres) ->
5. Configurações do Agente (enabledHumanTransfer, enabledEmoji, limitSubjects, splitMessages) ->
6. Parabéns, Agente Criado! ->
7. Modal pra (Treinamentos / Intenções / Ajustar Configurações)
> Todas as opções leva pra o Modal de Detalhes do Agente, na seção relacionada, a ser descrito abaixo

###### Lista de Agentes
- Tabs pra filtrar agentes (TODOS / ATIVOS / INATIVOS). Lista com paginação (mostra 5 por vez)
- Lista mostra:
1. Avatar
2. Nome do agente e chip contendo STATUS (Ativo/Inativo)
3. Função (jobName)
4. Botão de settings (3 pontos) no canto direito, que leva à ações de (Editar / Inativar / Mover agente), quando o agente está Ativo, e à ações de (Editar / Ativar / Remover / Move agente), quando o agente está Inativo.
> Editar abre o Modal de Detalhes do Agente, a ser descrito abaixo, direto na seção de Perfil
> Inativar/Ativar leva à Modal de Confirmação. Uma vez confirmado, ocorre a atualização do STATUS.
> Mover agente leva à Modal de Escolha de mover pra qual Workspace. Ao clicar em outro workspace, move imediatamente
> Remover leva à Modal de Confirmação. Uma vez confirmado, ocorre a remoção do AGENTE.

###### Modal de Detalhes do Agente
- Sidebar à esquerda, contendo:
1. Botão indicando outro status (??) do agente (ATIVO, EM TREINAMENTO, INATIVO)
2. Avatar (com botão de Editar pra escolher uma foto)
> Ao Clicar no botão de Editar, vem duas opções: Gerar novo avatar e Fazer upload de foto
3. Nome
4. JobName
5. Modelo
> Ao clicar em Modelo, vem as seguintes opções
- Lista de Empresas: OpenAI, Anthropic, Meta, Alibaba, Deepseek, Maritaca
- Pra cada Empresa, lista de Modelos: 
    - OpenAI: GPT-4.1 (4 créditos), GPT-4.1 Mini (1 crédito), o4-Mini (3 créditos), o3 (20 créditos), GPT-4o Mini (1 crédito), GPT-4o (5 créditos), o3-Mini (Beta) (3 créditos), o1 (25 créditos), GPT-4 Turbo (20 créditos)
    - Anthropic: Claude 3.5 Sonnet (10 créditos), Claude 3.7 Sonnet (10 créditos), Claude 3.5 Haiku (2 créditos)
    - Meta: LlAMA 3.3 (1 crédito)
    - Alibaba: Qwen 2.5 Max (3 créditos)
    - Deepseek Deepseek V3 (1 crédito)
    - Maritaca Sabiá 3 (3 créditos)

6. Seções (onde ao clicar em cada uma, atualiza o que tá sendo mostrado à direita do Sidebar)
- Perfil
    - Label: Informações Pessoais
    - Input: Nome do agente
    - Comunicação: Formal | Normal | Descontrída
    - Comportamento: update do campo de Behavior, que veio como null (Descreva um pouco sobre como o agente deve se comportar durante a conversa. Ex.: Seja extrovertido, na primeira interação procure saber o nome do usuário, etc.) Máximo de 3.000 caracteres 
- Trabalho
    - Label: Informações sobre trabalho
    - Finalidade: Suporte | Vendas | Uso pessoal
    - Agente de quem (jobName)
    - Site (opcional) (jobSite)
    - Descrição (jobDescription0)
- Treinamentos
    - Label: Treinamentos
    - Search: Buscar treinamento (filtragem)
    - Tab com tipos de materiais de treinamento (Texto, Website, Video, Documento)
        - Texto: Possibilidade de cadastrar uma afirmação (máx 1028 caracteres) e de subir uma imagem
        - Website: Cole a URL, indique o intervalo de atualização (de Nunca a 1 mês), navegar em sub páginas (Não ou Sim)
        - Vídeo: Cole a URL do YouTube e idioma do vídeo (pt/en)
        - Documento: Selecione um documento para upload (.pdf, .doc, .docx, .txt máx. 100 MB)
    - Lista com paginação dos itens cadastrados do tipo selecionado na tab

- Intenções
    - Intenções são comandos personalizados que acionam ações específicas
em serviços externos, como "solicitar segunda via de um boleto". Botão de Cadastrar Primeira Inteção
    - Ao clicar no botão de cadastrar intenção:
        - 1. Detalhes gerais, com campos: Nome da intenção (ex.: Emite segunda via boleto) e Quando usar essa intenção (ex.: Descreva em que momento o agente deve executar essa intenção)
        - 2. Configurar ação, com campo opcional de coleta de dados do cliente (são adicionados ao body da requisição?). E campo pra indicar que tipo de ação deve ser feita:
            - Webhook: método HTTP, URL, Headers, Params, Body (pode ser os dados do cliente, ou outros configurados manualmente)
            - Instrução: Dê uma instrução para o agente, com possibilidade de inclurir os dados coletados do cliente na mensagem, bem como campos do contato (chat ID, nome do contato, telefone do contato, etc.)
        - 3. Dados de saída: Persistir variáveis no contato (opcional), com campos Salvar no campo (escolha do campo) e O valor. E definição da resposta do agente, que deve ser baseada em: 1. Na interpretação da resposta da API ou 2. Em uma instrução customizada (a ser definida agora)

- Integrações
    - Conecte o seu agente a outros aplicativos, isso permite que ele obtenha informações mais precisas ou agende reuniões para você.
        1. ElevenLabs: Com ElevenLabs você da a capacidade do seu agente responder seus clientes em áudio, tornando ainda mais humanizado.
        2. GoogleCalendar: Com google calendar sua agente será capaz de agendar reuniões, criar link da chamada e já enviar os convites.
        3. Plug Chat: Caso sua IA ainda não consiga responder algumas perguntas, permita direcionar o atendimento a um humano.
        4. E-vendi: Faça sua IA ter acesso a todos os produtos da sua loja, podendo falar sobre preços, enviar fotos e links.
    > Essas integrações devem ser intenções pré-fabricadas em conformidade com as APIs acima referidas, pra facilitar o processo de integração da parte do usuário. Em outras palavras, cadastrar intenções nesse sentido, de forma manual, é possível, mas requer conhecimento especializado.

- Canais
    - Cards com os canais disponíveis para conexão (todos grátis, exceto informação ao contrário):
        - Telegram: Crie um bot no telegram e conecte ele ao seu Agente.
        - Whatsapp Meta: Vincule seu agente ao Whatsapp Oficial da Meta via Cloud API.
        - Whatsapp Web (R$ 97,00): Conecte seu agente como um Whatsapp Web via Z-API.
        - Instagram: Automatize as mensagens do Direct do seu Instagram.
        - Messenger: Atenda os clientes que enviar mensagem no Messenger da sua Página.
        - Mercado Livre: Responda as perguntas que os clientes fizeram sobre seus produtos.
        - Web Chat: Coloque seu agente para atender os visitantes do seu Site.
        - SMS: Permite que o agente interaja com os clientes por mensagem de texto.
    
- Configurações
    - Tab com as seguintes opções: Conversa, Ações de inatividade, Webhooks, Regras de transferência (Beta)
        - Conversa: toggling de todas as AgentSettings, incuindo timezone, messageGroupingTime e enabledReminder. Inclusão também de definição do limite de interações por atendimento (Sem limite a até 1000 interações)
        - Ações de inatividade: Configure ações que o agente deve executar quando o cliente parar de responder.
            - Já vem com a ação: Se o agente não responder em X minutos (5 default), o agente deve Finalizar atendimento.
            - Possibilidade de adicionar ação anterior: Se o agente não responder em X min (2 default), o agente deve Interagir com o cliente, setando o que o agente deve falar (max 512 chars)
        - Webhooks: Escute eventos que acontecem no sistema e tome ações como enviar um webhook.
            - Ações disponíveis: Nova mensagem, Não soube responder, Primeiro atendimento, Iniciar atendimento, Agente transferir para humano, Finalizar atendimento, Novo agendamento, Cancelou agendamento
        - Regras de transferência (beta):
            - Configure instruções para o agente fazer transferência do atendimento.
            - Transferir para: um agente/ um humano
            - Instruções: Ex.: Quando o cliente quiser falar sobre tal assunto... (máx 255 chars)
            - Opção de devolver ao finalizar (ou não)
            - Opção de transferir o atendimento 

###### Tasks na Tawkee referentes à treinamento
- Integração com banco de dados vetorial (Qdrant) para permitir treinamento dos agentes via RAG
    - Banco de dados vetorial para armazenar arquivos relativos ao treinamento dos agentes, acessível via rotas HTTP de forma perfomática

7. Botão de Teste sua IA
- Possibilidade de iniciar um novo chat com o Agente 47, conversar e receber uma resposta de volta.
- Sidebar contendo lista pra selecionar os chats existentes com o Agente.
    - Cada item da lista vem com título automático do chat (resumido usando IA), horário e nome e conteúdo da mensagem mais recente
    - No final do sidebar, opção de limpar todas as conversas e fechar ambiente de teste
    - Ao lado, opção de inserir mensagens (via texto ou imagem)

##### Página Equipe
###### Botão Convidar Membro
- Membro é vinculado ao Workspace
- Abre modal possibilitando definir o papel do novo membro, dentre:
    - Gerente: Pode fazer tudo exceto gerenciar assinatura
    - Treinador: Cria, edita e treina agentes
    - Atendente: Acessa apenas o chat de atendimento
- Inserir e-mail do membro e enviar convite
###### Tasks na Tawkee referentes ao convite de membros:
- Integração com serviço de e-mail (Resend) para envio emails de convite

- Refatoração da table User:
    - diretiva @unique deve ser removida, pra que mais de um usário possa se vincular à um workspace ativo.
    - campo referente ao tipo de User (OWNER, quando cria a conta normalmente, ou MANAGER / TRAINER / ATENDANT, quando convidado)

- Inclusão de rota de criação de usuário convidado, vinculando à um workspace ativo (a rota atual de criação sempre cria um novo workspace)


###### Lista de membros
- Opção de filtrar os agentes por TODOS / GERENTE / TREINADOR / ATENDENTE
- Tabela mostrando as seguintes informações:
    - E-mail
    - Papel
    - Status (Pendente até aceitar o convite)
    - Botão de ações: copiar link, pra envio à pessoa e remover convite, quando o usuário está PENDENTE. Ações são Editar permissão e remover usuário, quando o usuário está ATIVO.

> Quando o usuário abre o convite recebido por e-mail, abre-se uma página de invite no site, pedindo-o para inserir as opções pessoais pra aceitar o convite: Nome, email, número de whatsapp e senha.
> Usuário recebe um código de ativação pelo Whatsapp, confirmando-o, é direcionado para o dashboard
> Detalhe: a lista nunca mostra o dono da conta mãe, apenas os usuários convidados, que transicionam entre GERENTE, TREINADOR E ATENDENTE. Gerentes podem editar permissões de outros usuários, remover usuários e convidar membros também!

##### Página Chat
- A página consiste de dois containeres, um para seleção de chat e outro pra exibição das mensagens do chat.

###### Exibição dos Chats
- Há opção de filtragem por agente (TODOS ou Agente específico, buscando por nome do agente) e filtragem por nome ou telefone do contato.

- Cada chat é exibido como um item contendo a data no canto superior esquerdo, avatar à esquerda, nome do contato, seguida da mensagem mais recente, abaixo o status do Chat e o horário da última mensagem. No canto superior direito há um ícone do WHATSAPP, que deve indicar o tipo de conexão do canal.

- Os chats são organizados por data, do mais recente ao mais antigo, sem paginação.

###### Conteúdo do Chat
- Acima, avatar, nome do usuário, status no whatsapp (online, offline), telefone e botão Iniciar atendimento. Ao lado, um menu onde é possível ver três opções: Limpar mensagens, bloquear contato e apagar conversa.
> Ao meu ver, nenhum dos três botões do menu são relevantes.

- É possível ver todo o histórico de mensagens trocadas. A data das mensagens atuais fica flutuando no centro superior, estilo Whatsapp.
- Cada mensagem vem com Horário, nome, avatar, caixa com conteúdo. Caso seja mensagem do agente, fica posicionada à direita; caso seja do cliente, à esquerda.
- Abaixo do conteúdo pode aparecer uma notificação caso ocorra erro ao enviar a mensagem e um link (clique para reenviar)
- Ao final, é possível enviar uma mensagem diretamente, enviando texto, emoji, imagem ou áudio.

##### Página Contatos
- Mostra uma lista de contatos com capacidade de filtragem avançada, além de filtragem simples por nome ou telefone. Logo a seguir, um botão de exportar o conteúdo para CSV.

- A lista é organizada em tabelas, contendo nome (com avatar ao lado do nome), telefone e e-mail e um botão de ações, que permite Editar ou Remover o contato.

- Cada contato tem os seguintes campos:
    - Pessoal:
        - Nome
        - Telefone
        - E-mail
        - Gênero
        - Data de nascimento
        - Cargo
    - Empresa
        - Nome
        - Estado
        - Cidade

- A plataforma permite a criação de campos customizados pra adicionar aos clientes, se fizer sentido.
> Ela não busca automaticamente os contatos nos celulares conectados e transfere pro banco de contatos da empresa. Nem mesmo ocorre esse cadastro quando ocorre algum atendimento. É algo que deve ser feito
totalmente de forma manual, e não ficou muito claro aqui nem a utilidade nem o benefício dessa funcionalidade dentro do contexto da plataforma.
> Por mim, essa página deveria listar apenas os contatos que interagiram com algum agente, mostrando quantas interações ocorreram, a satisfação média dos atendimentos e quem foram os chatbots e humanso que atenderam. Seria uma listagem pra facilitar consultar um histórico de atendimentos por cliente e, com base nisso, seria legal se houvesse um resumo em linguagem natural indicando o contexto desse histórico.
Isso ocorrendo de forma natural seria mais interessante que obrigar o cadastro manual e sem entregar valor algum pra empresa. Porém é interessante permitir que a empresa possa preencher os campos que estiverem faltando (já que não serão preenchidos automaticamente com base no atendimento) e crie campos personalizados que façam sentido para ela e possa exportar pra csv.

##### Página Faturamento
- Header indicando o status da assinatura, bem como a quantidade atual de créditos.

- Foco em quando ocorrerá o próximo pagamento.
- Botões de Alterar Plano e Gerenciar Assinatura
    - Alterar plano: Exibe modal de alteração de plano, indicando os três Planos existentes:
        - Basic: R$ 87,00/mês, com 2.500 créditos, até 5 assistentes
        - Standard: R$ 397,00/mês, com 11.500 créditos, até 20 assistentes
        - Corporate; R$ 997,00/mês, com 30.000 créditos, até 50 assistentes
    - Ao clicar num plano inferior, aparece outro modal, de Downgrade do Plano:
        - Ao efetuar o downgrade, o valor excedente já cobrado ficará como saldo e será abatido em suas próximas faturas.
        - Ao efetuar o upgrade, o valor do novo plano é atualizado pra descontar no próximo vencimento.
    - Gerenciar assinatura: permite gerenciar essas informações direto no site da Stripe.

- Informações do Plano Atual
    - Tipo de Plano (e custo)
    - Canais adicionais (e custo total)
    - Total devido 

- Possibilidade de comprar créditos extras facilmente
- Quantidade de créditos (na base de 1 crédito a R$ 0,04) e botão Comprar agora

- Possibilidade de configurar créditos extras automáticos
- Campo Habilitado/Não habilitado
- Campo Ao atingir x créditos
- Campo Comprar x créditos

###### Tasks na Tawkee relativas à faturamento:
- Integração com a Stripe
    - Pela documentação, ver a necessidade de estruturar table dedicada, ou talvez só o que pensei será o suficiente:
        - Table SubscriptionPlan no DB, cujo schema deverá conter, ao menos:
            - id
            - name (ex: Basic, Standard, Corporate)
            - price
            - recurrence (mensal ou anual)
            - billing_cycle (mensal, anual)
            - planFeatures (json contendo campos variados, exemplo abaixo)
                - agent_limit (número limite de agentes [5 -> 20 -> 50])
                - credit_limit (número limite de créditos [2500 -> 10000 -> 30000])
            - is_active
        
        - Refatoração da table Workspace, pra inclusão de subscriptionPlanId (vinculação de Workspace à um SubscriptionPlan, com diretiva @unique para manter cada Workspace vinculado à um único SubscriptionPlan)

##### Página Configurações
- Tab com opções de Perfil, Workpace, Senha e Segurança

###### Perfil
- Possibilidade de alterar foto do perfil, nome, nome da empresa e email. Precisa confirmar a senha
para salvar as alterações.

###### Workspace
- Possibilidade de alterar o nome do Workspace (máx 32 chars) e aplicar as alterações ou deletar o workspace.

###### Senha
- Possibilidade de alterar a senha, digitando a senha atual, nova senha e confirmando nova senha.

###### Tasks na Tawkee referentes à senha:
- Integração com serviço de e-mail (Resend) para envio emails:
    - Mudança de senha
    - Confirmação de senha na criação de conta

###### Segurança
- Autenticação de dois fatores
Configurar Autenticação de 2 Fatores, adicione uma camada extra de segurança à conta dos usuários, que acontece nas seguintes etapas:
    - Etapa 1: Escaneie o QR Code. Use seu aplicativo de autenticação para escanear o código QR.
    - Etapa 2: Insira o código de verificação. Digite o código de 6 dígitos exibido no seu aplicativo de autenticação.
    - Etapa 3: Pronto!
    - Sua conta agora está protegida com autenticação de 2 fatores.

###### Tasks na Tawkee relativas à segurança:
- Integração com plataformas de autenticação via padrão TOTP
- Inclusão de table RecoveryCode pra armazenar os Recovery Codes dos usuários de forma segura
exemplo no Prisma ORM:
model RecoveryCode {
  id        String   @id @default(uuid())
  codeHash  String   // hash do código
  used      Boolean  @default(false)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  usedAt    DateTime?
}


# Observações
> Temos como saber exatamente quanto custa cada requisição feita à OpenAI? Quais os parâmetros envolvidos? Há previsibilidade nesse sentido?
>> Em que momento ocorre o gasto de créditos? No mesmo momento em que ocorre a requisição?
>>>  Como o usuário da plataforma consegue acompanhar esse custo, já que os agentes vão respondendo
qualquer mensagem que chega pro telefone conectado, sem se importar com limite?
>>>> O que acontece quando os créditos expiram? As IAs param de responder? Há carregamento de créditos
adicionais? Como funciona o recarregamento esse recarregamento, apenas incrementa os créditos no estado do usuário?