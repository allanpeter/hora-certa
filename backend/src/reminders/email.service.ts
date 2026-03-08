import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

export interface ReminderEmailData {
  to: string;
  customerName: string;
  barberName: string;
  serviceName: string;
  serviceDuration?: number | null;
  appointmentTime: Date;
  confirmUrl: string;
  declineUrl: string;
}

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly appName: string;

  constructor(private configService: ConfigService) {
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'noreply@horacerta.com';
    this.appName = this.configService.get<string>('APP_NAME') || 'Hora Certa';

    const emailProvider = this.configService.get<string>('EMAIL_PROVIDER') || 'sendgrid';

    // Initialize email transporter based on provider
    if (emailProvider === 'sendgrid') {
      this.initializeSendGrid();
    } else {
      this.initializeSmtp();
    }
  }

  private initializeSendGrid(): void {
    const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');

    if (!sendgridApiKey) {
      this.logger.warn('SendGrid API key not configured, using test mode');
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal-user@ethereal.email',
          pass: 'ethereal-pass',
        },
      });
      return;
    }

    // SendGrid SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: sendgridApiKey,
      },
    });
  }

  private initializeSmtp(): void {
    const smtpHost = this.configService.get<string>('SMTP_HOST') || 'localhost';
    const smtpPort = this.configService.get<number>('SMTP_PORT') || 587;
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASSWORD');

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
    });
  }

  /**
   * Send appointment reminder email
   */
  async sendReminderEmail(data: ReminderEmailData): Promise<void> {
    try {
      const appointmentTimeStr = this.formatDateTime(data.appointmentTime);
      const durationStr = `${data.serviceDuration} minutos`;

      const htmlContent = this.generateReminderHtml(
        data.customerName,
        data.barberName,
        data.serviceName,
        durationStr,
        appointmentTimeStr,
        data.confirmUrl,
        data.declineUrl,
      );

      const textContent = this.generateReminderText(
        data.customerName,
        data.barberName,
        data.serviceName,
        durationStr,
        appointmentTimeStr,
      );

      await this.transporter.sendMail({
        from: this.fromEmail,
        to: data.to,
        subject: `Lembrete: Seu agendamento com ${data.barberName} amanhã`,
        text: textContent,
        html: htmlContent,
      });

      this.logger.log(`Reminder email sent to ${data.to}`);
    } catch (error) {
      this.logger.error('Failed to send reminder email', error);
      throw error;
    }
  }

  /**
   * Send confirmation email
   */
  async sendConfirmationEmail(
    to: string,
    customerName: string,
    barberName: string,
    appointmentTime: Date,
  ): Promise<void> {
    try {
      const appointmentTimeStr = this.formatDateTime(appointmentTime);

      const htmlContent = `
        <h2>Agendamento Confirmado</h2>
        <p>Olá ${customerName},</p>
        <p>Seu agendamento foi confirmado!</p>
        <p><strong>Detalhes do Agendamento:</strong></p>
        <ul>
          <li><strong>Profissional:</strong> ${barberName}</li>
          <li><strong>Data e Hora:</strong> ${appointmentTimeStr}</li>
        </ul>
        <p>Obrigado por usar ${this.appName}!</p>
      `;

      await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject: 'Agendamento Confirmado',
        html: htmlContent,
      });

      this.logger.log(`Confirmation email sent to ${to}`);
    } catch (error) {
      this.logger.error('Failed to send confirmation email', error);
      throw error;
    }
  }

  /**
   * Send cancellation email
   */
  async sendCancellationEmail(
    to: string,
    customerName: string,
    barberName: string,
    appointmentTime: Date,
  ): Promise<void> {
    try {
      const appointmentTimeStr = this.formatDateTime(appointmentTime);

      const htmlContent = `
        <h2>Agendamento Cancelado</h2>
        <p>Olá ${customerName},</p>
        <p>Seu agendamento foi cancelado com sucesso.</p>
        <p><strong>Detalhes:</strong></p>
        <ul>
          <li><strong>Profissional:</strong> ${barberName}</li>
          <li><strong>Data e Hora (cancelada):</strong> ${appointmentTimeStr}</li>
        </ul>
        <p>Caso deseje agendar novamente, visite nosso app.</p>
      `;

      await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject: 'Agendamento Cancelado',
        html: htmlContent,
      });

      this.logger.log(`Cancellation email sent to ${to}`);
    } catch (error) {
      this.logger.error('Failed to send cancellation email', error);
      throw error;
    }
  }

  private generateReminderHtml(
    customerName: string,
    barberName: string,
    serviceName: string,
    duration: string,
    appointmentTime: string,
    confirmUrl: string,
    declineUrl: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
            .content { background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .appointment-details { background-color: white; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0; }
            .detail-item { margin: 10px 0; }
            .label { font-weight: bold; color: #2c3e50; }
            .buttons { margin: 20px 0; text-align: center; }
            .btn { display: inline-block; padding: 12px 24px; margin: 0 10px; border-radius: 5px; text-decoration: none; font-weight: bold; }
            .btn-confirm { background-color: #27ae60; color: white; }
            .btn-decline { background-color: #e74c3c; color: white; }
            .footer { font-size: 12px; color: #7f8c8d; text-align: center; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Lembrete de Agendamento</h1>
            </div>

            <div class="content">
              <p>Olá <strong>${customerName}</strong>,</p>
              <p>Este é um lembrete sobre seu agendamento <strong>amanhã</strong>.</p>

              <div class="appointment-details">
                <div class="detail-item">
                  <span class="label">Profissional:</span> ${barberName}
                </div>
                <div class="detail-item">
                  <span class="label">Serviço:</span> ${serviceName} (${duration})
                </div>
                <div class="detail-item">
                  <span class="label">Data e Hora:</span> ${appointmentTime}
                </div>
              </div>

              <p>Por favor, confirme se você virá ou cancele se não puder comparecer.</p>

              <div class="buttons">
                <a href="${confirmUrl}" class="btn btn-confirm">✓ Confirmar Presença</a>
                <a href="${declineUrl}" class="btn btn-decline">✕ Cancelar</a>
              </div>

              <p style="font-size: 12px; color: #7f8c8d;">
                <strong>Nota:</strong> Se você não conseguir visualizar os botões acima,
                copie e cole este link no seu navegador:
              </p>
              <p style="font-size: 12px; color: #3498db; word-break: break-all;">
                ${confirmUrl}
              </p>
            </div>

            <div class="footer">
              <p>© ${new Date().getFullYear()} ${this.appName}. Todos os direitos reservados.</p>
              <p>Este é um email automático, por favor não responda.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateReminderText(
    customerName: string,
    barberName: string,
    serviceName: string,
    duration: string,
    appointmentTime: string,
  ): string {
    return `
Lembrete de Agendamento

Olá ${customerName},

Este é um lembrete sobre seu agendamento amanhã.

DETALHES DO AGENDAMENTO:
Profissional: ${barberName}
Serviço: ${serviceName} (${duration})
Data e Hora: ${appointmentTime}

Por favor, acesse o app para confirmar sua presença ou cancelar se necessário.

© ${new Date().getFullYear()} ${this.appName}
Este é um email automático, por favor não responda.
    `;
  }

  private formatDateTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    };

    return new Intl.DateTimeFormat('pt-BR', options).format(date);
  }
}
