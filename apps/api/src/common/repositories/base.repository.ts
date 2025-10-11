import { PrismaService } from '../prisma/prisma.service';

export abstract class BaseRepository<T, CreateDto, UpdateDto> {
  constructor(protected prisma: PrismaService) {}

  abstract create(data: CreateDto): Promise<T>;
  abstract findById(id: string): Promise<T | null>;
  abstract update(id: string, data: UpdateDto): Promise<T>;
  abstract delete(id: string): Promise<void>;
  abstract findMany(options?: any): Promise<T[]>;

  protected handleError(error: any, operation: string): never {
    console.error(`Error in ${operation}:`, error);
    throw error;
  }
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface FilterOptions {
  where?: Record<string, any>;
}

export type RepositoryOptions = PaginationOptions & FilterOptions;