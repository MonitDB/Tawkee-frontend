// Tipos/Interfaces Refatorados

// Tipo base para parâmetros de paginação
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// Tipo para metadados de paginação, usado em respostas paginadas
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Tipo genérico para resultados paginados
export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// Status possíveis para uma interação
export type InteractionStatus = 'RESOLVED' | 'RUNNING' | 'TRANSFERRED' | 'CLOSED'; // Adicionado 'CLOSED' conforme comentário no código original

// DTO para Mensagem (alinhado com backend dtos/message.dto.ts)
export interface MessageDto {
  id: string;
  text: string | null;
  role: string;
  userName?: string | null;
  createdAt: string; // Manter como string se as datas são serializadas como strings
}

// DTO para Interação com Mensagens (alinhado com backend dtos/interaction-with-messages.dto.ts)
export interface InteractionWithMessagesDto {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string | null;
  chatId: string;
  chatName: string | null;
  status: InteractionStatus; // Usando o tipo InteractionStatus definido
  startAt: string; // Manter como string
  transferAt: string | null;
  resolvedAt: string | null;
  userId: string | null;
  messages: MessageDto[]; // Usando MessageDto
}

// DTO para Chat
// Nenhuma mudança estrutural significativa necessária aqui, mas pode usar Interaction[] atualizado se aplicável
export interface ChatDto {
  humanTalk: boolean;
  userPicture: string | null;
  messageUserName: string;
  read: boolean;
  role: string;
  agentName: string;
  agentId: string;
  whatsappPhone: string;
  finished: boolean;
  avatar: string;
  title: string;
  type: string;
  userName: string;
  userId: string;
  picture: string;
  conversationType: string;
  createdAt: number;
  name: string;
  recipient: string;
  id: string;
  time: number;
  unReadCount: number;
  conversation: string;
  latestMessage?: MessageDto;
  interactions?: InteractionWithMessagesDto[]
}

// Valor padrão para PaginatedResult<ChatDto>
export const defaultChatDto: PaginatedResult<ChatDto> = {
  data: [],
  meta: {
    total: 0,
    page: 0,
    pageSize: 0,
    totalPages: 0
  }
}

// Parâmetros para buscar todos os chats, estendendo os parâmetros de paginação
export interface FindAllChatsParams extends PaginationParams {
  workspaceId: string;
  agentId?: string;
  query?: string; // Movido de PaginationDto original para cá, pois é específico da busca de chats
}

// Parâmetros para buscar interações com mensagens, estendendo os parâmetros de paginação
export interface FindInteractionsWithMessagesParams extends PaginationParams {
  chatId: string;
}

// Resposta paginada para interações com mensagens
// Reutiliza PaginatedResult e InteractionWithMessagesDto
export type PaginatedInteractionsWithMessagesResponseDto = PaginatedResult<InteractionWithMessagesDto>;

// Configuração do Serviço de Chat
interface ChatServiceConfig {
  token: string;
  apiUrl: string;
}

// Classe de Serviço Refatorada
export class ChatService {
  private token: string;
  private apiUrl: string;

  constructor(config: ChatServiceConfig) {
    this.token = config.token;
    this.apiUrl = config.apiUrl;
  }

  /**
   * Busca todos os chats para um workspace específico com filtros e paginação opcionais
   */
  async findAll(params: FindAllChatsParams): Promise<PaginatedResult<ChatDto>> {
    try {
      const { workspaceId, agentId, page = 1, pageSize = 10, query } = params;

      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('pageSize', pageSize.toString());

      if (query) {
        searchParams.append('query', query);
      }

      if (agentId) {
        searchParams.append('agentId', agentId);
      }

      const url = `${this.apiUrl}/workspace/${workspaceId}/chats?${searchParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Workspace not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // O tipo de retorno já é PaginatedResult<ChatDto>
      const data: PaginatedResult<ChatDto> = await response.json();
      return data;

    } catch (error) {
      console.error('Error fetching chats:', error);
      // Retorna um resultado padrão em caso de erro, conforme o original, ou lança o erro
      // return defaultChatDto; // Descomente se preferir retornar padrão em vez de lançar
      throw error;
    }
  }

  /**
   * Busca todas as interações com suas mensagens para um chat específico com paginação opcional
   */
  async findInteractionsWithMessages(
    params: FindInteractionsWithMessagesParams
  ): Promise<PaginatedInteractionsWithMessagesResponseDto> { // Tipo de retorno atualizado
    try {
      const { chatId, page = 1, pageSize = 10 } = params;

      if (!chatId) {
        throw new Error("Chat ID is required.");
      }

      const searchParams = new URLSearchParams();
      searchParams.append("page", page.toString());
      searchParams.append("pageSize", pageSize.toString());

      const url = `${this.apiUrl}/chats/${chatId}/interactions?${searchParams.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`No interactions found for chat ${chatId} or chat does not exist.`);
          // Retorna um resultado paginado vazio
          return {
            data: [],
            meta: {
              total: 0,
              page,
              pageSize,
              totalPages: 0,
            },
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // O tipo de retorno já é PaginatedInteractionsWithMessagesResponseDto
      const data: PaginatedInteractionsWithMessagesResponseDto = await response.json();
      return data;

    } catch (error) {
      console.error("Error fetching interactions with messages:", error);
      throw error;
    }
  }
}

// Exemplo de uso (inalterado, mas agora usa os tipos refatorados)
/*
const config: ChatServiceConfig = { token: 'your-token', apiUrl: 'https://your-api-domain.com/api' };
const chatService = new ChatService(config);

// Busca básica
const chats = await chatService.findAll({ workspaceId: 'workspace-123' });

// Com paginação
const paginatedChats = await chatService.findAll({
  workspaceId: 'workspace-123',
  page: 2,
  pageSize: 20
});

// Filtrar por agente
const agentChats = await chatService.findAll({
  workspaceId: 'workspace-123',
  agentId: 'agent-456'
});

// Busca com query
const searchResults = await chatService.findAll({
  workspaceId: 'workspace-123',
  query: 'support request',
  page: 1,
  pageSize: 15
});

// Busca interações para um chat
const interactions = await chatService.findInteractionsWithMessages({ chatId: 'chat-789', page: 1, pageSize: 5 });
*/

