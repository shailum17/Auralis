import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourceCategory } from '../../common/types/enums';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async createResource(createResourceDto: CreateResourceDto) {
    const resource = await this.prisma.resource.create({
      data: createResourceDto,
    });

    return resource;
  }

  async getResources(
    category?: ResourceCategory,
    locale = 'en',
    limit = 50,
    offset = 0
  ) {
    const where = {
      isActive: true,
      locale,
      ...(category && { category }),
    };

    const resources = await this.prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return resources;
  }

  async getResource(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
    });

    if (!resource || !resource.isActive) {
      throw new NotFoundException('Resource not found');
    }

    return resource;
  }

  async updateResource(id: string, updateResourceDto: UpdateResourceDto) {
    const existingResource = await this.prisma.resource.findUnique({
      where: { id },
    });

    if (!existingResource) {
      throw new NotFoundException('Resource not found');
    }

    const resource = await this.prisma.resource.update({
      where: { id },
      data: {
        ...updateResourceDto,
        updatedAt: new Date(),
      },
    });

    return resource;
  }

  async deleteResource(id: string) {
    const existingResource = await this.prisma.resource.findUnique({
      where: { id },
    });

    if (!existingResource) {
      throw new NotFoundException('Resource not found');
    }

    // Soft delete by setting isActive to false
    await this.prisma.resource.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Resource deleted successfully' };
  }

  async getResourcesByCategory() {
    const resources = await this.prisma.resource.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        url: true,
        category: true,
        locale: true,
      },
    });

    // Group by category
    const grouped = resources.reduce((acc, resource) => {
      if (!acc[resource.category]) {
        acc[resource.category] = [];
      }
      acc[resource.category].push(resource);
      return acc;
    }, {} as Record<ResourceCategory, typeof resources>);

    return grouped;
  }

  async searchResources(query: string, category?: ResourceCategory, locale = 'en') {
    const where = {
      isActive: true,
      locale,
      ...(category && { category }),
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    const resources = await this.prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return resources;
  }
}