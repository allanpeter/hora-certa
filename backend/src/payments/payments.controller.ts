import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  PaymentResponseDto,
  PIXPaymentResponseDto,
  CardPaymentResponseDto,
} from './dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('pix')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create PIX payment request' })
  @ApiCreatedResponse({
    description: 'PIX payment created successfully',
    type: PIXPaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Appointment already paid or invalid request',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found',
  })
  async createPIXPayment(
    @CurrentUser() user: User,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PIXPaymentResponseDto> {
    return this.paymentsService.createPIXPayment(
      user.id,
      createPaymentDto,
    );
  }

  @Post('card')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create card payment request' })
  @ApiCreatedResponse({
    description: 'Card payment request created successfully',
    type: CardPaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Appointment already paid or invalid request',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found',
  })
  async createCardPayment(
    @CurrentUser() user: User,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<CardPaymentResponseDto> {
    return this.paymentsService.createCardPayment(
      user.id,
      createPaymentDto,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment status' })
  @ApiOkResponse({
    description: 'Payment details',
    type: PaymentResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Payment not found',
  })
  async getPayment(
    @CurrentUser() user: User,
    @Param('id') paymentId: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.getPaymentStatus(paymentId, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List payments',
    description: 'Get list of all payments for the current user',
  })
  @ApiOkResponse({
    description: 'List of payments',
    type: [PaymentResponseDto],
  })
  async listPayments(
    @CurrentUser() user: User,
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
  ): Promise<PaymentResponseDto[]> {
    const filters = {
      status: status as any,
      method: method as any,
      from_date: fromDate ? new Date(fromDate) : undefined,
      to_date: toDate ? new Date(toDate) : undefined,
    };

    return this.paymentsService.listPayments(user.id, filters);
  }

  @Post('pos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Record POS transaction (cash payment)',
    description: 'Record a cash payment at POS terminal',
  })
  @ApiCreatedResponse({
    description: 'POS transaction recorded successfully',
    type: PaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid appointment or amount',
  })
  @ApiNotFoundResponse({
    description: 'Appointment not found',
  })
  async recordPOSTransaction(
    @CurrentUser() user: User,
    @Body() body: { appointment_id: string; amount: number },
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.createPOSTransaction(
      user.id,
      body.appointment_id,
      body.amount,
    );
  }

  @Patch(':id/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiOkResponse({
    description: 'Payment refunded successfully',
    type: PaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Payment cannot be refunded',
  })
  @ApiNotFoundResponse({
    description: 'Payment not found',
  })
  async refundPayment(
    @CurrentUser() user: User,
    @Param('id') paymentId: string,
  ): Promise<PaymentResponseDto> {
    return this.paymentsService.refundPayment(paymentId, user.id);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'AbakatePay webhook handler',
    description:
      'Webhook endpoint for payment notifications (no authentication required)',
  })
  @ApiOkResponse({
    description: 'Webhook processed successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid webhook signature',
  })
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-webhook-signature') signature: string,
  ): Promise<{ success: boolean }> {
    return this.paymentsService.processWebhook(payload, signature);
  }
}
