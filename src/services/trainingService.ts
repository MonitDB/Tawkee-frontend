// Define TrainingType enum based on DTO examples
export enum TrainingType {
  TEXT = 'TEXT',
  WEBSITE = 'WEBSITE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}

// Define DTOs and other types (interfaces for structure)
export interface CreateTrainingDto {
  type: TrainingType;
  text?: string;
  image?: string;
  website?: string;
  trainingSubPages?: string;
  trainingInterval?: string;
  video?: string;
  documentUrl?: string;
  documentName?: string;
  documentMimetype?: string;
}

export interface UpdateTrainingDto {
  type: TrainingType.TEXT; // Only TEXT type allowed for updates
  text: string;
  image?: string;
}

// TrainingDto is the same as CreateTrainingDto
export type TrainingDto = CreateTrainingDto & {
  id: string;
  createdAt: string;
  updatedAt: string;
}; // Assuming id and timestamps are present

// Assume standard pagination DTOs
export interface PaginationDto {
  page: number;
  pageSize: number;
  query?: string;
  type?: TrainingType;
}

export interface PaginationMetaDto {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedTrainingsResponseDto {
  data: TrainingDto[];
  meta: PaginationMetaDto;
}

// // Default empty response for findAll error case
export const defaultPaginatedResponse: PaginatedTrainingsResponseDto = {
  data: [],
  meta: {
    page: 0,
    pageSize: 0,
    total: 0,
    totalPages: 0,
  },
};

interface TrainingServiceConfig {
  token: string;
  apiUrl: string;
}

export class TrainingService {
  private token: string;
  private apiUrl: string;

  constructor(config: TrainingServiceConfig) {
    this.token = config.token;
    this.apiUrl = config.apiUrl;
  }

  async findAll(
    agentId: string,
    paginationDto: PaginationDto
  ): Promise<PaginatedTrainingsResponseDto> {
    try {
      const queryParams = new URLSearchParams({
        page: paginationDto.page.toString(),
        pageSize: paginationDto.pageSize.toString(),
      });

      const response = await fetch(
        `${this.apiUrl}/agent/${agentId}/trainings?${queryParams}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${this.token}` } as const,
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage =
          data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      // Validate response structure
      if (data && Array.isArray(data.data) && data.meta) {
        return data as PaginatedTrainingsResponseDto;
      } else {
        console.error('Invalid response structure for findAll:', data);
        return defaultPaginatedResponse;
      }
    } catch (error: unknown) {
      throw error;
    }
  }

  async create(
    agentId: string,
    createTrainingDto: CreateTrainingDto
  ): Promise<TrainingDto> {
    try {
      const response = await fetch(
        `${this.apiUrl}/agent/${agentId}/trainings`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          } as const,
          body: JSON.stringify(createTrainingDto),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage =
          data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      return data.data;
    } catch (error: unknown) {
      throw error;
    }
  }

  async remove(trainingId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/training/${trainingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.token}` } as const,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage =
          data.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      return data.success === true;
    } catch (error: unknown) {
      throw error;
    }
  }
}
