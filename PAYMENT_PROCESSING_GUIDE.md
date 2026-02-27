# Payment Processing Integration - Implementation Guide

**Last Updated**: Feb 27, 2026
**Status**: ✅ Completed
**Task**: #8 - Integrate payment processing (PIX and Card)

---

## Overview

The payment processing system integrates with AbakatePay to handle Brazilian payment methods (PIX and Card). Key features:

- **PIX Payments**: Instant QR code generation and payment tracking
- **Card Payments**: Support for installments (1-12x)
- **POS Transactions**: Record cash payments at terminal
- **Webhook Handling**: Real-time payment status updates
- **Payment History**: Track all payments per user
- **Refund Support**: Full and partial refunds

---

## Architecture

### Module Structure

```
backend/src/payments/
├── payments.service.ts           # Business logic & AbakatePay API wrapper
├── payments.controller.ts         # HTTP endpoints & routing
├── payments.module.ts             # Module configuration
└── dto/
    ├── create-payment.dto.ts      # Payment request validation
    ├── payment-response.dto.ts    # Response formats
    ├── webhook-payload.dto.ts     # Webhook payload structure
    └── index.ts                   # DTO exports
```

### Database Schema

Enhanced Payment entity from Task #2:

```typescript
@Entity('payments')
export class Payment extends TenantBaseEntity {
  appointment_id: UUID (nullable)      // Link to appointment
  customer_id: UUID                    // Who made the payment
  amount: Decimal(10,2)                // Amount in BRL
  currency: string = 'BRL'             // Currency code
  status: PaymentStatus                // PENDING | COMPLETED | FAILED | REFUNDED
  method: PaymentMethod                // PIX | CARD | CASH
  provider_transaction_id: string      // AbakatePay transaction ID
  external_id: string (nullable)       // Alternative external ID
  items: JSONB (nullable)              // Line items (for POS)
  discount_amount: Decimal             // Discount applied
  tip_amount: Decimal                  // Tip amount
  tax_amount: Decimal                  // Tax/service fee
  receipt_url: string (nullable)       // Digital receipt link
  paid_at: Date (nullable)             // When payment was completed
  metadata: JSONB (nullable)           // Additional payment data

  // Relations
  tenant: Tenant
  customer: Customer
  appointment: Appointment
}
```

### Enums

**PaymentStatus**:
- `PENDING` - Payment initiated, awaiting confirmation
- `COMPLETED` - Payment successfully received
- `FAILED` - Payment failed (card declined, etc)
- `REFUNDED` - Payment refunded to customer

**PaymentMethod**:
- `PIX` - Instant PIX transfer
- `CARD` - Credit or debit card
- `CASH` - Cash at POS terminal

**WebhookEventType**:
- `payment.completed` - Payment successful
- `payment.failed` - Payment failed
- `payment.refunded` - Payment refunded

---

## Features

### 1. Create PIX Payment

**Endpoint**: `POST /payments/pix`

**Request**:
```json
{
  "appointment_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 150.00
}
```

**Response** (201 Created):
```json
{
  "payment_id": "550e8400-e29b-41d4-a716-446655440005",
  "transaction_id": "txn_123456789",
  "amount": 150.00,
  "method": "PIX",
  "qr_code": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAf...",
  "qr_code_url": "https://api.example.com/qr/123456",
  "pix_key": "abc123def456",
  "expires_at": "2026-02-27T16:00:00Z",
  "status": "PENDING"
}
```

**What happens**:
1. ✅ Appointment is validated (exists, not already paid)
2. ✅ PIX request sent to AbakatePay API
3. ✅ QR code generated for customer to scan
4. ✅ Payment record created with PENDING status
5. ✅ Frontend displays QR code for customer

**QR Code Usage**:
- Display as image on payment page
- Customer scans with mobile banking app
- Payment processed immediately
- Webhook updates status to COMPLETED

### 2. Create Card Payment

**Endpoint**: `POST /payments/card`

**Request**:
```json
{
  "appointment_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 150.00,
  "installments": 3,
  "return_url": "https://example.com/payment/callback"
}
```

**Response** (201 Created):
```json
{
  "payment_id": "550e8400-e29b-41d4-a716-446655440005",
  "payment_intent_id": "pi_123456789",
  "amount": 150.00,
  "method": "CARD",
  "installments": 3,
  "status": "PENDING",
  "payment_url": "https://pay.example.com/checkout/pi_123456789"
}
```

**What happens**:
1. ✅ Appointment validated
2. ✅ Card payment intent created with AbakatePay
3. ✅ Installment plan set up (if 3x, each payment is ~R$50)
4. ✅ Payment URL generated for card form
5. ✅ Customer redirected to payment page

**Card Payment Flow**:
- Customer fills card details on hosted form
- Payment processed via AbakatePay
- Webhook confirms completion
- Appointment marked as paid

### 3. Record POS Transaction (Cash)

**Endpoint**: `POST /payments/pos`

**Request**:
```json
{
  "appointment_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 150.00
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "appointment_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 150.00,
  "method": "CASH",
  "status": "COMPLETED",
  "paid_at": "2026-02-27T15:30:00Z",
  "created_at": "2026-02-27T15:30:00Z",
  "updated_at": "2026-02-27T15:30:00Z"
}
```

**What happens**:
1. ✅ Appointment validated
2. ✅ Cash payment immediately marked as COMPLETED
3. ✅ Receipt generated
4. ✅ Appointment payment_status set to COMPLETED
5. ✅ No webhook needed (POS is synchronous)

**Use Case**:
- Barber collects cash from customer
- Barber records payment at POS terminal
- Receipt printed
- Appointment marked as paid

### 4. Get Payment Status

**Endpoint**: `GET /payments/:id`

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "appointment_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 150.00,
  "method": "PIX",
  "status": "COMPLETED",
  "external_id": "txn_123456789",
  "paid_at": "2026-02-27T15:30:00Z",
  "created_at": "2026-02-27T15:00:00Z",
  "updated_at": "2026-02-27T15:30:00Z"
}
```

### 5. List Payments

**Endpoint**: `GET /payments`

**Query Parameters**:
- `status` - Filter by status (PENDING, COMPLETED, FAILED, REFUNDED)
- `method` - Filter by method (PIX, CARD, CASH)
- `from_date` - Filter payments after date (ISO 8601)
- `to_date` - Filter payments before date (ISO 8601)

**Example**:
```
GET /payments?status=COMPLETED&method=PIX&from_date=2026-02-01T00:00:00Z
```

**Response** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "appointment_id": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 150.00,
    "method": "PIX",
    "status": "COMPLETED",
    "external_id": "txn_123456789",
    "paid_at": "2026-02-27T15:30:00Z",
    "created_at": "2026-02-27T15:00:00Z",
    "updated_at": "2026-02-27T15:30:00Z"
  }
]
```

### 6. Refund Payment

**Endpoint**: `PATCH /payments/:id/refund`

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "appointment_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 150.00,
  "method": "PIX",
  "status": "REFUNDED",
  "external_id": "txn_123456789",
  "paid_at": null,
  "created_at": "2026-02-27T15:00:00Z",
  "updated_at": "2026-02-27T15:45:00Z"
}
```

**What happens**:
1. ✅ Payment validated (must be COMPLETED)
2. For Card/PIX:
   - ✅ Refund request sent to AbakatePay
   - ✅ Customer receives refund
3. For Cash:
   - ✅ Payment marked as REFUNDED
   - ✅ No API call needed
4. ✅ Appointment payment_status reset to PENDING

### 7. Webhook Handler (No Auth Required)

**Endpoint**: `POST /payments/webhook`

**Headers**:
```
x-webhook-signature: <HMAC-SHA256 signature>
```

**Payload**:
```json
{
  "event_type": "payment.completed",
  "transaction_id": "txn_123456789",
  "amount": 150.00,
  "payment_method": "pix",
  "timestamp": "2026-02-27T15:30:00Z"
}
```

**What happens**:
1. ✅ Signature validated using HMAC-SHA256
2. ✅ Signature invalid → reject (400)
3. ✅ Signature valid → process event
4. ✅ Payment found and updated based on event_type
5. ✅ Appointment payment_status updated
6. ✅ Return 200 OK (idempotent)

**Event Types**:

**payment.completed**:
- Finds payment by transaction_id
- Sets status = COMPLETED
- Sets paid_at = now
- Updates appointment.payment_status = COMPLETED
- Links appointment.payment_id = payment.id

**payment.failed**:
- Finds payment by transaction_id
- Sets status = FAILED
- Stores error message in metadata
- Appointment payment_status remains PENDING

**payment.refunded**:
- Finds payment by transaction_id
- Sets status = REFUNDED
- Stores refund_id and date in metadata
- Resets appointment.payment_status = PENDING

---

## Security

### API Key Management
```
ABAKATE_API_KEY=your-api-key-here
ABAKATE_API_SECRET=your-api-secret-here
ABAKATE_API_URL=https://sandbox.abakate.com.br/api (or production URL)
```

### Webhook Signature Validation
Every webhook includes `x-webhook-signature` header with HMAC-SHA256 signature:

```typescript
const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(JSON.stringify(payload))
  .digest('hex');

// Verify: signature === headerSignature
```

### PCI Compliance
- ✅ Card details handled by AbakatePay (hosted form)
- ✅ Never store card numbers in our database
- ✅ Only store transaction IDs and payment status
- ✅ Webhook signatures prevent spoofing

---

## Payment Flows

### PIX Payment Flow

```
1. Customer selects PIX payment method
   ↓
2. Frontend calls POST /payments/pix
   ↓
3. Backend creates PIX with AbakatePay API
   ↓
4. QR code returned to frontend
   ↓
5. Customer scans with mobile banking
   ↓
6. Customer confirms payment in bank app
   ↓
7. AbakatePay sends webhook (payment.completed)
   ↓
8. Backend updates payment status = COMPLETED
   ↓
9. Frontend polls GET /payments/:id (or WebSocket)
   ↓
10. Shows success message
```

**Timeline**: ~30 seconds from scan to confirmation

### Card Payment Flow

```
1. Customer selects card payment method
   ↓
2. Frontend calls POST /payments/card
   ↓
3. Backend creates payment intent with AbakatePay
   ↓
4. Payment URL returned to frontend
   ↓
5. Frontend redirects to AbakatePay hosted form
   ↓
6. Customer enters card details and confirms
   ↓
7. AbakatePay processes card
   ↓
8. Webhook sent to backend (payment.completed/failed)
   ↓
9. Backend updates payment status
   ↓
10. Redirect to return_url with status parameter
```

**Timeline**: ~1-2 minutes (customer interaction time)

### POS Cash Payment Flow

```
1. Service completed
   ↓
2. Barber collects cash from customer
   ↓
3. Barber records payment: POST /payments/pos
   ↓
4. Backend immediately marks as COMPLETED
   ↓
5. Receipt generated and printed
   ↓
6. Appointment marked as paid
```

**Timeline**: Instant (synchronous)

---

## Error Handling

### Common Error Responses

**400 Bad Request** - Invalid appointment:
```json
{
  "statusCode": 400,
  "message": "Appointment already paid",
  "error": "Bad Request"
}
```

**404 Not Found** - Payment not found:
```json
{
  "statusCode": 404,
  "message": "Payment not found",
  "error": "Not Found"
}
```

**422 Unprocessable Entity** - API call failed:
```json
{
  "statusCode": 422,
  "message": "Failed to create PIX payment: Network timeout",
  "error": "Unprocessable Entity"
}
```

### Webhook Error Handling

**Invalid Signature** (400):
```
POST /payments/webhook
x-webhook-signature: invalid_signature
→ 400 Bad Request: Invalid webhook signature
```

**Accepted but Ignored**:
- Unknown event_type → accepted (200) but not processed
- Payment not found → accepted (200) but logged as warning
- Idempotent: processing same webhook twice is safe

---

## Environment Configuration

### Development (Sandbox)

```env
# AbakatePay Sandbox
ABAKATE_API_KEY=sandbox_key_123456
ABAKATE_API_SECRET=sandbox_secret_789012
ABAKATE_API_URL=https://sandbox.abakate.com.br/api

# Frontend URL for redirects
FRONTEND_URL=http://localhost:5173
```

### Production

```env
# AbakatePay Production
ABAKATE_API_KEY=prod_key_xxx
ABAKATE_API_SECRET=prod_secret_yyy
ABAKATE_API_URL=https://api.abakate.com.br/api

# Frontend URL
FRONTEND_URL=https://example.com
```

---

## Testing Guide

### 1. Test PIX Payment

```bash
# 1. Create PIX payment
curl -X POST http://localhost:3001/payments/pix \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 150.00
  }'

# Response:
# {
#   "payment_id": "...",
#   "transaction_id": "...",
#   "qr_code": "...",
#   "status": "PENDING"
# }

# 2. Check payment status
curl http://localhost:3001/payments/<PAYMENT_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 2. Test Webhook

```bash
# Simulate AbakatePay webhook
PAYLOAD='{"event_type":"payment.completed","transaction_id":"txn_123","amount":150,"payment_method":"pix","timestamp":"2026-02-27T15:30:00Z"}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "your-secret" -hex | sed 's/^[^=]*= //')

curl -X POST http://localhost:3001/payments/webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

### 3. Test Card Payment

```bash
curl -X POST http://localhost:3001/payments/card \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 150.00,
    "installments": 3,
    "return_url": "http://localhost:5173/payment/callback"
  }'
```

### 4. Test POS Transaction

```bash
curl -X POST http://localhost:3001/payments/pos \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 150.00
  }'
```

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| POST | `/payments/pix` | Create PIX payment | JWT | ✅ |
| POST | `/payments/card` | Create card payment | JWT | ✅ |
| POST | `/payments/pos` | Record POS transaction | JWT | ✅ |
| GET | `/payments` | List payments | JWT | ✅ |
| GET | `/payments/:id` | Get payment details | JWT | ✅ |
| PATCH | `/payments/:id/refund` | Refund payment | JWT | ✅ |
| POST | `/payments/webhook` | Webhook handler | No Auth | ✅ |

---

## Files Created

- ✅ `backend/src/payments/payments.service.ts` (520 lines)
- ✅ `backend/src/payments/payments.controller.ts` (160 lines)
- ✅ `backend/src/payments/payments.module.ts` (15 lines)
- ✅ `backend/src/payments/dto/create-payment.dto.ts` (45 lines)
- ✅ `backend/src/payments/dto/payment-response.dto.ts` (110 lines)
- ✅ `backend/src/payments/dto/webhook-payload.dto.ts` (50 lines)
- ✅ `backend/src/payments/dto/index.ts` (5 lines)
- ✅ `backend/src/database/migrations/1704081600003-EnhancePaymentEntity.ts` (60 lines)
- ✅ `backend/src/database/entities/payment.entity.ts` (enhanced)

**Total**: 9 files, 965 lines of code

---

## Migration

Run migration to add new Payment fields:

```bash
npm run migration:run
```

This will add:
- `external_id` column
- `paid_at` column
- `metadata` JSONB column
- Foreign key relationship to appointments table

---

## Next Steps

### Immediate
1. Set up AbakatePay sandbox account
2. Generate API keys
3. Configure `.env` with credentials
4. Test PIX and Card payment flows
5. Test webhook handling

### Phase 2 (Task #9)
- Appointment reminder system (24h before)
- Email notifications
- Confirmation/cancellation links
- Auto-release slots if not confirmed

### Phase 3 (Task #10)
- Waitlist management
- Auto-fill released slots
- Notification system for waitlist

---

## Build Status

✅ **TypeScript Compilation**: SUCCESS
✅ **Module Registration**: SUCCESS
✅ **Dependency Injection**: SUCCESS
✅ **Database Enhancement**: READY FOR MIGRATION

---

## References

- [AbakatePay API Documentation](https://docs.abakate.com.br)
- [PRD.md Section 3.6](./PRD.md#36-payment-integration-abakate)
- [APPOINTMENT_BOOKING_GUIDE.md](./APPOINTMENT_BOOKING_GUIDE.md)
