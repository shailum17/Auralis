import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourceCategory, UserRole } from '../../common/types/enums';

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  constructor(private resourcesService: ResourcesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new resource (Admin only)' })
  @ApiResponse({ status: 201, description: 'Resource created successfully' })
  async createResource(@Body() createResourceDto: CreateResourceDto) {
    return this.resourcesService.createResource(createResourceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active resources' })
  @ApiQuery({ name: 'category', required: false, enum: ResourceCategory })
  @ApiQuery({ name: 'locale', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Resources retrieved successfully' })
  async getResources(
    @Query('category') category?: ResourceCategory,
    @Query('locale') locale?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    
    return this.resourcesService.getResources(category, locale, limitNum, offsetNum);
  }

  @Get('by-category')
  @ApiOperation({ summary: 'Get resources grouped by category' })
  @ApiResponse({ status: 200, description: 'Resources grouped by category retrieved successfully' })
  async getResourcesByCategory() {
    return this.resourcesService.getResourcesByCategory();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search resources' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query' })
  @ApiQuery({ name: 'category', required: false, enum: ResourceCategory })
  @ApiQuery({ name: 'locale', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async searchResources(
    @Query('q') query: string,
    @Query('category') category?: ResourceCategory,
    @Query('locale') locale?: string,
  ) {
    return this.resourcesService.searchResources(query, category, locale);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific resource' })
  @ApiResponse({ status: 200, description: 'Resource retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getResource(@Param('id') id: string) {
    return this.resourcesService.getResource(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a resource (Admin only)' })
  @ApiResponse({ status: 200, description: 'Resource updated successfully' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async updateResource(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourcesService.updateResource(id, updateResourceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a resource (Admin only)' })
  @ApiResponse({ status: 200, description: 'Resource deleted successfully' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async deleteResource(@Param('id') id: string) {
    return this.resourcesService.deleteResource(id);
  }
}