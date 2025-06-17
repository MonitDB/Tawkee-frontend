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
export type InteractionStatus = 'RESOLVED' | 'RUNNING' | 'WAITING' | 'CLOSED'; // Adicionado 'CLOSED' conforme comentário no código original

// DTO para Mensagem (alinhado com backend dtos/message.dto.ts)
export interface MessageDto {
  id: string;
  text: string | null;
  role: string;
  userName?: string | null;
  createdAt: number; // Manter como string se as datas são serializadas como strings
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
  updatedAt: string;
  unReadCount: number;
  conversation: string;
  latestMessage?: MessageDto;
  paginatedInteractions?: PaginatedInteractionsWithMessagesResponseDto;
}

// Valor padrão para PaginatedResult<ChatDto>
export const defaultChatDto: PaginatedResult<ChatDto> = {
  data: [],
  meta: {
    total: 0,
    page: 0,
    pageSize: 0,
    totalPages: 0,
  },
};

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
export type PaginatedInteractionsWithMessagesResponseDto =
  PaginatedResult<InteractionWithMessagesDto>;

// Configuração do Serviço de Chat
interface ChatServiceConfig {
  token: string;
  apiUrl: string;
  userId: string;
}

// Classe de Serviço Refatorada
export class ChatService {
  private token: string;
  private apiUrl: string;
  private userId: string;

  constructor(config: ChatServiceConfig) {
    this.token = config.token;
    this.apiUrl = config.apiUrl;
    this.userId = config.userId;
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
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Workspace not found');
        } else if (response.status >= 500) {
          throw new Error('Internal server error. Please try again later.');
        } else {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || 'A business rule error occurred.';
          throw new Error(errorMessage);
        }
      }

      const data: PaginatedResult<ChatDto> = await response.json().catch(() => {
        throw new Error('Invalid response from server.');
      });

      return data;
    } catch (error: unknown) {
      let errorMessage = 'A unexpected error occurred.';

      // Check if error is an instance of Error to safely access the message
      if (error instanceof Error) {
        // Handling network failures or fetch-specific errors
        if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }

      throw errorMessage;
    }
  }

  /**
   * Busca todas as interações com suas mensagens para um chat específico com paginação opcional
   */
  async findInteractionsWithMessages(
    params: FindInteractionsWithMessagesParams
  ): Promise<PaginatedInteractionsWithMessagesResponseDto> {
    try {
      const { chatId, page = 1, pageSize = 10 } = params;

      if (!chatId) {
        throw new Error('Chat ID is required.');
      }

      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('pageSize', pageSize.toString());

      const url = `${this.apiUrl}/chats/${chatId}/interactions?${searchParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(
            `No interactions found for chat ${chatId} or chat does not exist.`
          );
          return {
            data: [],
            meta: {
              total: 0,
              page,
              pageSize,
              totalPages: 0,
            },
          };
        } else if (response.status >= 500) {
          throw new Error('Internal server error. Please try again later.');
        } else {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || 'A business rule error occurred.';
          throw new Error(errorMessage);
        }
      }

      const data: PaginatedInteractionsWithMessagesResponseDto = await response
        .json()
        .catch(() => {
          throw new Error('Invalid response from server.');
        });

      return data;
    } catch (error: unknown) {
      let errorMessage = 'A unexpected error occurred.';

      // Check if error is an instance of Error to safely access the message
      if (error instanceof Error) {
        // Handling network failures or fetch-specific errors
        if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }

      throw errorMessage;
    }
  }

  async finishChat(id: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/chats/${id}/finish/${this.userId}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${this.token}` } as const,
        }
      );

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error('Internal server error. Please try again later.');
        } else {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || 'A business rule error occurred.';
          throw new Error(errorMessage);
        }
      }

      const data = await response.json().catch(() => ({}));
      if (data.error) {
        throw new Error(data.error);
      }

      return true;
    } catch (error) {
      if (error instanceof TypeError) {
        // This is probably a network error, e.g., backend down, no internet
        throw new Error('Connectivity issue. Please check your network.');
      }
      if (error instanceof Error) {
        // Backend or business error, just propagate it
        throw error;
      }
      // fallback
      throw new Error('An unexpected error occurred.');
    }
  }

  async unfinishChat(id: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/chats/${id}/unfinish/${this.userId}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${this.token}` } as const,
        }
      );

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error('Internal server error. Please try again later.');
        } else {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || 'A business rule error occurred.';
          throw new Error(errorMessage);
        }
      }

      const data = await response.json().catch(() => ({}));
      if (data.error) {
        throw new Error(data.error);
      }

      return true;
    } catch (error: unknown) {
      let errorMessage = 'A unexpected error occurred.';

      // Check if error is an instance of Error to safely access the message
      if (error instanceof Error) {
        // Handling network failures or fetch-specific errors
        if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }

      throw errorMessage;
    }
  }

  async startHumanAttendanceChat(id: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/chats/${id}/start-human/${this.userId}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${this.token}` } as const,
        }
      );

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error('Internal server error. Please try again later.');
        } else {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || 'A business rule error occurred.';
          throw new Error(errorMessage);
        }
      }

      const data = await response.json().catch(() => ({}));
      if (data.error) {
        throw new Error(data.error);
      }

      return true;
    } catch (error: unknown) {
      let errorMessage = 'A unexpected error occurred.';

      // Check if error is an instance of Error to safely access the message
      if (error instanceof Error) {
        // Handling network failures or fetch-specific errors
        if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }

      throw errorMessage;
    }
  }

  async stopHumanAttendanceChat(id: string): Promise<boolean> {
    try {
      console.log(`PUT ${this.apiUrl}/chats/${id}/stop-human...`);
      const response = await fetch(
        `${this.apiUrl}/chats/${id}/stop-human/${this.userId}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${this.token}` } as const,
        }
      );

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error('Internal server error. Please try again later.');
        } else {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || 'A business rule error occurred.';
          throw new Error(errorMessage);
        }
      }

      const data = await response.json().catch(() => ({}));
      console.log(`PUT ${this.apiUrl}/chats/${id}/stop-human... res: ${data}`);
      if (data.error) {
        throw new Error(data.error);
      }

      return true;
    } catch (error: unknown) {
      let errorMessage = 'A unexpected error occurred.';

      // Check if error is an instance of Error to safely access the message
      if (error instanceof Error) {
        // Handling network failures or fetch-specific errors
        if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }

      throw errorMessage;
    }
  }

  async readChat(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/chats/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${this.token}` } as const,
      });

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error('Internal server error. Please try again later.');
        } else {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || 'A business rule error occurred.';
          throw new Error(errorMessage);
        }
      }

      const data = await response.json().catch(() => ({}));
      if (data.error) {
        throw new Error(data.error);
      }
      return true;
    } catch (error: unknown) {
      let errorMessage = 'A unexpected error occurred.';

      // Check if error is an instance of Error to safely access the message
      if (error instanceof Error) {
        // Handling network failures or fetch-specific errors
        if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }

      throw errorMessage;
    }
  }

  async deleteChat(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/chats/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.token}` } as const,
      });

      if (!response.ok) {
        if (response.status >= 500) {
          throw new Error('Internal server error. Please try again later.');
        } else {
          const data = await response.json().catch(() => ({}));
          const errorMessage = data.error || 'A business rule error occurred.';
          throw new Error(errorMessage);
        }
      }

      const data = await response.json().catch(() => ({}));
      if (data.error) {
        throw new Error(data.error);
      }

      return true;
    } catch (error: unknown) {
      let errorMessage = 'A unexpected error occurred.';

      // Check if error is an instance of Error to safely access the message
      if (error instanceof Error) {
        // Handling network failures or fetch-specific errors
        if (error.message.includes('Failed to fetch')) {
          errorMessage =
            'Network error. Please check your internet connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unknown error occurred.';
      }

      throw errorMessage;
    }
  }
}
