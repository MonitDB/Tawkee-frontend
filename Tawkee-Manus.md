# Análise e Reorganização do Documento Tawkee e GPT Maker AI

Este documento apresenta uma reorganização das informações fornecidas sobre o sistema Tawkee e a análise do frontend da GPT Maker AI, com o objetivo de facilitar a compreensão por terceiros. Ele detalha o estado atual da Tawkee, as funcionalidades da GPT Maker AI a serem implementadas e um plano de tarefas detalhado.

## 1. Estado Atual da Tawkee

A API Tawkee é um sistema backend sofisticado projetado para uma plataforma inteligente de automação de comunicação. Seu propósito é aprimorar interações multicanais através de estratégias adaptativas baseadas em Inteligência Artificial, com foco principal na automação do atendimento ao cliente via WhatsApp.

### 1.1. Visão Geral

A plataforma visa otimizar a comunicação e o atendimento, utilizando IA para fornecer respostas e interações mais eficientes e personalizadas.

### 1.2. Arquitetura

A arquitetura do sistema é fundamentada nos seguintes componentes e tecnologias:

*   **Framework da Aplicação:** NestJS (v11), um framework progressivo para Node.js construído com TypeScript.
*   **Acesso ao Banco de Dados:** Prisma ORM, utilizado para operações seguras e com tipagem no banco de dados.
*   **Autenticação:** Sistema de autenticação baseado em JSON Web Tokens (JWT), incluindo uma blacklist para tokens invalidados.
*   **Orquestração de Serviços:** Utiliza o padrão de injeção de dependência, com módulos de funcionalidades bem separados para garantir organização e manutenibilidade.
*   **Agendamento de Tarefas:** O NestJS Scheduler é empregado para gerenciar e executar tarefas recorrentes de forma automatizada.

### 1.3. Padrões de Projeto

A aplicação adota diversos padrões de projeto para assegurar uma estrutura robusta e escalável:

*   **Design Modular:** A aplicação é dividida em módulos de funcionalidades, promovendo a separação de responsabilidades e facilitando a manutenção.
*   **Padrão Controller-Service:** Há uma clara separação entre a camada de tratamento de requisições HTTP (Controllers) e a camada de lógica de negócio (Services).
*   **Padrão Repository:** As operações de acesso e manipulação de dados no banco de dados são abstraídas utilizando o Prisma, seguindo o padrão Repository.
*   **Padrão Middleware:** Utilizado para funcionalidades transversais como validação de requisições, autenticação de usuários e tratamento global de erros.
*   **Padrão Strategy:** Aplicado para permitir a implementação de diferentes estilos de comunicação e tipos de agentes de forma flexível.

### 1.4. Tecnologias Utilizadas

O desenvolvimento e funcionamento da API Tawkee contam com as seguintes tecnologias:

*   **Runtime:** Node.js em conjunto com TypeScript para um desenvolvimento tipado e moderno.
*   **Framework Backend:** NestJS para a construção da API.
*   **Banco de Dados:** PostgreSQL é o sistema de gerenciamento de banco de dados principal.
*   **ORM (Object-Relational Mapper):** Prisma é utilizado para a interação com o banco de dados e para a gestão do esquema.
*   **Integração com Inteligência Artificial:** A API da OpenAI, especificamente o modelo GPT-4o, é usada para a geração de respostas baseadas em IA.
*   **Integração com WhatsApp:** A Evolution API é empregada para a conexão e comunicação com a plataforma WhatsApp.
*   **Autenticação:** Tokens JWT são usados para proteger os endpoints, com mecanismos de expiração e blacklist.
*   **Validação de Dados:** As bibliotecas `class-validator` e `class-transformer` são usadas para a validação de Data Transfer Objects (DTOs).
*   **Documentação da API:** Swagger/OpenAPI é utilizado para gerar e manter a documentação interativa da API.
*   **Gerenciamento de Configurações:** O `ConfigService` do NestJS é usado para gerenciar as configurações do ambiente.

### 1.5. Dependências Externas

O sistema depende dos seguintes serviços externos para seu pleno funcionamento:

*   **OpenAI API:** Essencial para a geração de respostas inteligentes e contextualizadas.
*   **Evolution API:** Necessária para o tratamento de mensagens do WhatsApp, incluindo a geração de QR codes para conexão.

### 1.6. Esquema do Banco de Dados

O banco de dados PostgreSQL é estruturado com as seguintes entidades principais, gerenciadas pelo Prisma:

1.  **User:** Armazena informações de usuários para autenticação e gerenciamento de acesso.
2.  **Workspace:** Funciona como um contêiner para agrupar agentes, interações, permissões e créditos.
3.  **Agent:** Representa os assistentes virtuais, cada um com seus comportamentos, estilos de comunicação e tipos específicos.
4.  **Channel:** Define os canais de comunicação (primariamente WhatsApp) que são conectados aos agentes.
5.  **Chat:** Modela os diálogos e conversas entre os usuários finais e os agentes através dos canais.
6.  **Message:** Contém as mensagens individuais trocadas dentro de cada conversa.
7.  **Interaction:** Utilizada para acompanhar os estados e métricas das conversas, como status e tempo de resolução.
8.  **AgentSettings:** Armazena as opções de configuração específicas para cada agente.
9.  **AgentWebhooks:** Define pontos de integração (webhooks) com sistemas externos para os agentes.
10. **BlacklistToken:** Guarda os tokens JWT que foram invalidados (ex: após logout) para prevenir seu reuso.
11. **WebhookEvents:** Registra os eventos recebidos da Evolution API, como novas mensagens ou mudanças de status.

### 1.7. Funcionalidades Implementadas

A API Tawkee já possui um conjunto robusto de funcionalidades implementadas:

#### 1.7.1. Autenticação e Gerenciamento de Usuários
*   Endpoints para registro de novos usuários, login e logout.
*   Autenticação segura baseada em tokens JWT.
*   Implementação de blacklist de tokens para invalidar sessões após o logout.
*   Funcionalidade para recuperação de informações do perfil do usuário logado.

#### 1.7.2. Gerenciamento de Espaços de Trabalho (Workspaces)
*   Operações CRUD (Create, Read, Update, Delete) completas para espaços de trabalho.
*   Sistema de alocação e acompanhamento de créditos por workspace.

#### 1.7.3. Gerenciamento de Agentes
*   Criação, leitura, atualização e exclusão de agentes.
*   Funcionalidade para ativar ou desativar agentes conforme necessário.
*   Acompanhamento dos gastos de crédito por agente.
*   Suporte a tipos de agentes customizáveis, como SUPORTE, VENDAS, PESSOAL.
*   Configuração de diferentes estilos de comunicação para os agentes (NORMAL, FORMAL, DESCONTRAÍDO).
*   Definição de contexto profissional para o agente, incluindo cargo, website da empresa e descrição.

#### 1.7.4. Gerenciamento de Canais (Foco em WhatsApp)
*   Conexão de canais do WhatsApp através da leitura de QR code gerado pela Evolution API.
*   Funcionalidade para atualização do QR code quando necessário.
*   Monitoramento contínuo do status de conexão do canal.
*   Desconexão de canais (sem exclusão dos dados históricos).
*   Exclusão de canais com a devida limpeza de recursos associados.

#### 1.7.5. Gerenciamento de Conversas e Mensagens
*   Criação automática de novas conversas no sistema quando mensagens são recebidas via WhatsApp.
*   Recuperação do histórico de mensagens de uma conversa.
*   Função de "assumir controle humano", permitindo que um operador humano intervenha e pause o atendimento automatizado, e retome posteriormente.
*   Possibilidade de envio manual de mensagens via interface de usuário (UI) para o WhatsApp.
*   Tratamento avançado de erros e mecanismos de recuperação durante a criação e processamento de conversas.
*   Validação robusta de entradas e registro detalhado de erros para facilitar a depuração.

#### 1.7.6. Interação com Inteligência Artificial (IA)
*   Geração de respostas pela IA que são sensíveis ao contexto da conversa.
*   Utilização de guias de estilo de comunicação que variam conforme o tipo e configuração do agente.
*   Acompanhamento do histórico da conversa, que é incluído nos prompts enviados à IA para melhor contextualização.
*   Geração de respostas utilizando o modelo GPT-4o da OpenAI.
*   Implementação de tratamento de falhas na comunicação com a API da OpenAI, com mecanismos de fallback.

#### 1.7.7. Processamento de Webhooks da Evolution API
*   Endpoint seguro para receber webhooks da Evolution API, garantindo a autenticidade e integridade dos dados.
*   Detecção avançada de diferentes tipos de mensagens recebidas (texto, áudio, imagem, localização, etc.).
*   Filtro para ignorar mensagens provenientes de grupos do WhatsApp, focando em conversas individuais.
*   Monitoramento do estado de conexão do WhatsApp através dos eventos de webhook.
*   Tratamento e recuperação de erros abrangente durante o processamento dos webhooks.
*   Log detalhado de todas as etapas do fluxo de processamento do webhook.

#### 1.7.8. Gerenciamento de Interações
*   Criação automática de registros de interação para novas conversas iniciadas.
*   Acompanhamento do status das interações (ex: EM_ANDAMENTO, ALERTA, RESOLVIDO, ENCERRADO).
*   Detecção de inatividade em conversas e geração de alertas automáticos para acompanhamento.
*   Endpoints na API para permitir a resolução manual ou automática de interações.

#### 1.7.9. Tarefas Agendadas (Scheduled Tasks)
*   Tarefa recorrente para limpeza de tokens JWT expirados que estão na blacklist.
*   Tarefa para processamento de interações que se tornaram inativas, aplicando lógicas de alerta ou encerramento.

### 1.8. Limitações e Considerações Atuais

Apesar do conjunto de funcionalidades, existem algumas limitações e pontos de atenção no estado atual do sistema:

1.  **Timeouts de Transações:** Foram observados erros ocasionais de timeout em tarefas agendadas, conforme indicado nos logs do sistema. Isso requer investigação para otimizar as queries ou processos envolvidos.
2.  **Tratamento de Mídia:** O suporte atual para mensagens contendo mídia (imagens, vídeos, áudios) é básico. Há potencial para expansão dessa funcionalidade, como armazenamento e processamento mais avançado desses arquivos.
3.  **Mensagens de Grupo do WhatsApp:** Atualmente, as mensagens de grupo são identificadas pelo sistema, mas não são totalmente processadas ou integradas aos fluxos de atendimento dos agentes.
4.  **Escalabilidade:** O sistema foi projetado com a escalabilidade horizontal em mente. No entanto, para efetivamente escalar, requer a configuração de um balanceador de carga e possivelmente outras otimizações de infraestrutura.

### 1.9. Requisitos de Ambiente

Para a execução da aplicação Tawkee API, as seguintes variáveis de ambiente precisam ser configuradas:

*   `DATABASE_URL`: String de conexão para o banco de dados PostgreSQL.
*   `OPENAI_API_KEY`: Chave de API para acesso aos serviços da OpenAI.
*   `EVOLUTION_API_URL`: Endpoint da API da Evolution para integração com o WhatsApp.
*   `EVOLUTION_API_KEY`: Chave de API para autenticação na Evolution API.
*   `JWT_SECRET`: Segredo utilizado para assinar e verificar os tokens JWT.
*   `WEBHOOK_TOKEN`: Token de segurança para autenticar os webhooks recebidos da Evolution API.
*   `OUR_ADDRESS`: A URL publicamente acessível da aplicação Tawkee, necessária para o correto funcionamento dos webhooks e outras integrações.

Esta seção resume o estado atual da API Tawkee, detalhando sua arquitetura, tecnologias, funcionalidades implementadas, limitações conhecidas e os requisitos para seu ambiente de execução.




## 2. Features da GPT Maker AI a Implementar (Frontend)

A análise do frontend da GPT Maker AI revelou um conjunto de funcionalidades que precisam ser implementadas para complementar o backend da Tawkee. Estas funcionalidades visam criar uma interface de usuário rica e intuitiva para o gerenciamento da plataforma de automação de comunicação.

### 2.1. Autenticação e Gerenciamento de Usuário (Frontend)

*   **Opções de OAuth:** Permitir login e registro utilizando provedores como Google e Facebook.
*   **Recuperação de Senha:** Implementar fluxo de "esqueci minha senha" com envio de link de redefinição por e-mail.
*   **Verificação de Conta:** Enviar e-mail de verificação após a criação de conta na plataforma.
*   **Integração com Serviço de E-mail:** Utilizar um serviço como Resend para o envio dos e-mails transacionais mencionados acima.

### 2.2. Header da Aplicação (Frontend)

*   **Busca Rápida de Agentes:** Campo de busca para encontrar agentes por nome, com redirecionamento direto para a página de detalhes do agente selecionado.
*   **Exibição de Créditos:** Mostrar o total de créditos disponíveis no workspace atualmente selecionado.
*   **Central de Notificações:**
    *   Ícone de "sininho" que, ao ser clicado, exibe uma lista de notificações relevantes para o usuário.
    *   As notificações devem ser clicáveis, direcionando o usuário para a página ou contexto relacionado ao evento da notificação (ex: atualização de assinatura, status de conexão de canal, pagamento).
*   **Menu de Configurações do Usuário:**
    *   Substituir um ícone genérico por uma exibição mais informativa contendo nome, nome da empresa (se aplicável) e avatar do usuário.
    *   Ao clicar, abrir um menu dropdown com as seguintes opções e informações:
        *   Nome completo do usuário.
        *   Endereço de e-mail do usuário.
        *   Configurações de idioma da interface.
        *   Configurações de tema da interface (dark/light mode).
        *   Link para a seção de Tutoriais.
        *   Link para Suporte ao Cliente (redirecionando para um número de WhatsApp dedicado).
        *   Link para a Comunidade no Discord.
        *   Opção de Logout da plataforma.
        *   (Observação: A ideia de um link para Chave de API do usuário foi considerada não interessante neste ponto).

### 2.3. Sidebar de Navegação (Frontend)

*   **Destaque do Workspace Ativo:** Indicação clara de qual workspace está selecionado e ativo.
*   **Links de Navegação Principal:**
    *   **Visão Geral:** Link para a página Home (Dashboard), que é a página inicial após o login.
    *   **Meu Time:** Agrupa links para a página de gerenciamento de Agentes e para a página de gerenciamento da Equipe.
    *   **Comunicação:** Agrupa links para a página de Chat (atendimentos) e para a página de gerenciamento de Contatos.
    *   **Conta:** Agrupa links para a página de Faturamento e para a página de Configurações gerais da conta/workspace.
*   **Controle de Acesso Baseado em Permissões (Roles):**
    *   **Conta Regular (Admin/Proprietário):** Acesso a todas as seções do Sidebar.
    *   **Conta do Tipo Atendente:** Acesso restrito às páginas de Comunicação (Chat, Contatos) e à seção de Configurações da Conta (para configurações pessoais, como idioma e tema).
    *   **Conta do Tipo Treinador:** Acesso restrito às páginas de Meu Time (Agentes), Comunicação (Chat, Contatos) e Configurações da Conta.
    *   **Conta do Tipo Gerente:** Acesso a todas as páginas, exceto a página de Faturamento da Conta.

### 2.4. Gerenciamento de Workspaces (Frontend)

*   **Criação de Novos Workspaces:** Permitir que usuários criem múltiplos workspaces. Novos workspaces devem ser inicializados com um status de assinatura TRIAL.
*   **Seleção de Workspace:** Interface para o usuário selecionar qual workspace deseja visualizar e gerenciar. Créditos e gestão de agentes são independentes por workspace.

### 2.5. Página Home: Dashboard (Frontend)

*   **Filtros de Período para Métricas:**
    *   Opções predefinidas para filtrar os dados exibidos: últimos 7 dias, 14 dias, 30 dias.
    *   Funcionalidade de seleção de período customizado, permitindo ao usuário definir um intervalo de datas específico (com um limite sugerido de 6 meses para evitar sobrecarga).
    *   O estado do filtro selecionado deve ser guardado no frontend, com a data atual como referência inicial.
*   **Cards de Métricas Principais:**
    *   **Interações Concluídas:** Quantidade total de interações com status RESOLVIDO no período selecionado. Incluir um percentual indicando quantas dessas foram concluídas por agentes (IA) versus por humanos.
    *   **Interações em Andamento:** Quantidade total de interações com status EM_ANDAMENTO ou ALERTA. Destacar quantas delas estão com status AGUARDANDO (esperando atendimento humano).
    *   **Tempo Médio de Interação:** Calcular e exibir o tempo médio das interações resolvidas no período. Indicar se a equipe humana foi solicitada ou não nessas interações.
    *   **Interatividade dos Cards:** Ao clicar nos números/métricas dos cards, o usuário deve ser redirecionado para a página de Chats, com filtros pré-aplicados correspondentes à métrica clicada (ex: clicar em "aguardando atendimento humano" filtra os chats nessa condição).
*   **Visualização de Consumo de Créditos e Desempenho:**
    *   **Gráfico de Consumo de Créditos:** Gráfico de linhas mostrando o consumo de créditos por dia ao longo do período selecionado. Considerar a possibilidade de exibir séries empilhadas no gráfico, representando o consumo de cada agente individualmente.
    *   **Top 5 Agentes:** Lista exibindo os 5 agentes que mais consumiram créditos no período, mostrando avatar, nome, `jobName` e o total de créditos gastos, em ordem decrescente de consumo.
    *   **Top 5 Modelos de IA:** Lista exibindo os 5 modelos de IA mais utilizados (ou que mais consumiram créditos, a definir) no período, mostrando o nome do modelo e os créditos associados.

### 2.6. Página de Gerenciamento de Agentes (Frontend)

*   **Botão "Criar Agente" e Modal de Criação:**
    *   Ao clicar no botão, abrir um modal interativo, possivelmente em formato de slider ou wizard (passo a passo), para guiar o usuário na criação de um novo agente:
        1.  **Nome do Agente:** Campo para inserir o nome do agente. Um avatar genérico/aleatório é atribuído inicialmente.
        2.  **Objetivo do Agente:** Seleção do tipo de agente (ex: SUPORTE, VENDAS, PESSOAL).
        3.  **Contexto do Agente:** Se o objetivo for PESSOAL, o `jobName` pode ser atualizado para refletir isso. Se for SUPORTE ou VENDAS, solicitar o `jobName` (ex: "Agente de Suporte Técnico", "Consultor de Vendas").
        4.  **Descrição da Empresa/Pessoa:** Campo para `jobDescription` (máximo de 500 caracteres), detalhando o contexto de atuação do agente.
        5.  **Configurações Iniciais do Agente:** Opções como `enabledHumanTransfer`, `enabledEmoji`, `limitSubjects`, `splitMessages`.
        6.  **Confirmação:** Mensagem de "Parabéns, Agente Criado!".
        7.  **Próximos Passos:** Opções para direcionar o usuário ao Modal de Detalhes do Agente, já na seção apropriada (Treinamentos, Intenções ou Ajustar Configurações).
*   **Lista de Agentes:**
    *   **Filtros:** Tabs para filtrar a lista de agentes por status (TODOS, ATIVOS, INATIVOS).
    *   **Paginação:** Exibir um número limitado de agentes por página (ex: 5 por vez) com controles de navegação.
    *   **Informações por Agente na Lista:**
        1.  Avatar do agente.
        2.  Nome do agente e um "chip" ou tag indicando o STATUS (Ativo/Inativo).
        3.  Função ou `jobName` do agente.
        4.  Botão de "settings" (ícone de 3 pontos) no canto direito de cada item da lista, que ao ser clicado revela um menu de ações:
            *   **Se Agente Ativo:** Opções de (Editar, Inativar, Mover Agente).
            *   **Se Agente Inativo:** Opções de (Editar, Ativar, Remover, Mover Agente).
            *   **Ação Editar:** Abre o Modal de Detalhes do Agente, na seção "Perfil".
            *   **Ação Ativar/Inativar:** Abre um modal de confirmação. Após a confirmação, o status do agente é atualizado.
            *   **Ação Mover Agente:** Abre um modal para selecionar o workspace de destino. A movimentação ocorre imediatamente após a seleção e confirmação.
            *   **Ação Remover:** Abre um modal de confirmação. Após a confirmação, o agente é removido.
*   **Modal de Detalhes do Agente:** Interface rica para visualização e edição completa das configurações de um agente.
    *   **Layout:** Sidebar à esquerda para navegação entre seções, e área de conteúdo à direita exibindo os detalhes da seção selecionada.
    *   **Sidebar do Modal:**
        1.  **Avatar do Agente:** Exibição do avatar atual. Botão "Editar" permite:
            *   Fazer upload de uma foto (ignorar geração aleatória de avatares, usar um avatar inicial genérico se nenhum for enviado).
        2.  **Nome do Agente:** Campo de texto editável.
        3.  **JobName:** Campo de texto editável.
        4.  **Seleção de Modelo de IA:**
            *   Dropdown ou seletor que permite escolher a empresa (provedor) do modelo de IA (OpenAI, Anthropic, Meta, Alibaba, Deepseek, Maritaca).
            *   Com base na empresa selecionada, listar os modelos disponíveis com seus respectivos custos em créditos (ex: OpenAI: GPT-4o (5 créditos), GPT-4o Mini (1 crédito); Anthropic: Claude 3.5 Sonnet (10 créditos), etc.).
            *   *Questão em aberto do documento original: Esclarecer como o consumo de créditos por resposta da IA funciona e se a interface do GPT Maker deixa isso claro.*
        5.  **Seções de Configuração (links no sidebar):**
            *   **Perfil:**
                *   Label: "Informações Pessoais".
                *   Input: Nome do agente.
                *   Comunicação: Seleção de estilo (Formal, Normal, Descontraída).
                *   Comportamento: Campo para descrever como o agente deve se comportar (atualização do campo `behavior`).
                *   Descrição da Empresa/Pessoa para qual o agente trabalha.
                *   Website da empresa/pessoa.
                *   Cargo/Função do agente.
            *   **Treinamentos (Fontes de Conhecimento):**
                *   Opção de upload de arquivos (PDF, TXT, DOCX, CSV - com limites, ex: máximo 10 arquivos, 2MB cada).
                *   Opção de adicionar URL de website para scraping de conteúdo.
                *   Opção de adicionar Perguntas e Respostas (FAQ) manualmente.
                *   Lista das fontes de conhecimento adicionadas, com opções de editar ou remover cada fonte.
            *   **Intenções:**
                *   Interface para criar novas intenções (definindo Nome da intenção, Descrição, Exemplos de frases que ativam a intenção).
                *   Lista das intenções criadas, com opções de editar ou remover cada intenção.
            *   **Canais:**
                *   **WhatsApp:** Funcionalidade para conectar/desconectar um canal do WhatsApp (exibição de QR Code, status da conexão).
                *   **Instagram:** Placeholder para futura integração com Instagram (detalhes de implementação a serem definidos).
                *   **Website (Widget/Chatbot):** Placeholder para futura integração de um widget de chat para websites (detalhes a serem definidos).
            *   **Transferência Humana:**
                *   Configurações para definir quando a transferência para um atendente humano deve ocorrer (ex: após X mensagens sem resolução, ao identificar palavras-chave específicas).
                *   Campo para definir a mensagem padrão que o agente envia ao iniciar a transferência.
                *   Opções de notificação para a equipe quando uma transferência é solicitada (ex: notificar via WhatsApp, E-mail).
            *   **Aparência (para Widget de Website):**
                *   Upload de avatar específico para o widget.
                *   Nome do agente a ser exibido no widget.
                *   Mensagem de boas-vindas do widget.
                *   Seleção de cor principal do widget.
                *   Opções de posicionamento do widget na página (canto inferior direito/esquerdo).
            *   **Limites de Uso (por usuário final):**
                *   Configuração para limitar o número de mensagens que um usuário final pode trocar com o agente em um determinado período.
                *   Mensagem a ser exibida quando o limite é atingido.
            *   **Histórico:**
                *   Log de alterações realizadas nas configurações do agente.
            *   **Configurações Avançadas:**
                *   **Webhooks:** Configuração de URL de webhook e seleção de eventos do agente que devem disparar o webhook.
                *   **Chave de API do Agente:** Geração e exibição de uma chave de API específica para o agente, para permitir integrações externas.
                *   **Opção de Apagar Agente:** Botão para exclusão definitiva do agente (com confirmação).

### 2.7. Página de Gerenciamento de Equipe (Frontend)

*   **Botão "Convidar Membro":** Abre um modal para adicionar novos membros à equipe do workspace.
*   **Lista de Membros da Equipe:**
    *   Exibição de Avatar, Nome, Email, Função (Role) e Status (ex: Ativo, Pendente) de cada membro.
    *   Ações disponíveis para cada membro (ex: Editar Função, Reenviar Convite, Remover).
*   **Modal de Convidar Membro:**
    *   Campos para inserir o Email do convidado e selecionar a Função (Atendente, Treinador, Gerente, Admin do Workspace).
*   **Modal de Editar Membro:** Permitir a alteração da Função de um membro existente.
*   **Modal de Remover Membro:** Confirmação para remover um membro da equipe.

### 2.8. Página de Chat / Atendimentos (Frontend)

*   **Layout de Três Colunas:**
    1.  **Coluna da Esquerda: Lista de Chats:** Exibe todas as conversas, com filtros e busca.
    2.  **Coluna Central: Chat Ativo:** Exibe as mensagens da conversa selecionada e o campo para enviar novas mensagens.
    3.  **Coluna da Direita: Detalhes do Contato/Agente:** Mostra informações contextuais sobre o contato e o agente envolvido na conversa ativa.
*   **Lista de Chats (Coluna da Esquerda):**
    *   **Filtros:** Opções para filtrar conversas (Todos, Não Lidos, Aguardando Atendimento Humano, Resolvidos, Atendidos pelo Bot, Atendidos por Humano).
    *   **Busca:** Campo para buscar conversas por nome do contato ou número de telefone.
    *   **Informações por Chat na Lista:** Avatar do contato, Nome do contato, Trecho da última mensagem, Tempo desde a última mensagem, Status da conversa, Ícone do canal (WhatsApp, etc.).
*   **Chat Ativo (Coluna Central):**
    *   **Header do Chat:** Nome do contato, Número de telefone, Status da conversa. Botão para "Assumir Atendimento" (se o bot estiver ativo) ou "Devolver ao Bot" (se um humano estiver atendendo).
    *   **Histórico de Mensagens:** Exibição cronológica das mensagens trocadas.
    *   **Input de Mensagem:** Campo para digitar novas mensagens, com opções para:
        *   Emojis.
        *   Anexar arquivos.
        *   Gravar e enviar mensagens de áudio.
        *   Utilizar templates de mensagens pré-definidas.
*   **Detalhes do Contato/Agente (Coluna da Direita):**
    *   **Informações do Contato:** Nome, Telefone, Email, Tags associadas ao contato.
    *   **Informações do Agente:** Nome do agente que está (ou esteve) tratando a conversa, modelo de IA utilizado, link para o treinamento do agente.
    *   **Notas Internas:** Área para atendentes humanos adicionarem notas privadas sobre a conversa ou o contato.
    *   **Histórico de Interações:** Lista de interações anteriores com o mesmo contato.

### 2.9. Página de Gerenciamento de Contatos (Frontend)

*   **Ações Principais:** Botões para "Adicionar Contato", "Importar Contatos" (ex: de um arquivo CSV) e "Exportar Contatos".
*   **Lista de Contatos:**
    *   Tabela exibindo os contatos com colunas como: Checkbox de seleção, Nome, Telefone, Email, Tags, Data da Última Interação.
    *   Ações disponíveis para cada contato (ex: Editar, Ver Histórico de Chats, Apagar).
*   **Filtros e Busca:** Funcionalidades para filtrar a lista de contatos por diversos critérios (ex: tags) e buscar por nome, telefone ou email.
*   **Modal de Adicionar/Editar Contato:** Formulário para inserir ou modificar os dados de um contato.
*   **Gerenciamento de Tags:** Funcionalidade para criar, aplicar e gerenciar tags para organizar os contatos.

### 2.10. Página de Faturamento (Frontend)

*   **Plano Atual:**
    *   Exibição do nome do plano de assinatura atual do workspace, seu preço e os principais recursos incluídos.
    *   Botão para "Mudar Plano", levando a uma página de seleção de planos.
*   **Histórico de Faturas:**
    *   Lista de faturas anteriores com informações como Data, Descrição, Valor, Status (Paga, Pendente) e opção de Download da fatura em PDF.
*   **Métodos de Pagamento:**
    *   Interface para adicionar, visualizar, editar e remover métodos de pagamento (ex: cartão de crédito).
*   **Consumo de Créditos:**
    *   Visão geral do consumo de créditos no período de faturamento atual.
    *   Detalhes do consumo por agente e por modelo de IA, se possível.

### 2.11. Página de Configurações (Frontend)

Esta página pode ser dividida em abas ou seções para diferentes categorias de configurações:

*   **Perfil do Usuário:**
    *   Campos para editar Nome, Email.
    *   Opção para alterar o Avatar do usuário.
    *   Funcionalidade para alterar a Senha.
*   **Configurações do Workspace:**
    *   Editar Nome do Workspace.
    *   Fazer upload do Logo do Workspace.
    *   Definir Fuso Horário padrão para o workspace.
    *   Selecionar Moeda padrão para faturamento.
*   **Notificações da Plataforma:**
    *   Configurações para habilitar/desabilitar notificações por Email e In-app (dentro da plataforma) para diferentes tipos de eventos.
*   **Integrações:**
    *   Seção para gerenciar integrações com APIs de serviços externos (além das já existentes como OpenAI e Evolution).
*   **Segurança:**
    *   Opção para habilitar Autenticação de Dois Fatores (2FA) para a conta do usuário.
    *   Visualização de Logs de Atividade da conta (ex: logins, alterações importantes).

### 2.12. Outras Funcionalidades Globais (Frontend)

*   **Internacionalização (i18n):** Suporte completo para múltiplos idiomas na interface, incluindo Português (PT), Inglês (UK) e Espanhol (ES). Todas as páginas e textos devem ser traduzíveis.
*   **Tema Dark/Light:** Permitir que o usuário escolha entre um tema claro e um tema escuro para a interface da aplicação.




## 3. Plano de Tarefas Detalhado (Backend e Frontend)

A seguir, apresentamos um detalhamento das tarefas a serem executadas para implementar as funcionalidades discutidas, com uma clara distinção entre tarefas de backend (Tawkee API) e frontend (GPT Maker AI).

### 3.1. Autenticação e Gerenciamento de Usuário

#### Tarefas de Backend (Tawkee API)

1.  **Integração OAuth (Google e Facebook):**
    *   **Descrição:** Implementar a lógica no backend para permitir que usuários se registrem e façam login utilizando suas contas do Google e Facebook. Isso envolve configurar os provedores OAuth, manipular os callbacks, criar ou vincular usuários no banco de dados da Tawkee e gerar tokens JWT para esses usuários.
    *   **Detalhes:**
        *   Pesquisar e integrar bibliotecas NestJS para OAuth 2.0 (ex: `passport-google-oauth20`, `passport-facebook`).
        *   Criar endpoints dedicados para iniciar o fluxo OAuth para cada provedor (`/auth/google`, `/auth/facebook`).
        *   Criar endpoints de callback para cada provedor (`/auth/google/callback`, `/auth/facebook/callback`) para receber os dados do usuário.
        *   Atualizar o modelo `User` e a lógica de serviço para armazenar identificadores OAuth e lidar com usuários que se registram via OAuth versus registro tradicional por e-mail/senha.
        *   Garantir a criação de um workspace padrão para novos usuários OAuth.
    *   **Classificação:** Backend

2.  **Integração com Serviço de E-mail (Resend) para Funcionalidades de Conta:**
    *   **Descrição:** Configurar a integração com o serviço de e-mail Resend para enviar e-mails transacionais, como verificação de conta após o registro e links para redefinição de senha.
    *   **Detalhes:**
        *   Instalar o SDK do Resend ou configurar chamadas HTTP diretas para a API do Resend.
        *   Criar um módulo/serviço de e-mail no NestJS para abstrair o envio de e-mails.
        *   Implementar a lógica para gerar tokens de verificação de e-mail e tokens de redefinição de senha, armazenando-os de forma segura e com prazo de validade.
        *   Criar templates de e-mail para verificação de conta e redefinição de senha.
        *   **Fluxo de Verificação de Conta:**
            *   Após o registro (não OAuth), enviar um e-mail de verificação com um link único.
            *   Criar um endpoint para validar o token de verificação e marcar a conta do usuário como verificada.
        *   **Fluxo de Esqueci Minha Senha:**
            *   Criar endpoint para solicitar a redefinição de senha (usuário informa o e-mail).
            *   Enviar e-mail com link único para a página de redefinição de senha.
            *   Criar endpoint para receber o novo token, a nova senha, validá-los e atualizar a senha do usuário.
    *   **Classificação:** Backend

#### Tarefas de Frontend

1.  **Interface para Login/Registro com OAuth:**
    *   **Descrição:** Adicionar botões "Login com Google" e "Login com Facebook" nas telas de login e registro.
    *   **Detalhes:**
        *   Ao clicar nos botões, redirecionar o usuário para os respectivos fluxos de autenticação OAuth iniciados pelo backend.
        *   Tratar os callbacks do OAuth, recebendo o token JWT do backend e redirecionando o usuário para o dashboard após login bem-sucedido.
    *   **Classificação:** Frontend

2.  **Interface para Recuperação de Senha:**
    *   **Descrição:** Criar as telas e componentes para o fluxo de "esqueci minha senha".
    *   **Detalhes:**
        *   Formulário para o usuário inserir o e-mail para solicitar a redefinição.
        *   Tela de confirmação informando que um e-mail foi enviado.
        *   Página (acessada via link do e-mail) com formulário para o usuário inserir e confirmar a nova senha.
        *   Integração com os endpoints de backend correspondentes.
    *   **Classificação:** Frontend

3.  **Interface para Verificação de Conta:**
    *   **Descrição:** Informar ao usuário sobre a necessidade de verificar o e-mail após o registro.
    *   **Detalhes:**
        *   Exibir mensagem na interface após o registro, instruindo o usuário a verificar seu e-mail.
        *   Página de confirmação de verificação de e-mail (acessada via link do e-mail).
        *   Possivelmente, restringir algumas funcionalidades até que o e-mail seja verificado.
    *   **Classificação:** Frontend

### 3.2. Header da Aplicação

#### Tarefas de Backend (Tawkee API)

1.  **Endpoint de Busca de Agentes por Nome:**
    *   **Descrição:** Criar um endpoint que permita buscar agentes por nome dentro do workspace atual do usuário.
    *   **Detalhes:**
        *   O endpoint deve receber um termo de busca (string) e o `workspaceId`.
        *   Deve retornar uma lista de agentes que correspondem ao termo de busca (nome parcial ou completo), incluindo `agentId` e nome, para facilitar o redirecionamento no frontend.
        *   Considerar performance para buscas em workspaces com muitos agentes (ex: paginação, indexação no banco).
        *   Endpoint: `GET /workspaces/:workspaceId/agents/search?name=searchText`
    *   **Classificação:** Backend

2.  **Estrutura e Endpoints para Notificações:**
    *   **Descrição:** Implementar a tabela `Notification` no banco de dados e os endpoints necessários para gerenciar e recuperar notificações por usuário/workspace. Também implementar a tabela `NotificationRead` no banco, para relacionar cada usuário às suas notificações lidas.
    *   **Detalhes:**
        *   **Tabela `Notification`:**
            *   `id` (PK)
            *   `event` (Enum: `SUBSCRIPTION`, `CONNECTION`, `PAYMENT`, `AGENT_STATUS`, `MESSAGE_ALERT`, etc. - expandir conforme necessário)
            *   `timestamp` (Data/Hora da notificação)
            *   `description` (Texto da notificação)
            *   `link` (String, URL opcional para redirecionamento no frontend)
            *   `workspaceId` (FK para Workspace)
            *   `userId` (FK para User, se a notificação for específica do usuário e não do workspace)
        *   **Tabela `NotificationRead`:**
            *   `id` (PK)
            *   `readAt` (Data/Hora da leitura)
            *   `notificationId` (FK para Notification)
            *   `userId` (FK para User)
        *   **Lógica de Criação de Notificações:** Integrar a criação de notificações nos serviços existentes sempre que eventos relevantes ocorrerem (ex: mudança de status de conexão de canal, atualização de assinatura, pagamento recebido/falho, agente inativo por muito tempo, interação aguardando humano por muito tempo).
        *   **Endpoint para Listar Notificações:** `GET /workspaces/:workspaceId/notifications` (com paginação).
        *   **Endpoint para Marcar Notificações como Lidas:** `PATCH /notifications/:notificationId/read` ou um endpoint para marcar todas como lidas `PATCH /workspaces/:workspaceId/notifications/read-all`.
    *   **Classificação:** Backend

#### Tarefas de Frontend

1.  **Componente de Busca de Agentes:**
    *   **Descrição:** Implementar o campo de busca de agentes no header.
    *   **Detalhes:**
        *   Input de texto para o usuário digitar o nome do agente.
        *   Ao digitar, fazer chamadas (com debounce) para o endpoint de busca do backend.
        *   Exibir os resultados em um dropdown ou lista sugestiva.
        *   Ao selecionar um agente, redirecionar para a página `agents/:agentId`.
    *   **Classificação:** Frontend

2.  **Exibição de Créditos do Workspace:**
    *   **Descrição:** Exibir o total de créditos do workspace selecionado no header.
    *   **Detalhes:**
        *   Obter a informação de créditos do estado global da aplicação (que deve ser carregado após login/seleção de workspace).
        *   Atualizar dinamicamente se os créditos mudarem.
    *   **Classificação:** Frontend

3.  **Componente de Central de Notificações ("Sininho"):**
    *   **Descrição:** Implementar o ícone de notificações e o painel/lista de notificações.
    *   **Detalhes:**
        *   Ícone de "sininho" no header, possivelmente com um contador de notificações não lidas.
        *   Ao clicar, abrir um dropdown/painel que lista as notificações (obtidas do endpoint do backend).
        *   Cada notificação deve exibir sua descrição e timestamp.
        *   Notificações não lidas devem ter destaque visual.
        *   Ao clicar em uma notificação, marcá-la como lida (chamada ao backend) e, se houver um `link`, redirecionar o usuário.
        *   Opção para "Marcar todas como lidas".
    *   **Classificação:** Frontend

4.  **Menu de Configurações do Usuário (Dropdown):**
    *   **Descrição:** Implementar o menu dropdown acessado ao clicar no nome/avatar do usuário no header.
    *   **Detalhes:**
        *   Exibir nome completo, e-mail do usuário.
        *   Opções de navegação/funcionalidades:
            *   Settings de idioma (leva à seção de configurações).
            *   Settings de tema (dark/light) - funcionalidade de toggle direto ou link para configurações.
            *   Link para Tutoriais (página estática ou externa).
            *   Link para Suporte (redirecionamento para WhatsApp).
            *   Link para Comunidade no Discord (link externo).
            *   Botão de Logout (chamar endpoint de logout do backend, limpar estado local e redirecionar para login).
    *   **Classificação:** Frontend

5.  **Implementação de Internacionalização (i18n):**
    *   **Descrição:** Configurar e aplicar i18n em todo o projeto frontend.
    *   **Detalhes:**
        *   Escolher e configurar uma biblioteca de i18n (ex: `react-i18next`, `vue-i18n`).
        *   Criar arquivos de tradução para Português (PT), Inglês (UK) e Espanhol (ES) para todos os textos da interface.
        *   Implementar um seletor de idioma (provavelmente no menu de configurações do usuário ou no footer).
        *   Garantir que a troca de idioma atualize dinamicamente toda a interface.
    *   **Classificação:** Frontend

6.  **Implementação de Tema (Dark/Light Mode):**
    *   **Descrição:** Permitir que o usuário alterne entre um tema claro e um escuro.
    *   **Detalhes:**
        *   Definir paletas de cores para ambos os temas.
        *   Implementar a lógica para aplicar o tema selecionado (ex: usando variáveis CSS, classes no body, ou Context API no React).
        *   Salvar a preferência do usuário (localStorage ou no perfil do backend, se desejado).
        *   Criar um toggle para alternar o tema (no menu de configurações do usuário).
    *   **Classificação:** Frontend

### 3.3. Sidebar e Gerenciamento de Workspaces

#### Tarefas de Backend (Tawkee API)

1.  **Refatoração do Endpoint de Criação de Usuários e Criação de Workspaces:**
    *   **Descrição:** O documento original menciona "Refatoração do endpoint de criação de usuários para passar a consumir esse mesmo método [de criação de workspace]". Isso implica que, ao criar um usuário, um workspace inicial (TRIAL) deve ser criado e associado a ele automaticamente.
    *   **Detalhes:**
        *   Modificar o `AuthService` ou `UserService` para, após a criação bem-sucedida de um usuário, chamar o `WorkspaceService` para criar um workspace padrão para este usuário.
        *   O `WorkspaceService` já possui CRUD, mas o método de criação pode precisar ser ajustado para lidar com a criação inicial (ex: definir plano TRIAL, alocar créditos iniciais se houver).
        *   Garantir que o usuário seja definido como proprietário (ou admin) do workspace criado.
    *   **Classificação:** Backend

2.  **Endpoint para Criação de Novos Workspaces por Usuário Existente:**
    *   **Descrição:** Criar um endpoint que permita a um usuário logado criar workspaces adicionais.
    *   **Detalhes:**
        *   Endpoint: `POST /workspaces`
        *   Receber o nome do novo workspace e, opcionalmente, outras configurações iniciais.
        *   Associar o usuário logado como proprietário/admin do novo workspace.
        *   Novos workspaces devem iniciar com status de assinatura TRIAL (ou conforme regras de negócio).
        *   Validar limites de quantos workspaces um usuário pode criar, se houver.
    *   **Classificação:** Backend

3.  **Endpoint para Listar Workspaces do Usuário:**
    *   **Descrição:** Endpoint para que o frontend possa listar os workspaces aos quais o usuário logado tem acesso.
    *   **Detalhes:**
        *   Endpoint: `GET /workspaces` (retorna lista de workspaces do usuário logado).
        *   Incluir informações básicas de cada workspace (ID, nome, plano/status).
    *   **Classificação:** Backend

4.  **Endpoint para Definir Workspace Ativo (Opcional, pode ser gerenciado no frontend):**
    *   **Descrição:** Se a preferência do workspace ativo precisar ser persistida no backend.
    *   **Detalhes:**
        *   Endpoint: `PATCH /users/me/active-workspace` (recebe `workspaceId`).
        *   Atualizar um campo no modelo `User` para armazenar o `activeWorkspaceId`.
        *   Alternativamente, o frontend pode gerenciar isso localmente (localStorage) e passar o `workspaceId` relevante em cada requisição.
    *   **Classificação:** Backend (Opcional)

#### Tarefas de Frontend

1.  **Componente de Seleção e Criação de Workspace:**
    *   **Descrição:** Implementar a interface no header ou sidebar para o usuário selecionar entre seus workspaces existentes e criar novos.
    *   **Detalhes:**
        *   Dropdown ou menu que lista os workspaces do usuário (obtidos do backend).
        *   Ao selecionar um workspace, atualizar o estado global da aplicação para refletir o workspace ativo e recarregar dados relevantes (créditos, agentes, etc.).
        *   Opção "Criar Novo Workspace" que abre um modal/formulário para o usuário inserir o nome do novo workspace e chamar o endpoint de criação do backend.
    *   **Classificação:** Frontend

2.  **Implementação do Sidebar com Links e Permissões:**
    *   **Descrição:** Construir o componente Sidebar com os links de navegação e aplicar a lógica de permissões para exibir/ocultar links conforme o tipo de usuário (role).
    *   **Detalhes:**
        *   Estruturar os links conforme definido: Visão Geral, Meu Time (Agentes, Equipe), Comunicação (Chat, Contatos), Conta (Faturamento, Configurações).
        *   Obter a role do usuário logado.
        *   Condicionalmente renderizar os links/seções do sidebar com base na role:
            *   Regular: todos os links.
            *   Atendente: Comunicação, Conta: Configurações.
            *   Treinador: Meu Time: Agentes, Comunicação, Conta: Configurações.
            *   Gerente: Todos, exceto Conta: Faturamento.
        *   Destaque visual para o workspace selecionado no topo ou dentro do sidebar.
    *   **Classificação:** Frontend

### 3.4. Página Home: Dashboard

#### Tarefas de Backend (Tawkee API)

1.  **Endpoint de Métricas do Dashboard:**
    *   **Descrição:** Criar um endpoint robusto para fornecer todos os dados necessários para os cards de métricas e gráficos do dashboard, com base em um período selecionado.
    *   **Detalhes:**
        *   Endpoint: `GET /workspaces/:workspaceId/dashboard-metrics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
        *   **Dados a serem retornados:**
            *   **Interações Concluídas:**
                *   Total de interações com status `RESOLVED`.
                *   Contagem de interações resolvidas por agentes (IA) (onde `interaction.userId` é nulo).
                *   Contagem de interações resolvidas por humanos (onde `interaction.userId` aponta para um usuário humano).
                *   Lista de IDs de interações concluídas por IA.
                *   Lista de IDs de interações concluídas por humanos.
            *   **Interações em Andamento:**
                *   Total de interações com status `EM_ANDAMENTO` ou `ALERTA`.
                *   Contagem de interações com status `WAITING` (aguardando atendimento humano).
                *   Lista de IDs de interações em andamento.
                *   Lista de IDs de interações aguardando humano.
            *   **Tempo Médio de Interação:**
                *   Calcular a média da diferença entre `resolvedAt` e `createdAt` para interações `RESOLVED` no período.
                *   Opcional: separar tempo médio para IA vs Humano.
            *   **Consumo de Créditos por Dia:**
                *   Array de objetos `{ date: YYYY-MM-DD, totalCredits: number, creditsByAgent: [{ agentId: string, agentName: string, credits: number }] }` para o gráfico.
                *   Isso requer que o consumo de crédito seja registrado com timestamp e associado a um agente.
            *   **Top Agentes por Consumo de Crédito:**
                *   Lista dos 5 agentes que mais consumiram créditos no período (avatar, nome, jobName, créditos gastos).
            *   **Top Modelos por Consumo de Crédito (ou Uso):**
                *   Lista dos 5 modelos de IA mais usados ou que mais consumiram créditos (nome do modelo, créditos). Requer que o uso de modelo e custo sejam rastreados por interação/mensagem.
        *   Otimizar queries para performance, especialmente com grandes volumes de dados e ranges de data extensos.
        *   Considerar a necessidade de tabelas de agregação ou sumarização para métricas se o cálculo em tempo real for muito lento.
    *   **Classificação:** Backend

2.  **Refatoração do Endpoint de Consumo de Créditos por Agente:**
    *   **Descrição:** O documento menciona refatorar `@Get('agent/:agentId/credits-spent')` para `@Get('workspace/:workspaceId/agents/credits_spent')`. Esta funcionalidade parece ser coberta pelo novo endpoint de métricas do dashboard, mas se um endpoint específico para consumo de crédito por agente ainda for necessário, ele deve ser ajustado.
    *   **Detalhes:**
        *   Se mantido, o endpoint deve aceitar `workspaceId` e um período (startDate, endDate) como query params.
        *   Retornar o consumo de créditos para todos os agentes no workspace no período, e possivelmente agrupado por modelo de IA utilizado por esses agentes.
        *   Verificar se a tabela `Agent` ou uma tabela relacionada (ex: `CreditConsumptionLog`) armazena os dados de consumo de forma granular o suficiente (por agente, por modelo, por dia/interação).
    *   **Classificação:** Backend

#### Tarefas de Frontend

1.  **Componente de Filtro de Período:**
    *   **Descrição:** Implementar os seletores de data para filtrar as métricas do dashboard.
    *   **Detalhes:**
        *   Botões para períodos predefinidos (7/14/30 dias).
        *   Componente de seleção de intervalo de datas customizado (Date Range Picker).
        *   Ao alterar o filtro, chamar novamente o endpoint de métricas do backend com as novas datas e atualizar todos os componentes do dashboard.
        *   Gerenciar o estado do filtro (datas selecionadas).
    *   **Classificação:** Frontend

2.  **Componentes para Cards de Métricas:**
    *   **Descrição:** Criar componentes reutilizáveis para exibir cada métrica principal.
    *   **Detalhes:**
        *   Card para "Interações Concluídas" (total, % IA vs Humano).
        *   Card para "Interações em Andamento" (total, quantos aguardando humano).
        *   Card para "Tempo Médio de Interação".
        *   Tornar os números/seções dos cards clicáveis, redirecionando para a página de Chats com filtros apropriados (ex: `chat?status=WAITING`).
    *   **Classificação:** Frontend

3.  **Componente de Gráfico de Consumo de Créditos:**
    *   **Descrição:** Implementar o gráfico de consumo de créditos por dia.
    *   **Detalhes:**
        *   Utilizar uma biblioteca de gráficos (ex: Chart.js, Recharts, Nivo).
        *   Eixo X: Datas, Eixo Y: Créditos.
        *   Exibir uma série para o total de créditos. Opcional: séries empilhadas para consumo por agente.
        *   Tooltips interativos no gráfico.
    *   **Classificação:** Frontend

4.  **Componentes para Listas de Top Agentes e Top Modelos:**
    *   **Descrição:** Criar componentes para exibir as listas de top 5 agentes e top 5 modelos.
    *   **Detalhes:**
        *   **Top Agentes:** Exibir avatar, nome, jobName e créditos gastos.
        *   **Top Modelos:** Exibir nome do modelo e créditos associados.
        *   Formatação clara e concisa.
    *   **Classificação:** Frontend

### 3.5. Página de Gerenciamento de Agentes

#### Tarefas de Backend (Tawkee API)

1.  **Endpoint para Transferência de Agente entre Workspaces:**
    *   **Descrição:** Implementar a lógica e o endpoint para mover um agente de um workspace para outro, pertencente ao mesmo usuário.
    *   **Detalhes:**
        *   Endpoint: `PATCH /agents/:agentId/transfer` ou `POST /workspaces/:targetWorkspaceId/agents/:agentId`
        *   Receber o `agentId` e o `targetWorkspaceId`.
        *   Validar se o usuário tem permissão em ambos os workspaces.
        *   Atualizar o `workspaceId` do agente.
        *   Considerar o que acontece com dados relacionados ao agente no workspace original (chats, interações, configurações específicas do workspace). A política de transferência (copiar, mover, limpar) precisa ser definida.
    *   **Classificação:** Backend

2.  **Suporte a Múltiplos Modelos de IA por Agente:**
    *   **Descrição:** O frontend descreve uma seleção detalhada de modelos de IA de diferentes provedores (OpenAI, Anthropic, Meta, etc.) com custos de crédito associados. O backend precisa suportar essa configuração.
    *   **Detalhes:**
        *   Atualizar o modelo `Agent` ou `AgentSettings` para armazenar o provedor de IA selecionado (ex: `aiProvider`: "OPENAI", "ANTHROPIC") e o identificador específico do modelo (ex: `aiModel`: "gpt-4o", "claude-3.5-sonnet").
        *   Manter uma configuração centralizada (pode ser no código, em um arquivo de configuração, ou em uma nova tabela `AIModel`) com a lista de modelos suportados, seus provedores, nomes amigáveis e custos de crédito por unidade (ex: por resposta, por token). Ex: `{ provider: 

AIModel", modelId: "gpt-4o", name: "GPT-4o", costPerUnit: 5 }`.
        *   A lógica de interação com a IA no `AIService` (ou similar) precisará ser adaptada para chamar a API do provedor correto (OpenAI, Anthropic, etc.) com base na configuração do agente. Isso pode envolver a criação de múltiplos clientes de API ou um wrapper genérico que direcione para o SDK/cliente apropriado.
        *   O cálculo de consumo de créditos precisará usar o `costPerUnit` do modelo selecionado, que deve ser recuperado da configuração centralizada de modelos.
    *   **Classificação:** Backend

3.  **Gerenciamento de Fontes de Conhecimento (Treinamentos) para Agentes:**
    *   **Descrição:** Implementar a capacidade dos agentes utilizarem diversas fontes de conhecimento (arquivos, URLs, FAQs) para embasar suas respostas, incluindo o processamento e armazenamento vetorial desses dados.
    *   **Detalhes:**
        *   **Tabela `KnowledgeSource`:** `id` (PK), `agentId` (FK para Agent), `type` (Enum: `FILE`, `URL`, `FAQ`), `sourceName` (nome do arquivo original, URL fornecida), `status` (Enum: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `DELETING`), `storagePath` (caminho para o arquivo original, se aplicável), `processedContentHash` (para detectar mudanças), `vectorIds` (JSONB, para referenciar vetores no DB vetorial), `metadata` (JSONB, para erros, número de chunks, etc.), `createdAt`, `updatedAt`.
        *   **Upload de Arquivos:** Endpoint `POST /agents/:agentId/knowledge-sources/file-upload`. Aceitar PDF, TXT, DOCX, CSV. Armazenar o arquivo original (ex: S3). Disparar job assíncrono para processamento.
        *   **Adicionar URL:** Endpoint `POST /agents/:agentId/knowledge-sources/url`. Receber URL. Disparar job assíncrono para scraping e processamento.
        *   **Adicionar FAQ:** Endpoint `POST /agents/:agentId/knowledge-sources/faq`. Receber lista de Q&A. Processar diretamente ou via job.
        *   **Processamento Assíncrono (Job):** Para `FILE` e `URL`:
            1.  Extrair texto puro do conteúdo.
            2.  Limpar e pré-processar o texto.
            3.  Dividir o texto em chunks significativos.
            4.  Para cada chunk, gerar um embedding vetorial usando um modelo de embedding (ex: da OpenAI).
            5.  Armazenar os vetores e o texto original dos chunks em um banco de dados vetorial (ex: Pinecone, Weaviate, pgvector no PostgreSQL). Associar os vetores à `KnowledgeSource`.
            6.  Atualizar o status da `KnowledgeSource` para `COMPLETED` ou `FAILED`.
        *   **Endpoints Adicionais:** `GET /agents/:agentId/knowledge-sources` (listar), `DELETE /knowledge-sources/:sourceId` (remover fonte e seus vetores associados).
        *   **Integração com Geração de Resposta (RAG - Retrieval Augmented Generation):** No `AIService`, antes de chamar o LLM principal:
            1.  Gerar um embedding para a pergunta/mensagem do usuário.
            2.  Realizar uma busca por similaridade no banco de dados vetorial usando o embedding da pergunta, filtrando pelas fontes de conhecimento do agente ativo.
            3.  Recuperar os N chunks de texto mais relevantes.
            4.  Injetar esses chunks como contexto adicional no prompt enviado ao LLM.
    *   **Classificação:** Backend

4.  **Gerenciamento de Intenções para Agentes:**
    *   **Descrição:** Permitir a definição de intenções e exemplos de frases para ajudar a guiar o comportamento do agente e identificar o propósito do usuário.
    *   **Detalhes:**
        *   **Tabela `Intent`:** `id` (PK), `agentId` (FK para Agent), `name` (string, único por agente), `description` (text), `examplePhrases` (TEXT[], frases de exemplo que ativam a intenção), `createdAt`, `updatedAt`.
        *   Endpoints CRUD para Intenções: `POST /agents/:agentId/intents`, `GET /agents/:agentId/intents`, `GET /intents/:intentId`, `PATCH /intents/:intentId`, `DELETE /intents/:intentId`.
        *   **Integração com Geração de Resposta:** Na lógica de processamento de mensagens, antes de ou em conjunto com a busca RAG, tentar classificar a mensagem do usuário em uma das intenções definidas para o agente. Isso pode ser feito por:
            *   Correspondência de palavras-chave simples (menos robusto).
            *   Similaridade de embeddings entre a mensagem do usuário e as `examplePhrases` de cada intenção.
            *   Usar um modelo de NLU/classificação de texto (pode ser um LLM menor ou um serviço dedicado).
        *   A intenção identificada (se houver) pode ser usada para: fornecer contexto adicional ao prompt do LLM principal, selecionar um prompt template específico, ou até mesmo disparar ações programáticas pré-definidas em vez de uma resposta puramente gerada por LLM.
    *   **Classificação:** Backend

5.  **Configurações de Transferência Humana Aprimoradas:**
    *   **Descrição:** Expandir as configurações para transferência humana, incluindo regras e notificações.
    *   **Detalhes:**
        *   No modelo `AgentSettings`, adicionar/refinar campos como: `humanTransferKeywords` (TEXT[]), `maxConsecutiveBotMessagesWithoutResolution` (integer), `humanTransferRequestMessage` (mensagem que o bot envia ao transferir), `notifyTeamOnTransfer` (boolean), `humanTransferNotificationChannels` (JSONB, ex: `["email", "platform"]`).
        *   Na lógica de processamento de mensagens, verificar essas condições. Se uma condição for atendida, mudar o status da `Interaction` para `WAITING` (ou um novo status como `TRANSFER_REQUESTED`) e disparar notificações para a equipe do workspace (via sistema de Notificações da plataforma e/ou e-mail, se configurado).
    *   **Classificação:** Backend

#### Tarefas de Frontend (Página de Gerenciamento de Agentes - Continuação)

6.  **Modal de Criar Agente (UI de Slider/Wizard):**
    *   **Descrição:** Implementar o fluxo de criação de agente passo a passo, conforme descrito anteriormente.
    *   **Detalhes:** Componente modal com navegação entre etapas (Nome, Objetivo, Contexto (`jobName`, `jobDescription`), Configs Iniciais (`enabledHumanTransfer`, `enabledEmoji`, `limitSubjects`, `splitMessages`), Confirmação, Próximos Passos). Validação em cada etapa. Chamada ao endpoint de criação de agente. Redirecionamento para Modal de Detalhes do Agente.
    *   **Classificação:** Frontend

7.  **Lista de Agentes (com Filtros, Paginação, Ações):**
    *   **Descrição:** Exibir a lista de agentes do workspace com funcionalidades de gerenciamento, conforme descrito.
    *   **Detalhes:** Tabs de filtro (TODOS, ATIVOS, INATIVOS). Paginação. Lista com Avatar, Nome, Status (chip), Função (`jobName`). Menu de ações (Editar, Ativar/Inativar, Mover, Remover) com modais de confirmação e chamadas aos endpoints corretos.
    *   **Classificação:** Frontend

8. **Modal de Detalhes do Agente (Completo):**
    *   **Descrição:** Interface rica para visualizar e editar todas as configurações do agente, conforme detalhado anteriormente.
    *   **Detalhes:**
        *   **Layout:** Sidebar à esquerda, conteúdo à direita.
        *   **Sidebar:** Upload/Edição de Avatar. Campos editáveis para Nome, JobName. **Seleção de Modelo de IA** (Dropdowns para Provedor e Modelo, exibindo custos, salvando no backend). Links para seções.
        *   **Seção Perfil:** Formulário para Nome, Estilo de Comunicação, Comportamento, Descrição da Empresa, Website, Cargo. Salvar no backend.
        *   **Seção Treinamentos (Fontes de Conhecimento):** UI para upload de arquivos, adicionar URL, adicionar FAQs. Lista de fontes com status, opções de remover. Integração com endpoints do backend.
        *   **Seção Intenções:** UI para CRUD de intenções (Nome, Descrição, Exemplos). Integração com endpoints.
        *   **Seção Canais:** UI para WhatsApp (conectar/desconectar QR code, status). Placeholders para Instagram/Website.
        *   **Seção Transferência Humana:** Formulário para configurar gatilhos (palavras-chave, nº mensagens), mensagem de transferência, opções de notificação. Salvar no backend.
        *   **Seção Limites de Uso (por usuário final):** Formulário para configurar limites e mensagem. Salvar no backend.
        *   **Seção Histórico:** Exibir log de alterações do agente (requer endpoint de backend para buscar esses logs específicos do agente).
        *   **Seção Configurações Avançadas:** UI para Webhooks do Agente (CRUD de webhooks). UI para Chaves de API do Agente (gerar, listar, revogar). Botão para Apagar Agente (com confirmação).
    *   **Classificação:** Frontend

### 3.6. Página de Gerenciamento de Equipe

#### Tarefas de Backend (Tawkee API)

1.  **Sistema de Convites para Membros da Equipe:**
    *   **Descrição:** Implementar a lógica para convidar usuários para um workspace com uma role específica.
    *   **Detalhes:**
        *   **Tabela `WorkspaceMemberInvite`:** `id` (PK), `workspaceId` (FK), `email` (string), `role` (Enum: `ADMIN`, `MANAGER`, `TRAINER`, `AGENT_USER`), `token` (string, único e com expiração), `status` (Enum: `PENDING`, `ACCEPTED`, `EXPIRED`, `CANCELED`), `invitedByUserId` (FK para User), `createdAt`, `expiresAt`.
        *   Endpoint `POST /workspaces/:workspaceId/invites`: Recebe email, role. Gera token, salva convite, envia e-mail (via Resend) com link de convite (ex: `frontend_url/accept-invite?token=xyz`).
        *   Endpoint `POST /invites/accept`: Recebe `token`. Valida o token. Se o usuário (pelo email do convite) não existir, pode guiar para registro. Se existir, ou após registro, adiciona o usuário à tabela `WorkspaceUser` com a role do convite. Marca o convite como `ACCEPTED`.
        *   Endpoint para reenviar convite (se pendente e não expirado).
        *   Endpoint para cancelar um convite pendente.
    *   **Classificação:** Backend

2.  **Gerenciamento de Roles e Permissões no Workspace:**
    *   **Descrição:** Definir e aplicar roles (Atendente, Treinador, Gerente, Admin) dentro de um workspace, controlando acesso a funcionalidades.
    *   **Detalhes:**
        *   **Tabela `WorkspaceUser` (ou `WorkspaceMember`):** `userId` (FK), `workspaceId` (FK), `role` (Enum: `ADMIN`, `MANAGER`, `TRAINER`, `AGENT_USER`). PK composta (`userId`, `workspaceId`).
        *   Endpoint `GET /workspaces/:workspaceId/members`: Listar membros e seus status de convite (se aplicável).
        *   Endpoint `PATCH /workspaces/:workspaceId/members/:memberUserId`: Atualizar a role de um membro.
        *   Endpoint `DELETE /workspaces/:workspaceId/members/:memberUserId`: Remover um membro do workspace (não deleta o usuário da plataforma, apenas do workspace).
        *   Implementar Guards no NestJS (ex: `@Roles("ADMIN", "MANAGER")`) para proteger endpoints da API com base na role do usuário no workspace específico. O `AuthGuard` deve carregar as permissões do usuário para o workspace em questão.
    *   **Classificação:** Backend

#### Tarefas de Frontend

1.  **Interface para Convidar Membros:**
    *   **Descrição:** Modal/formulário para enviar convites.
    *   **Detalhes:** Input para email do convidado, select para a Role. Chamada ao endpoint de criar convite. Feedback ao usuário.
    *   **Classificação:** Frontend

2.  **Lista de Membros da Equipe:**
    *   **Descrição:** Exibir membros do workspace, suas roles e status de convite.
    *   **Detalhes:** Tabela com Avatar, Nome, Email, Role, Status (ex: Ativo, Convite Pendente, Convite Expirado). Ações contextuais: Editar Role (para membros ativos), Reenviar Convite, Cancelar Convite (para pendentes), Remover Membro. Chamadas aos respectivos endpoints.
    *   **Classificação:** Frontend

3.  **Fluxo de Aceitação de Convite:**
    *   **Descrição:** Páginas para o usuário convidado aceitar o convite.
    *   **Detalhes:** Página acessada pelo link do e-mail. Se o usuário não estiver logado/registrado, guiar por esse fluxo primeiro. Após login/registro, exibir detalhes do convite e botão para aceitar. Chamada ao endpoint de aceitar convite. Redirecionar para o workspace.
    *   **Classificação:** Frontend

### 3.7. Página de Chat / Atendimentos

#### Tarefas de Backend (Tawkee API)

1.  **Endpoints Aprimorados para Gerenciamento de Chats pela UI:**
    *   **Descrição:** Endpoints para suportar a interface de chat, incluindo listagem com filtros avançados, busca, e ações sobre os chats.
    *   **Detalhes:**
        *   `GET /workspaces/:workspaceId/chats`: Listar chats com paginação. Query params para filtros: `status` (ex: `UNREAD`, `WAITING_HUMAN`, `RESOLVED`, `OPEN`, `CLOSED`), `channelId`, `agentId`, `contactNameOrPhone`, `assignedToUserId` (para atendente humano). Ordenação.
        *   `GET /chats/:chatId/messages`: Listar mensagens de um chat com paginação (scroll infinito).
        *   `POST /chats/:chatId/messages`: Enviar mensagem de um atendente humano para o usuário final. O backend deve identificar que é um humano enviando (baseado no `userId` do token JWT) e encaminhar via Evolution API. Registrar a mensagem com `senderType: 'HUMAN_AGENT'`.
        *   `PATCH /chats/:chatId/status`: Mudar status do chat (ex: para `RESOLVED`, `CLOSED`).
        *   `PATCH /chats/:chatId/assign`: Atribuir/Reatribuir chat a um atendente humano específico (`assignedToUserId` na tabela `Interaction` ou `Chat`).
        *   `PATCH /chats/:chatId/take-over`: Atendente humano assume o chat (pode mudar status, registrar quem assumiu).
        *   `PATCH /chats/:chatId/return-to-bot`: Devolver chat para o agente IA (pode mudar status, limpar `assignedToUserId`).
        *   Considerar WebSockets para atualizações em tempo real na lista de chats e no chat ativo (novas mensagens, mudanças de status).
    *   **Classificação:** Backend

2.  **Suporte a Templates de Mensagens (Respostas Rápidas):**
    *   **Descrição:** Permitir que atendentes usem mensagens pré-definidas.
    *   **Detalhes:**
        *   **Tabela `MessageTemplate`:** `id` (PK), `workspaceId` (FK), `name` (string), `content` (text), `tags` (JSONB, para categorização), `scope` (Enum: `GLOBAL`, `USER` - se templates podem ser pessoais), `createdByUserId` (FK opcional).
        *   Endpoints CRUD para `MessageTemplate` (`/workspaces/:workspaceId/message-templates`).
    *   **Classificação:** Backend

3.  **Notas Internas sobre Chats/Contatos:**
    *   **Descrição:** Permitir que atendentes adicionem notas privadas visíveis apenas para a equipe.
    *   **Detalhes:**
        *   **Tabela `InternalNote`:** `id` (PK), `chatId` (FK, opcional), `contactId` (FK, opcional), `workspaceId` (FK), `userId` (FK do atendente que criou), `content` (text), `createdAt`, `updatedAt`.
        *   Endpoints CRUD para `InternalNote`, associadas a um chat ou contato (`/chats/:chatId/notes`, `/contacts/:contactId/notes`).
    *   **Classificação:** Backend

#### Tarefas de Frontend

1.  **Layout de Três Colunas para Chat:**
    *   **Descrição:** Implementar o layout principal da página de chat.
    *   **Detalhes:** Coluna esquerda (lista de chats), coluna central (chat ativo), coluna direita (detalhes do contato/agente/notas).
    *   **Classificação:** Frontend

2.  **Lista de Chats (Coluna Esquerda):**
    *   **Descrição:** Componente para exibir e filtrar a lista de chats.
    *   **Detalhes:** Dropdowns/botões para filtros (Status, Canal, Agente, Atendente). Campo de busca. Lista de chats com Avatar do contato, Nome, Trecho da última mensagem, Tempo, Status, Ícone do canal. Ao selecionar um chat, carregá-lo na coluna central. Atualizações em tempo real (via polling ou WebSocket).
    *   **Classificação:** Frontend

3.  **Chat Ativo (Coluna Central):**
    *   **Descrição:** Componente para exibir mensagens e enviar novas.
    *   **Detalhes:** Header com nome do contato, status, botões de ação (Assumir/Devolver ao Bot, Resolver, etc.). Área de exibição de mensagens (scroll para carregar mais antigas, formatação de mensagens). Input de mensagem com opções: Emojis, Anexar arquivos (upload para backend, que envia via WhatsApp se possível), Gravar e enviar mensagens de áudio (requer JS MediaRecorder API e envio para backend/WhatsApp), Usar templates de mensagens (buscar e inserir).
    *   **Classificação:** Frontend

4.  **Detalhes do Contato/Agente/Notas (Coluna Direita):**
    *   **Descrição:** Exibir informações contextuais e permitir adicionar notas.
    *   **Detalhes:** Abas ou seções para: Informações do Contato (Nome, Telefone, Email, Tags, campos customizados). Informações do Agente (se aplicável). Notas Internas (listar e adicionar novas notas). Histórico de Interações anteriores com o contato.
    *   **Classificação:** Frontend

5.  **Gerenciamento de Templates de Mensagens (UI):**
    *   **Descrição:** Interface para criar, editar e deletar templates de mensagens.
    *   **Detalhes:** Pode ser uma seção separada em Configurações ou um modal acessível da página de Chat. Lista de templates com busca e filtros. Formulário para criar/editar template (nome, conteúdo, tags).
    *   **Classificação:** Frontend

### 3.8. Página de Gerenciamento de Contatos

#### Tarefas de Backend (Tawkee API)

1.  **Endpoints CRUD para Contatos do Workspace:**
    *   **Descrição:** Gerenciar a base de contatos de um workspace.
    *   **Detalhes:**
        *   **Tabela `Contact`:** `id` (PK), `workspaceId` (FK), `name` (string), `phoneNumber` (string, único por workspace se for chave principal de identificação), `email` (string), `avatarUrl` (string), `tags` (JSONB), `customFields` (JSONB, para dados adicionais definidos pelo usuário), `createdAt`, `updatedAt`, `lastInteractionAt` (timestamp).
        *   `GET /workspaces/:workspaceId/contacts`: Listar contatos com paginação, filtros (por tag, etc.) e busca (nome, telefone, email).
        *   `POST /workspaces/:workspaceId/contacts`: Criar novo contato manualmente.
        *   `GET /contacts/:contactId`: Obter detalhes de um contato.
        *   `PATCH /contacts/:contactId`: Atualizar contato.
        *   `DELETE /contacts/:contactId`: Remover contato (ou marcar como arquivado).
        *   Endpoint para importação de contatos (de arquivo CSV): `POST /workspaces/:workspaceId/contacts/import`. Processamento assíncrono.
        *   Endpoint para exportação de contatos (para CSV): `GET /workspaces/:workspaceId/contacts/export`.
    *   **Classificação:** Backend

2.  **Gerenciamento de Tags para Contatos:**
    *   **Descrição:** Permitir criar e aplicar tags para organizar contatos.
    *   **Detalhes:** O campo `tags` (JSONB de strings) no modelo `Contact` pode ser suficiente. Se for necessário gerenciamento centralizado de tags (ex: para ver todas as tags usadas no workspace), uma tabela `Tag` (`id`, `workspaceId`, `name`) e uma tabela de junção `ContactTag` (`contactId`, `tagId`) seriam melhores. Endpoints para gerenciar tags do workspace (listar, criar, deletar) e para adicionar/remover tags de um contato.
    *   **Classificação:** Backend

#### Tarefas de Frontend

1.  **Interface de Lista de Contatos:**
    *   **Descrição:** Tabela para exibir contatos com ações, filtros e busca.
    *   **Detalhes:** Botões (Adicionar Contato, Importar Contatos, Exportar Contatos). Tabela com colunas (Checkbox de seleção, Avatar, Nome, Telefone, Email, Tags, Data da Última Interação). Ações por linha (Editar, Ver Histórico de Chats, Apagar). Filtros (por tag) e busca.
    *   **Classificação:** Frontend

2.  **Modal de Adicionar/Editar Contato:**
    *   **Descrição:** Formulário para inserir ou modificar os dados de um contato, incluindo campos customizados e tags.
    *   **Classificação:** Frontend

3.  **Interface para Gerenciamento de Tags de Contato:**
    *   **Descrição:** UI para criar novas tags, aplicar tags existentes a contatos, e remover tags.
    *   **Classificação:** Frontend

4.  **Funcionalidade de Importar/Exportar Contatos (UI):**
    *   **Descrição:** Interface para upload de arquivo CSV para importação (com mapeamento de colunas, se possível). Botão para iniciar a exportação (download do arquivo gerado pelo backend).
    *   **Classificação:** Frontend

### 3.9. Página de Faturamento

#### Tarefas de Backend (Tawkee API)

1.  **Integração Completa com Gateway de Pagamento (ex: Stripe):**
    *   **Descrição:** Implementar a lógica para gerenciar planos de assinatura, processar pagamentos e lidar com faturas.
    *   **Detalhes:**
        *   Escolher e configurar um gateway de pagamento (Stripe é uma boa opção com SDKs robustos).
        *   **Tabela `SubscriptionPlan`:** `id` (PK), `name` (string), `description` (text), `price` (decimal), `currency` (string, ex: BRL, USD), `billingCycle` (Enum: `MONTHLY`, `YEARLY`), `features` (JSONB, lista de features), `creditAllocation` (integer, créditos inclusos), `stripePriceId` (string, ID do preço no Stripe), `isActive` (boolean).
        *   **Tabela `Subscription`:** `id` (PK), `workspaceId` (FK), `planId` (FK para `SubscriptionPlan`), `stripeSubscriptionId` (string), `status` (Enum: `ACTIVE`, `CANCELED`, `PAST_DUE`, `INCOMPLETE`), `currentPeriodStart` (timestamp), `currentPeriodEnd` (timestamp), `cancelAtPeriodEnd` (boolean).
        *   **Tabela `Invoice` (ou `Payment`):** `id` (PK), `workspaceId` (FK), `subscriptionId` (FK, opcional), `amount` (decimal), `currency`, `status` (Enum: `PENDING`, `PAID`, `FAILED`, `REFUNDED`), `stripeInvoiceId` (string, opcional), `stripePaymentIntentId` (string, opcional), `invoicePdfUrl` (string, do Stripe), `paidAt` (timestamp), `createdAt`.
        *   **Endpoints:**
            *   `GET /subscription-plans`: Listar planos ativos.
            *   `POST /subscriptions/create-checkout-session`: Para iniciar a assinatura de um plano (redireciona para o Stripe Checkout ou usa Stripe Elements).
            *   `GET /subscriptions/my-subscription`: Ver detalhes da assinatura ativa do workspace.
            *   `POST /subscriptions/cancel`: Cancelar assinatura (geralmente `cancelAtPeriodEnd`).
            *   `POST /subscriptions/update`: Mudar de plano (upgrade/downgrade, lida com prorrogação no Stripe).
            *   `GET /invoices`: Listar histórico de faturas/pagamentos do workspace.
            *   `POST /billing/manage-payment-methods`: Redirecionar para o portal do cliente do Stripe para gerenciar cartões.
        *   **Webhooks do Stripe:** Configurar um endpoint para receber webhooks do Stripe (ex: `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`). Atualizar o status da assinatura e faturas no banco de dados da Tawkee com base nesses eventos. Alocar créditos quando `invoice.paid` para um plano.
    *   **Classificação:** Backend

2.  **Endpoint para Detalhes do Consumo de Créditos (Faturamento):**
    *   **Descrição:** Fornecer dados para a seção de consumo de créditos na página de faturamento, focando no período de faturamento atual ou histórico.
    *   **Detalhes:** `GET /workspaces/:workspaceId/billing/credit-usage?period=current_billing_cycle` ou com datas. Retornar consumo total, por agente, por modelo.
    *   **Classificação:** Backend

#### Tarefas de Frontend

1.  **Interface para Visualização do Plano Atual:**
    *   **Descrição:** Exibir detalhes do plano de assinatura do workspace.
    *   **Detalhes:** Nome do plano, preço, recursos, data de renovação/expiração. Botão para "Mudar Plano" ou "Gerenciar Assinatura".
    *   **Classificação:** Frontend

2.  **Página de Seleção/Upgrade/Downgrade de Planos:**
    *   **Descrição:** Listar planos disponíveis com opção de assinar ou mudar o plano atual. Integrar com o Stripe Checkout ou Stripe Elements para o processo de pagamento.
    *   **Classificação:** Frontend

3.  **Interface para Histórico de Faturas:**
    *   **Descrição:** Listar faturas com data, valor, status e link para download do PDF (obtido do backend/Stripe).
    *   **Classificação:** Frontend

4.  **Interface para Gerenciamento de Métodos de Pagamento:**
    *   **Descrição:** Link/botão para redirecionar ao portal do cliente do Stripe ou integrar Stripe Elements para adicionar/atualizar método de pagamento.
    *   **Classificação:** Frontend

5.  **Visualização do Consumo de Créditos (Faturamento):**
    *   **Descrição:** Exibir o consumo de créditos no período de faturamento atual, possivelmente com gráficos ou detalhamentos.
    *   **Classificação:** Frontend

### 3.10. Página de Configurações (Geral da Conta/Workspace)

#### Tarefas de Backend (Tawkee API)

1.  **Endpoints para Configurações do Perfil do Usuário:**
    *   **Descrição:** Permitir que o usuário atualize seu nome, e-mail (com verificação se alterado), avatar e senha.
    *   **Detalhes:**
        *   `PATCH /users/me`: Atualizar nome. Se e-mail for alterado, iniciar fluxo de verificação para o novo e-mail.
        *   Endpoint para upload de avatar do usuário (armazenar URL no modelo `User`).
        *   `POST /users/me/change-password`: Requer senha atual e nova senha.
    *   **Classificação:** Backend

2.  **Endpoints para Configurações do Workspace:**
    *   **Descrição:** Permitir atualizar nome do workspace, logo, fuso horário padrão, moeda padrão.
    *   **Detalhes:**
        *   `PATCH /workspaces/:workspaceId`: Atualizar nome, fuso horário, moeda.
        *   Endpoint para upload de logo do workspace (armazenar URL no modelo `Workspace`).
    *   **Classificação:** Backend

3.  **Configurações de Notificações da Plataforma (Preferências do Usuário):**
    *   **Descrição:** Armazenar e gerenciar as preferências de notificação do usuário (quais eventos geram notificações e por quais canais - email, in-app).
    *   **Detalhes:**
        *   **Tabela `UserNotificationPreference`:** `userId` (FK), `workspaceId` (FK, se a preferência for por workspace), `eventType` (Enum: `NEW_CHAT_MESSAGE`, `HUMAN_TRANSFER_REQUEST`, `SUBSCRIPTION_REMINDER`, etc.), `emailEnabled` (boolean), `inAppEnabled` (boolean).
        *   Endpoints `GET /users/me/notification-preferences` e `PUT /users/me/notification-preferences` para ler e atualizar o conjunto de preferências.
    *   **Classificação:** Backend

4.  **Logs de Atividade (Segurança):**
    *   **Descrição:** Registrar eventos importantes de segurança e atividade da conta/workspace para auditoria.
    *   **Detalhes:**
        *   **Tabela `ActivityLog`:** `id` (PK), `userId` (FK, quem realizou a ação), `workspaceId` (FK, opcional, contexto do workspace), `action` (string, ex: `USER_LOGIN`, `PASSWORD_CHANGED`, `AGENT_CREATED`, `WORKSPACE_SETTINGS_UPDATED`), `ipAddress` (string), `userAgent` (string), `timestamp` (datetime), `details` (JSONB, dados adicionais sobre a ação).
        *   Integrar a criação de logs nos serviços relevantes da aplicação (ex: após login, criação de agente, etc.).
        *   Endpoint `GET /workspaces/:workspaceId/activity-logs` (para admins do workspace verem logs do workspace) e `GET /users/me/activity-logs` (para usuário ver seus próprios logs). Com filtros e paginação.
    *   **Classificação:** Backend

5.  **Autenticação de Dois Fatores (2FA - TOTP):**
    *   **Descrição:** Implementar 2FA usando Time-based One-Time Passwords (ex: com Google Authenticator).
    *   **Detalhes:**
        *   Adicionar campos ao modelo `User`: `twoFactorSecret` (string, encriptado), `isTwoFactorEnabled` (boolean).
        *   Endpoint `POST /auth/2fa/setup`: Gerar um segredo TOTP, gerar QR code (URL de `otpauth://totp/...`). Retornar QR code e segredo (para backup manual pelo usuário).
        *   Endpoint `POST /auth/2fa/enable`: Receber código TOTP do usuário. Verificar. Se válido, salvar o `twoFactorSecret` (encriptado) e marcar `isTwoFactorEnabled = true`.
        *   Endpoint `POST /auth/2fa/verify`: Usado durante o login se 2FA estiver habilitado. Receber código TOTP e verificar.
        *   Endpoint `POST /auth/2fa/disable`: Requer senha atual ou código TOTP para desabilitar.
    *   **Classificação:** Backend

#### Tarefas de Frontend

1.  **Seção Perfil do Usuário (UI):**
    *   **Descrição:** Formulários para editar nome, e-mail (com aviso de reverificação), avatar (upload), e alterar senha.
    *   **Classificação:** Frontend

2.  **Seção Configurações do Workspace (UI):**
    *   **Descrição:** Formulários para editar nome do workspace, logo (upload), fuso horário (select), moeda (select).
    *   **Classificação:** Frontend

3.  **Seção Notificações da Plataforma (UI):**
    *   **Descrição:** Interface com toggles/checkboxes para o usuário configurar suas preferências de notificação para diferentes eventos e canais (email, in-app). Ler e salvar via API.
    *   **Classificação:** Frontend

4.  **Seção Integrações (UI Placeholder):**
    *   **Descrição:** Área para futuras integrações com outros serviços. Inicialmente pode ser apenas um placeholder.
    *   **Classificação:** Frontend

5.  **Seção Segurança (UI):**
    *   **Descrição:** Interface para setup e gerenciamento de 2FA (exibir QR code, campo para código de verificação, opção de desabilitar). Visualização de logs de atividade (tabela com dados do endpoint, filtros).
    *   **Classificação:** Frontend

## 4. Sequência Lógica de Implementação e Estimativas de Tempo

A seguir, uma sugestão de sequência lógica para a implementação das tarefas, agrupadas por sprints ou fases, com estimativas de tempo em "dias de desenvolvedor" (dd). Estas são estimativas de esforço e podem variar.

**Fase 1: Fundações e Autenticação Aprimorada (Backend Foco)**

1.  **<span style="color:green">Backend: Integração com Serviço de E-mail (Resend)</span>** (2 dd)
    *   <span style="color:green">Configuração, serviço de e-mail, templates básicos.</span>
2.  **<span style="color:green">Backend: Fluxo de Verificação de Conta por E-mail</span>** (1.5 dd)
    *   <span style="color:green">Geração/validação de token, endpoint, integração no registro.</span>
3.  **<span style="color:green">Backend: Fluxo de Esqueci Minha Senha</span>** (2 dd)
    *   <span style="color:green">Geração/validação de token, endpoints, envio de e-mail.</span>
4.  **<span style="color:green">Frontend: Interface para Recuperação de Senha e Verificação de Conta</span>** (2 dd)
    *   <span style="color:green">Telas, formulários, integração com backend.</span>
5.  **<span style="color:green">Backend: Integração OAuth (Google)</span>** (2.5 dd)
    *   <span style="color:green">Configuração Passport, endpoints, lógica de usuário.</span>
6.  **<span style="color:green">Frontend: Interface para Login/Registro com Google OAuth</span>** (1 dd)
    *   <span style="color:green">Botões, tratamento de redirect.</span>

*Subtotal Fase 1: ~11 dd*

**Fase 2: Workspace, Header e Dashboard Inicial (Backend + Frontend)**

1.  **Backend: Refatoração Criação de Usuário com Workspace Padrão** (1 dd)
2.  **Backend: Endpoint para Criação de Novos Workspaces** (1 dd)
3.  **Backend: Endpoint para Listar Workspaces do Usuário** (0.5 dd)
4.  **Frontend: Componente de Seleção e Criação de Workspace no Header/Sidebar** (2 dd)
5.  **Backend: Tabela `Notification` e Endpoints Básicos** (2 dd)
    *   Modelo, CRUD básico, endpoint de listagem e marcar como lida.
6.  **Backend: Criação de Notificações para Eventos Chave Iniciais** (ex: conexão de canal) (1.5 dd)
    *   Integrar nos serviços existentes.
7.  **Frontend: Implementação de i18n (Estrutura e Primeiras Traduções)** (2 dd)
8.  **Frontend: Implementação de Tema Dark/Light (Estrutura)** (1.5 dd)
9.  **Frontend: Componente de Central de Notificações ("Sininho")** (2 dd)
    *   UI, chamada API, marcar como lida.
10.  **Backend: Endpoint de Busca de Agentes por Nome (para Header)** (1 dd)
11.  **Frontend: Componente de Busca de Agentes no Header** (1 dd)
12. **Backend: Endpoint de Métricas do Dashboard (Versão Inicial)** (4 dd)
    *   Interações (concluídas, em andamento), tempo médio. Consumo de créditos básico.
13. **Frontend: Página Home/Dashboard com Filtro de Período e Cards de Métricas Iniciais** (3 dd)
14. **Frontend: Gráfico de Consumo de Créditos e Listas Top (Agentes/Modelos) - Versão Inicial** (2.5 dd)

*Subtotal Fase 2: ~25 dd*

**Fase 3: Gerenciamento de Agentes - Funcionalidades Core (Backend + Frontend)**

1.  **Backend: Suporte a Múltiplos Modelos de IA (Configuração e Custo)** (2 dd)
    *   Atualizar `Agent`/`AgentSettings`, config central de modelos.
2.  **Backend: Adaptação do `AIService` para Múltiplos Provedores/Modelos** (2.5 dd)
3.  **Backend: Endpoint para Transferência de Agente entre Workspaces** (1.5 dd)
4.  **Frontend: Modal de Criar Agente (Slider UI) - Funcionalidade Básica** (3 dd)
    *   Nome, Objetivo, Contexto, Configs Iniciais. Chamada API.
5.  **Frontend: Lista de Agentes (Filtros, Paginação, Ações Básicas - Ativar/Inativar, Editar, Remover)** (3 dd)
6.  **Frontend: Modal de Detalhes do Agente - Seção Perfil e Seleção de Modelo IA** (2.5 dd)
7.  **Backend: Gerenciamento de Fontes de Conhecimento (Estrutura DB, Upload de Arquivo e Processamento Básico de TXT)** (4 dd)
    *   Tabela `KnowledgeSource`, endpoint de upload, extração de texto simples, embeddings, armazenamento vetorial (pgvector ou similar).
8.  **Backend: Integração RAG Inicial no `AIService`** (2.5 dd)
    *   Busca vetorial e injeção no prompt.
9.  **Frontend: Modal de Detalhes do Agente - Seção Treinamentos (Upload TXT, Listagem)** (2 dd)

*Subtotal Fase 3: ~23 dd*

**Fase 4: Gerenciamento de Equipe e Permissões (Backend + Frontend)**

1.  **Backend: Tabela `WorkspaceUser` e Gerenciamento de Roles** (2 dd)
    *   Modelo, endpoints CRUD para membros, atribuição de roles.
2.  **Backend: Implementação de Guards de Permissão por Role nos Endpoints** (2.5 dd)
3.  **Backend: Sistema de Convites para Membros da Equipe (com envio de e-mail)** (3 dd)
4.  **Frontend: Página de Gerenciamento de Equipe (Listar, Convidar, Editar Role, Remover)** (3 dd)
5.  **Frontend: Fluxo de Aceitação de Convite** (1.5 dd)
6.  **Frontend: Aplicação de Permissões no Sidebar e outras áreas da UI** (2 dd)

*Subtotal Fase 4: ~14 dd*

**Fase 5: Chat / Atendimentos (Backend + Frontend)**

1.  **Backend: Endpoints Aprimorados para Gerenciamento de Chats (Listagem com Filtros, Envio de Mensagem Humana, Mudança de Status, Atribuição)** (4 dd)
2.  **Backend: Suporte a WebSockets para Atualizações em Tempo Real no Chat (Opcional, pode ser fase posterior)** (3 dd - se incluído)
3.  **Frontend: Layout de Três Colunas para Chat** (1 dd)
4.  **Frontend: Lista de Chats (Coluna Esquerda) com Filtros e Busca** (2.5 dd)
5.  **Frontend: Chat Ativo (Coluna Central) - Exibição de Mensagens, Input Básico** (3 dd)
6.  **Frontend: Detalhes do Contato/Agente (Coluna Direita) - Informações Básicas** (1.5 dd)
7.  **Backend: Suporte a Templates de Mensagens (Respostas Rápidas) - CRUD** (1.5 dd)
8.  **Frontend: Integração de Templates de Mensagens no Chat e UI de Gerenciamento** (2 dd)
9.  **Backend: Notas Internas sobre Chats/Contatos - CRUD** (1.5 dd)
10. **Frontend: Integração de Notas Internas na Coluna Direita do Chat** (1 dd)

*Subtotal Fase 5: ~19 dd (sem WebSockets) / ~22 dd (com WebSockets)*

**Fase 6: Funcionalidades Avançadas de Agentes (Backend + Frontend)**

1.  **Backend: Gerenciamento de Fontes de Conhecimento (Suporte a PDF, DOCX, CSV, URL)** (3 dd por tipo de fonte adicional, digamos 6 dd para PDF e URL)
    *   Jobs de processamento mais robustos.
2.  **Frontend: Modal de Detalhes do Agente - Seção Treinamentos (Suporte a Upload PDF/URL, Status de Processamento)** (2 dd)
3.  **Backend: Gerenciamento de Intenções (CRUD e Integração Básica na IA)** (3 dd)
4.  **Frontend: Modal de Detalhes do Agente - Seção Intenções (UI CRUD)** (2 dd)
5.  **Backend: Configurações de Transferência Humana Aprimoradas (Keywords, Notificações)** (2 dd)
6.  **Frontend: Modal de Detalhes do Agente - Seção Transferência Humana (UI)** (1.5 dd)
7.  **Backend: Webhooks do Agente (Saída) - CRUD e Disparo de Eventos** (2.5 dd)
8.  **Frontend: Modal de Detalhes do Agente - Seção Config. Avançadas (UI Webhooks)** (1.5 dd)
9.  **Backend: Chave de API Específica do Agente (Entrada) - Geração, Validação** (2.5 dd)
10. **Frontend: Modal de Detalhes do Agente - Seção Config. Avançadas (UI Chaves API)** (1.5 dd)

*Subtotal Fase 6: ~24.5 dd*

**Fase 7: Gerenciamento de Contatos e Configurações Gerais (Backend + Frontend)**

1.  **Backend: Endpoints CRUD para Contatos do Workspace (com Tags, Campos Customizados)** (3 dd)
2.  **Backend: Importação/Exportação de Contatos (CSV)** (2 dd)
3.  **Frontend: Página de Gerenciamento de Contatos (Lista, CRUD, Tags, Import/Export UI)** (4 dd)
4.  **Backend: Endpoints para Configurações do Perfil do Usuário (Nome, Email, Avatar, Senha)** (1.5 dd)
5.  **Frontend: Página de Configurações - Seção Perfil do Usuário (UI)** (1.5 dd)
6.  **Backend: Endpoints para Configurações do Workspace (Nome, Logo, Fuso, Moeda)** (1 dd)
7.  **Frontend: Página de Configurações - Seção Config. Workspace (UI)** (1 dd)
8.  **Backend: Configurações de Notificações da Plataforma (Preferências do Usuário)** (1.5 dd)
9.  **Frontend: Página de Configurações - Seção Notificações (UI)** (1 dd)
10. **Backend: Logs de Atividade (Segurança) - Registro e Endpoint de Listagem** (2.5 dd)
11. **Backend: Autenticação de Dois Fatores (2FA - TOTP)** (3 dd)
12. **Frontend: Página de Configurações - Seção Segurança (UI para 2FA e Logs)** (2.5 dd)

*Subtotal Fase 7: ~24.5 dd*

**Fase 8: Faturamento (Backend Foco Principal)**

1.  **Backend: Definição de Planos de Assinatura e Modelos (`SubscriptionPlan`, `Subscription`, `Invoice`)** (2 dd)
2.  **Backend: Integração com Stripe - Setup Inicial, Webhooks Básicos** (3 dd)
3.  **Backend: Lógica para Criação/Cancelamento/Upgrade de Assinaturas via Stripe** (4 dd)
4.  **Backend: Processamento de Pagamentos (via webhooks Stripe) e Geração de Faturas (links Stripe)** (3 dd)
5.  **Backend: Alocação de Créditos com base em Planos e Pagamentos** (1.5 dd)
6.  **Frontend: Página de Faturamento - Visualização de Plano Atual, Histórico de Faturas (chamadas API)** (2.5 dd)
7.  **Frontend: Página de Seleção/Upgrade de Planos (com integração Stripe Checkout/Elements)** (3 dd)
8.  **Frontend: Interface para Gerenciar Métodos de Pagamento (via Stripe Portal/Elements)** (1 dd)

*Subtotal Fase 8: ~20 dd*

**Estimativa Total (Aproximada):** 15 + 21.5 + 23 + 14 + 19 + 24.5 + 24.5 + 20 = **161.5 dias de desenvolvedor**.

Esta é uma estimativa de alto nível. Cada tarefa pode ser quebrada em sub-tarefas menores. Testes, refatorações, DevOps e gerenciamento de projeto não estão explicitamente estimados aqui, mas são cruciais.

**Considerações Adicionais:**
*   **Priorização:** As fases sugerem uma ordem, mas podem ser ajustadas com base nas prioridades de negócio.
*   **Equipe:** A velocidade de entrega dependerá do tamanho e experiência da equipe de desenvolvimento.
*   **Testes:** Dedicar tempo significativo para testes unitários, de integração e E2E é essencial.
*   **UX/UI Design:** O frontend depende de um design de UX/UI claro e consistente, que deve ser desenvolvido em paralelo ou antes das tarefas de frontend.
*   **Documentação:** Manter a documentação da API e do código atualizada.

Este plano de tarefas e estimativas visa fornecer uma visão abrangente do esforço necessário para implementar as funcionalidades desejadas para a Tawkee e GPT Maker AI.

