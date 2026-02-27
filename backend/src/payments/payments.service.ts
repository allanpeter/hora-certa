import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosInstance } from 'axios';
import { Payment } from '../database/entities/payment.entity';
import { Appointment } from '../database/entities/appointment.entity';
import { PaymentStatus, PaymentMethod } from '../common/enums';
import {
  CreatePaymentDto,
  PaymentResponseDto,
  PIXPaymentResponseDto,
  CardPaymentResponseDto,
  WebhookPayloadDto,
} from './dto';
import crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private apiKey: string;
  private apiSecret: string;
  private apiUrl: string;
  private apiClient: AxiosInstance;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('ABAKATE_API_KEY') || '';
    this.apiSecret =
      this.configService.get<string>('ABAKATE_API_SECRET') || '';
    this.apiUrl =
      this.configService.get<string>('ABAKATE_API_URL') ||
      'https://sandbox.abakate.com.br/api';

    this.apiClient = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      timeout: 10000,
    });
  }

  /**
   * Create a PIX payment request
   * Returns QR code and transaction ID
   */
  async createPIXPayment(
    tenantId: string,
    dto: CreatePaymentDto,
  ): Promise<PIXPaymentResponseDto> {
    // Validate appointment exists and is unpaid
    const appointment = await this.appointmentRepository.findOne({
      where: { id: dto.appointment_id, tenant_id: tenantId },
      relations: ['service', 'customer', 'barber'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.payment_status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Appointment already paid');
    }

    try {
      // Create PIX request with AbakatePay API
      const response = await this.apiClient.post('/pix/create', {
        amount: dto.amount,
        description: `Barber appointment - ${appointment.service.name}`,
        customer: {
          name: appointment.customer.name,
          email: appointment.customer.email,
          phone: appointment.customer.phone,
        },
        metadata: {
          appointment_id: appointment.id,
          service_id: appointment.service_id,
          barber_id: appointment.barber_id,
        },
        expires_in: 3600, // 1 hour
      });

      if (!response.data.transaction_id) {
        throw new UnprocessableEntityException(
          'Failed to generate PIX transaction',
        );
      }

      // Create payment record
      const paymentData = {
        tenant_id: tenantId,
        appointment_id: dto.appointment_id,
        customer_id: appointment.customer_id,
        amount: dto.amount,
        currency: 'BRL',
        method: PaymentMethod.PIX,
        status: PaymentStatus.PENDING,
        external_id: response.data.transaction_id,
        provider_transaction_id: response.data.transaction_id,
        metadata: {
          qr_code: response.data.qr_code,
          qr_code_url: response.data.qr_code_url,
          pix_key: response.data.pix_key,
          expires_at: new Date(Date.now() + 3600000),
        },
      };
      const payment = this.paymentRepository.create(paymentData);

      await this.paymentRepository.save(payment);

      return {
        payment_id: payment.id,
        transaction_id: response.data.transaction_id,
        amount: payment.amount,
        method: PaymentMethod.PIX,
        qr_code: response.data.qr_code,
        qr_code_url: response.data.qr_code_url,
        pix_key: response.data.pix_key,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        status: PaymentStatus.PENDING,
      };
    } catch (error) {
      this.logger.error('PIX payment creation failed', error);
      throw new UnprocessableEntityException(
        'Failed to create PIX payment: ' + (error as any).message,
      );
    }
  }

  /**
   * Create a card payment request
   * Returns payment intent for frontend
   */
  async createCardPayment(
    tenantId: string,
    dto: CreatePaymentDto,
  ): Promise<CardPaymentResponseDto> {
    // Validate appointment
    const appointment = await this.appointmentRepository.findOne({
      where: { id: dto.appointment_id, tenant_id: tenantId },
      relations: ['service', 'customer'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.payment_status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Appointment already paid');
    }

    try {
      // Create card payment request with AbakatePay API
      const response = await this.apiClient.post('/card/create', {
        amount: dto.amount,
        description: `Barber appointment - ${appointment.service.name}`,
        customer: {
          name: appointment.customer.name,
          email: appointment.customer.email,
          phone: appointment.customer.phone,
        },
        metadata: {
          appointment_id: appointment.id,
          service_id: appointment.service_id,
        },
        installments: dto.installments || 1,
        return_url: dto.return_url,
      });

      if (!response.data.payment_intent_id) {
        throw new UnprocessableEntityException(
          'Failed to create card payment intent',
        );
      }

      // Create payment record
      const paymentData = {
        tenant_id: tenantId,
        appointment_id: dto.appointment_id,
        customer_id: appointment.customer_id,
        amount: dto.amount,
        currency: 'BRL',
        method: PaymentMethod.CARD,
        status: PaymentStatus.PENDING,
        external_id: response.data.payment_intent_id,
        provider_transaction_id: response.data.payment_intent_id,
        metadata: {
          payment_intent_id: response.data.payment_intent_id,
          installments: dto.installments || 1,
        },
      };
      const payment = this.paymentRepository.create(paymentData);

      await this.paymentRepository.save(payment);

      return {
        payment_id: payment.id,
        payment_intent_id: response.data.payment_intent_id,
        amount: payment.amount,
        method: PaymentMethod.CARD,
        installments: dto.installments || 1,
        status: PaymentStatus.PENDING,
        payment_url: response.data.payment_url,
      };
    } catch (error) {
      this.logger.error('Card payment creation failed', error);
      throw new UnprocessableEntityException(
        'Failed to create card payment: ' + (error as any).message,
      );
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(
    paymentId: string,
    tenantId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, tenant_id: tenantId },
      relations: ['appointment'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.formatPaymentResponse(payment);
  }

  /**
   * Process webhook from AbakatePay
   * Validates signature and updates payment status
   */
  async processWebhook(
    payload: any,
    signature: string,
  ): Promise<{ success: boolean }> {
    // Validate webhook signature
    const isValid = this.validateWebhookSignature(payload, signature);
    if (!isValid) {
      this.logger.warn('Invalid webhook signature received');
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Processing webhook for ${payload.event_type}`);

    switch (payload.event_type) {
      case 'payment.completed':
        return this.handlePaymentCompleted(payload);
      case 'payment.failed':
        return this.handlePaymentFailed(payload);
      case 'payment.refunded':
        return this.handlePaymentRefunded(payload);
      default:
        this.logger.warn(`Unknown event type: ${payload.event_type}`);
        return { success: true }; // Accept but ignore unknown events
    }
  }

  /**
   * Handle payment.completed webhook
   */
  private async handlePaymentCompleted(payload: WebhookPayloadDto) {
    const payment = await this.paymentRepository
      .createQueryBuilder('p')
      .where('p.external_id = :externalId', { externalId: payload.transaction_id })
      .leftJoinAndSelect('p.appointment', 'appointment')
      .getOne();

    if (!payment) {
      this.logger.warn(
        `Payment not found for transaction ${payload.transaction_id}`,
      );
      return { success: true };
    }

    // Update payment status
    payment.status = PaymentStatus.COMPLETED;
    payment.paid_at = new Date();
    await this.paymentRepository.save(payment);

    // Update appointment payment status
    if (payment.appointment) {
      payment.appointment.payment_status = PaymentStatus.COMPLETED;
      payment.appointment.payment_id = payment.id;
      await this.appointmentRepository.save(payment.appointment);
      this.logger.log(
        `Appointment ${payment.appointment_id} payment marked as completed`,
      );
    }

    return { success: true };
  }

  /**
   * Handle payment.failed webhook
   */
  private async handlePaymentFailed(payload: WebhookPayloadDto) {
    const payment = await this.paymentRepository
      .createQueryBuilder('p')
      .where('p.external_id = :externalId', { externalId: payload.transaction_id })
      .leftJoinAndSelect('p.appointment', 'appointment')
      .getOne();

    if (!payment) {
      this.logger.warn(
        `Payment not found for transaction ${payload.transaction_id}`,
      );
      return { success: true };
    }

    // Update payment status
    payment.status = PaymentStatus.FAILED;
    payment.metadata = {
      ...payment.metadata,
      failure_reason: payload.error_message,
    };
    await this.paymentRepository.save(payment);

    this.logger.log(
      `Payment ${payment.id} marked as failed: ${payload.error_message}`,
    );

    return { success: true };
  }

  /**
   * Handle payment.refunded webhook
   */
  private async handlePaymentRefunded(payload: WebhookPayloadDto) {
    const payment = await this.paymentRepository
      .createQueryBuilder('p')
      .where('p.external_id = :externalId', { externalId: payload.transaction_id })
      .leftJoinAndSelect('p.appointment', 'appointment')
      .getOne();

    if (!payment) {
      this.logger.warn(
        `Payment not found for transaction ${payload.transaction_id}`,
      );
      return { success: true };
    }

    // Update payment status
    payment.status = PaymentStatus.REFUNDED;
    payment.metadata = {
      ...payment.metadata,
      refund_id: payload.refund_id,
      refund_date: new Date(),
    };
    await this.paymentRepository.save(payment);

    // Mark appointment as unpaid
    if (payment.appointment) {
      payment.appointment.payment_status = PaymentStatus.PENDING;
      await this.appointmentRepository.save(payment.appointment);
    }

    this.logger.log(`Payment ${payment.id} refunded`);

    return { success: true };
  }

  /**
   * Validate webhook signature using HMAC-SHA256
   */
  private validateWebhookSignature(payload: any, signature: string): boolean {
    const secretKey = this.apiSecret;
    const payloadString = JSON.stringify(payload);

    const computedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(payloadString)
      .digest('hex');

    return computedSignature === signature;
  }

  /**
   * Create POS transaction (cash payment)
   */
  async createPOSTransaction(
    tenantId: string,
    appointmentId: string,
    amount: number,
  ): Promise<PaymentResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId, tenant_id: tenantId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.payment_status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Appointment already paid');
    }

    // Create cash payment record (immediate completion)
    const paymentData = {
      tenant_id: tenantId,
      appointment_id: appointmentId,
      customer_id: appointment.customer_id,
      amount,
      currency: 'BRL',
      method: PaymentMethod.CASH,
      status: PaymentStatus.COMPLETED,
      paid_at: new Date(),
      metadata: {
        recorded_at: new Date().toISOString(),
        payment_type: 'POS - Cash',
      },
    };
    const payment = this.paymentRepository.create(paymentData);

    await this.paymentRepository.save(payment);

    // Update appointment
    appointment.payment_status = PaymentStatus.COMPLETED;
    appointment.payment_id = payment.id;
    await this.appointmentRepository.save(appointment);

    return this.formatPaymentResponse(payment);
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, tenantId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, tenant_id: tenantId },
      relations: ['appointment'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed payments');
    }

    // Special handling for cash - just mark as refunded
    if (payment.method === PaymentMethod.CASH) {
      payment.status = PaymentStatus.REFUNDED;
      await this.paymentRepository.save(payment);

      if (payment.appointment) {
        payment.appointment.payment_status = PaymentStatus.PENDING;
        await this.appointmentRepository.save(payment.appointment);
      }

      return this.formatPaymentResponse(payment);
    }

    // For card/PIX, call API
    try {
      await this.apiClient.post(`/payments/${payment.external_id}/refund`, {
        amount: payment.amount,
      });

      payment.status = PaymentStatus.REFUNDED;
      await this.paymentRepository.save(payment);

      if (payment.appointment) {
        payment.appointment.payment_status = PaymentStatus.PENDING;
        await this.appointmentRepository.save(payment.appointment);
      }

      this.logger.log(`Payment ${paymentId} refunded`);

      return this.formatPaymentResponse(payment);
    } catch (error) {
      this.logger.error('Refund failed', error);
      throw new UnprocessableEntityException(
        'Failed to refund payment: ' + (error as any).message,
      );
    }
  }

  /**
   * List payments for a user
   */
  async listPayments(
    tenantId: string,
    filters?: {
      status?: PaymentStatus;
      method?: PaymentMethod;
      from_date?: Date;
      to_date?: Date;
    },
  ): Promise<PaymentResponseDto[]> {
    const query = this.paymentRepository.createQueryBuilder('p');

    query.where('p.tenant_id = :tenantId', { tenantId });

    if (filters?.status) {
      query.andWhere('p.status = :status', { status: filters.status });
    }

    if (filters?.method) {
      query.andWhere('p.method = :method', { method: filters.method });
    }

    if (filters?.from_date) {
      query.andWhere('p.created_at >= :fromDate', { fromDate: filters.from_date });
    }

    if (filters?.to_date) {
      query.andWhere('p.created_at <= :toDate', { toDate: filters.to_date });
    }

    const payments = await query
      .leftJoinAndSelect('p.appointment', 'appointment')
      .orderBy('p.created_at', 'DESC')
      .getMany();

    return payments.map((p) => this.formatPaymentResponse(p));
  }

  private formatPaymentResponse(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      appointment_id: payment.appointment_id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      external_id: payment.external_id,
      paid_at: payment.paid_at?.toISOString() || null,
      created_at: payment.created_at.toISOString(),
      updated_at: payment.updated_at.toISOString(),
    };
  }
}
