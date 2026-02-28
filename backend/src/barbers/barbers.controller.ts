import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { BarbersService } from './barbers.service';
import { CreateBarberDto, UpdateBarberDto, BarberResponseDto, BarberStatsDto } from './dto';

@ApiTags('barbers')
@Controller('barbers')
export class BarbersController {
  constructor(private barbersService: BarbersService) {}

  /**
   * GET /barbers/:shopId
   * Get all barbers in a shop
   */
  @Get('shop/:shopId')
  @ApiOperation({ summary: 'Get all barbers in a shop' })
  async getBarbersInShop(
    @Param('shopId') shopId: string,
    @Query('includeStats') includeStats: boolean = false,
  ): Promise<BarberResponseDto[]> {
    return this.barbersService.getBarbersInShop(shopId, includeStats);
  }

  /**
   * GET /barbers/:barberId
   * Get a specific barber's profile
   */
  @Get(':barberId')
  @ApiOperation({ summary: 'Get barber profile' })
  async getBarberById(
    @Param('barberId') barberId: string,
    @Query('shopId') shopId?: string,
  ): Promise<BarberResponseDto> {
    return this.barbersService.getBarberById(barberId, shopId);
  }

  /**
   * POST /barbers
   * Create a new barber (owner/manager only)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new barber (owner/manager only)' })
  async createBarber(
    @Body() createBarberDto: CreateBarberDto & { shop_id: string },
    @CurrentUser() currentUser: User,
  ): Promise<BarberResponseDto> {
    return this.barbersService.createBarber(createBarberDto.shop_id, createBarberDto, currentUser.id);
  }

  /**
   * PATCH /barbers/:barberId
   * Update barber profile
   */
  @Patch(':barberId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update barber profile (owner/manager only)' })
  async updateBarber(
    @Param('barberId') barberId: string,
    @Body() updateBarberDto: UpdateBarberDto & { shop_id: string },
    @CurrentUser() currentUser: User,
  ): Promise<BarberResponseDto> {
    return this.barbersService.updateBarber(barberId, updateBarberDto.shop_id, updateBarberDto, currentUser.id);
  }

  /**
   * DELETE /barbers/:barberId
   * Delete a barber (owner only)
   */
  @Delete(':barberId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete barber (owner only)' })
  async deleteBarber(
    @Param('barberId') barberId: string,
    @Body() body: { shop_id: string },
    @CurrentUser() currentUser: User,
  ): Promise<{ success: boolean }> {
    return this.barbersService.deleteBarber(barberId, body.shop_id, currentUser.id);
  }

  /**
   * GET /barbers/:barberId/stats
   * Get barber performance statistics
   */
  @Get(':barberId/stats')
  @ApiOperation({ summary: 'Get barber performance metrics' })
  async getBarberStats(
    @Param('barberId') barberId: string,
    @Query('shopId') shopId: string,
  ): Promise<BarberStatsDto> {
    return this.barbersService.getBarberStats(barberId, shopId);
  }
}
