# Appointment Booking System - Implementation Guide

**Last Updated**: Feb 27, 2026
**Status**: ✅ Completed
**Task**: #7 - Build appointment booking system

---

## Overview

The appointment booking system enables customers to book appointments with barbers, manage their bookings, and barbers to track and manage their schedule. The system includes:

- **Availability Validation**: Prevents double-booking through conflict detection
- **Status Management**: Track appointment lifecycle (SCHEDULED → CONFIRMED → COMPLETED)
- **Rescheduling**: Customers and barbers can reschedule appointments
- **Cancellation**: Cancel appointments before completion
- **Notes Management**: Add notes to appointments for special requests

---

## Architecture

### Module Structure

```
backend/src/appointments/
├── appointments.service.ts        # Business logic & database operations
├── appointments.controller.ts      # HTTP endpoints & routing
├── appointments.module.ts          # Module configuration
└── dto/
    ├── create-appointment.dto.ts   # Booking request validation
    ├── update-appointment.dto.ts   # Reschedule request validation
    ├── change-appointment-status.dto.ts  # Status change validation
    ├── appointment-response.dto.ts # API response format
    └── index.ts                    # DTO exports
```

### Database Schema

Uses existing Appointment entity from Task #2:

```typescript
@Entity('appointments')
export class Appointment extends TenantBaseEntity {
  barber_id: UUID          // Who is providing the service
  customer_id: UUID        // Who is booking the appointment
  service_id: UUID         // What service is being booked
  scheduled_start: Date    // Appointment start time
  scheduled_end: Date      // Appointment end time
  status: AppointmentStatus       // SCHEDULED | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW
  payment_status: PaymentStatus   // PENDING | COMPLETED | FAILED | REFUNDED
  payment_id: UUID (nullable)     // Link to Payment record
  notes: string (nullable)        // Special requests or notes
  reminder_sent_at: Date (nullable)  // When reminder was sent
}
```

### Enums

**AppointmentStatus**:
- `SCHEDULED` - Initial state after booking
- `CONFIRMED` - Customer confirmed or barber confirmed
- `COMPLETED` - Service was provided
- `CANCELLED` - Customer/barber cancelled
- `NO_SHOW` - Customer didn't show up

**PaymentStatus**:
- `PENDING` - Awaiting payment
- `COMPLETED` - Payment received
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded

---

## Features

### 1. Book Appointment

**Endpoint**: `POST /appointments`

**Request**:
```json
{
  "barber_id": "550e8400-e29b-41d4-a716-446655440001",
  "service_id": "550e8400-e29b-41d4-a716-446655440003",
  "scheduled_start": "2026-03-15T10:00:00Z",
  "scheduled_end": "2026-03-15T10:30:00Z",
  "customer_name": "João Silva",
  "customer_email": "joao@example.com",
  "customer_phone": "11987654321",
  "notes": "First time, prefers fade cut"
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "barber_id": "550e8400-e29b-41d4-a716-446655440001",
  "customer_id": "550e8400-e29b-41d4-a716-446655440002",
  "service_id": "550e8400-e29b-41d4-a716-446655440003",
  "scheduled_start": "2026-03-15T10:00:00Z",
  "scheduled_end": "2026-03-15T10:30:00Z",
  "status": "SCHEDULED",
  "payment_status": "PENDING",
  "payment_id": null,
  "notes": "First time, prefers fade cut",
  "created_at": "2026-02-27T10:00:00Z",
  "updated_at": "2026-02-27T10:00:00Z"
}
```

**Validations**:
- ✅ Start time must be before end time
- ✅ Cannot book in the past
- ✅ Duration must match service duration
- ✅ No conflicts with existing SCHEDULED/CONFIRMED appointments
- ✅ Barber and service must exist
- ✅ Barber must be from same tenant

**Errors**:
- `400 Bad Request` - Invalid time or duration
- `404 Not Found` - Barber or service not found
- `409 Conflict` - Time slot already booked

### 2. List Appointments

**Endpoint**: `GET /appointments`

**Query Parameters**:
- `status` - Filter by status (SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW)
- `barber_id` - Filter by barber
- `customer_id` - Filter by customer
- `from_date` - Filter appointments after this date (ISO 8601)
- `to_date` - Filter appointments before this date (ISO 8601)

**Example**:
```
GET /appointments?status=SCHEDULED&from_date=2026-03-01T00:00:00Z&to_date=2026-03-31T23:59:59Z
```

**Response** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "barber_id": "550e8400-e29b-41d4-a716-446655440001",
    "customer_id": "550e8400-e29b-41d4-a716-446655440002",
    "service_id": "550e8400-e29b-41d4-a716-446655440003",
    "scheduled_start": "2026-03-15T10:00:00Z",
    "scheduled_end": "2026-03-15T10:30:00Z",
    "status": "SCHEDULED",
    "payment_status": "PENDING",
    "payment_id": null,
    "notes": "First time, prefers fade cut",
    "created_at": "2026-02-27T10:00:00Z",
    "updated_at": "2026-02-27T10:00:00Z"
  }
]
```

**Access Control**:
- Barbers see: All their appointments
- Customers see: Only their own appointments
- Returns empty array if user has no relevant appointments

### 3. Get Appointment Details

**Endpoint**: `GET /appointments/:id`

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "barber_id": "550e8400-e29b-41d4-a716-446655440001",
  "customer_id": "550e8400-e29b-41d4-a716-446655440002",
  "service_id": "550e8400-e29b-41d4-a716-446655440003",
  "scheduled_start": "2026-03-15T10:00:00Z",
  "scheduled_end": "2026-03-15T10:30:00Z",
  "status": "SCHEDULED",
  "payment_status": "PENDING",
  "payment_id": null,
  "notes": "First time, prefers fade cut",
  "created_at": "2026-02-27T10:00:00Z",
  "updated_at": "2026-02-27T10:00:00Z",
  "barber": { /* Barber details */ },
  "customer": { /* Customer details */ },
  "service": { /* Service details */ }
}
```

**Errors**:
- `404 Not Found` - Appointment doesn't exist
- `403 Forbidden` - User doesn't have access to this appointment

### 4. Update Appointment Status

**Endpoint**: `PATCH /appointments/:id/status`

**Request**:
```json
{
  "status": "CONFIRMED"
}
```

**Valid Status Transitions**:

| Current | Valid Next States |
|---------|-------------------|
| SCHEDULED | CONFIRMED, CANCELLED |
| CONFIRMED | COMPLETED, NO_SHOW, CANCELLED |
| COMPLETED | (no transitions) |
| CANCELLED | (no transitions) |
| NO_SHOW | (no transitions) |

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "CONFIRMED",
  "updated_at": "2026-02-27T10:30:00Z"
  // ... other fields
}
```

**Access Control**:
- ✅ Only barber can update status
- ❌ Customer cannot update status

**Errors**:
- `400 Bad Request` - Invalid status transition
- `403 Forbidden` - User is not the barber
- `404 Not Found` - Appointment not found

### 5. Reschedule Appointment

**Endpoint**: `PATCH /appointments/:id`

**Request**:
```json
{
  "scheduled_start": "2026-03-16T14:00:00Z",
  "scheduled_end": "2026-03-16T14:30:00Z",
  "notes": "Customer prefers afternoon"
}
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "scheduled_start": "2026-03-16T14:00:00Z",
  "scheduled_end": "2026-03-16T14:30:00Z",
  "notes": "Customer prefers afternoon",
  "updated_at": "2026-02-27T10:30:00Z"
  // ... other fields
}
```

**Validations**:
- ✅ Can only reschedule SCHEDULED or CONFIRMED appointments
- ✅ New time must be in the future
- ✅ Duration must match service duration
- ✅ No conflicts with other appointments
- ✅ Start time must be before end time

**Access Control**:
- ✅ Customer can reschedule own appointment
- ✅ Barber can reschedule own appointments
- ❌ Cannot reschedule other users' appointments

**Errors**:
- `400 Bad Request` - Invalid times or duration mismatch
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Appointment not found
- `409 Conflict` - New time slot not available

### 6. Cancel Appointment

**Endpoint**: `DELETE /appointments/:id`

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "CANCELLED",
  "updated_at": "2026-02-27T10:30:00Z"
  // ... other fields
}
```

**Validations**:
- ✅ Can only cancel SCHEDULED or CONFIRMED appointments
- ❌ Cannot cancel COMPLETED, CANCELLED, or NO_SHOW appointments

**Access Control**:
- ✅ Customer can cancel own appointment
- ✅ Barber can cancel own appointments

**Errors**:
- `400 Bad Request` - Cannot cancel this appointment status
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Appointment not found

---

## Conflict Detection Algorithm

The system prevents double-booking through conflict detection:

```
1. Get requested time: [scheduled_start, scheduled_end]
2. Query for existing appointments with:
   - Same barber_id
   - Status = SCHEDULED OR CONFIRMED
   - scheduled_start < requested_end
   - scheduled_end > requested_start
3. If any exist → ConflictException (409)
4. If none → Create appointment
```

**Example**:
```
Existing appointment: [10:00 - 10:30]

Request: [10:15 - 10:45] → CONFLICT (overlaps)
Request: [09:45 - 10:00] → OK (just before)
Request: [10:30 - 11:00] → OK (just after)
Request: [10:29 - 10:31] → CONFLICT (overlaps slightly)
```

---

## Customer Flow

1. **Browse Services**: View available services with durations
2. **Check Availability**: Call GET `/availability/slots` with date, barber, duration
3. **Book Appointment**: Call POST `/appointments` with selected slot
4. **Receive Confirmation**: Get appointment details with status SCHEDULED
5. **Receive Reminder**: 24h before appointment (Task #9)
6. **Confirm Attendance**: System waits for payment or confirmation (Task #9)
7. **Visit Barber**: Barber marks status as CONFIRMED/COMPLETED
8. **Payment**: Barber collects payment (Task #8)

---

## Barber Flow

1. **Set Availability**: Configure working hours (Task #6)
2. **View Appointments**: GET `/appointments` shows all booked slots
3. **Manage Status**: Update appointment status as service progresses
   - SCHEDULED → CONFIRMED (when customer arrives)
   - CONFIRMED → COMPLETED (when service finished)
   - CONFIRMED → NO_SHOW (if customer doesn't arrive)
4. **Handle Changes**: Reschedule or cancel if needed
5. **Process Payment**: Collect payment (Task #8)

---

## Error Handling

### Common Error Responses

**400 Bad Request**:
```json
{
  "statusCode": 400,
  "message": "Start time must be before end time",
  "error": "Bad Request"
}
```

**403 Forbidden**:
```json
{
  "statusCode": 403,
  "message": "You do not have access to this appointment",
  "error": "Forbidden"
}
```

**404 Not Found**:
```json
{
  "statusCode": 404,
  "message": "Appointment not found",
  "error": "Not Found"
}
```

**409 Conflict**:
```json
{
  "statusCode": 409,
  "message": "Time slot is not available for this barber",
  "error": "Conflict"
}
```

---

## Testing Guide

### 1. Book Appointment

```bash
curl -X POST http://localhost:3001/appointments \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "barber_id": "550e8400-e29b-41d4-a716-446655440001",
    "service_id": "550e8400-e29b-41d4-a716-446655440003",
    "scheduled_start": "2026-03-15T10:00:00Z",
    "scheduled_end": "2026-03-15T10:30:00Z",
    "notes": "First time customer"
  }'
```

### 2. Test Double-Booking Prevention

```bash
# First booking
curl -X POST http://localhost:3001/appointments \
  ... (same slot)

# Second booking same slot → Should get 409 Conflict
curl -X POST http://localhost:3001/appointments \
  ... (same slot) → 409 Conflict
```

### 3. Test Status Transitions

```bash
# Valid: SCHEDULED → CONFIRMED
curl -X PATCH http://localhost:3001/appointments/<ID>/status \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"status": "CONFIRMED"}'

# Invalid: SCHEDULED → COMPLETED
curl -X PATCH http://localhost:3001/appointments/<ID>/status \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"status": "COMPLETED"}' → 400 Bad Request
```

### 4. Test Reschedule

```bash
curl -X PATCH http://localhost:3001/appointments/<ID> \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "scheduled_start": "2026-03-16T14:00:00Z",
    "scheduled_end": "2026-03-16T14:30:00Z"
  }'
```

### 5. Test Cancellation

```bash
curl -X DELETE http://localhost:3001/appointments/<ID> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## API Endpoints Summary

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| POST | `/appointments` | Book appointment | JWT | ✅ Implemented |
| GET | `/appointments` | List appointments | JWT | ✅ Implemented |
| GET | `/appointments/:id` | Get details | JWT | ✅ Implemented |
| PATCH | `/appointments/:id/status` | Update status | JWT | ✅ Implemented |
| PATCH | `/appointments/:id` | Reschedule | JWT | ✅ Implemented |
| DELETE | `/appointments/:id` | Cancel | JWT | ✅ Implemented |

---

## Access Control Matrix

|  | Book | View Own | View All | Update Status | Reschedule | Cancel |
|---|------|----------|----------|--|------------|--------|
| **Customer** | ✅ Own | ✅ | ❌ | ❌ | ✅ Own | ✅ Own |
| **Barber** | ❌ | ✅ Own | ✅ All | ✅ Own | ✅ Own | ✅ Own |
| **Admin** | ✅ | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |

---

## Database Queries

### Find appointments for specific barber

```typescript
appointments = await appointmentRepository.find({
  where: {
    barber_id: '...',
    status: In([AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]),
    scheduled_start: MoreThanOrEqual(today),
  },
  order: { scheduled_start: 'ASC' },
});
```

### Find conflicts for rescheduling

```typescript
conflict = await appointmentRepository
  .createQueryBuilder('a')
  .where('a.barber_id = :barberId', { barberId })
  .andWhere('a.id != :appointmentId', { appointmentId })
  .andWhere('a.scheduled_start < :newEnd', { newEnd })
  .andWhere('a.scheduled_end > :newStart', { newStart })
  .andWhere('a.status IN (:...statuses)', {
    statuses: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
  })
  .getOne();
```

---

## Future Enhancements

1. **Automatic Confirmations** (Task #9)
   - Send reminder 24h before
   - Auto-release slot if no confirmation by 2h mark

2. **Payment Integration** (Task #8)
   - Link appointment to payment
   - Only confirm after payment received

3. **Customer Notifications**
   - SMS/Email when appointment is booked
   - Reminder 24h before
   - Confirmation request link

4. **Waitlist Management** (Task #10)
   - If slot unavailable, add to waitlist
   - Auto-notify when slot becomes available

5. **Recurring Appointments**
   - Book same slot weekly/monthly
   - Automatic reminder system

6. **Barber Preferences**
   - Set preferred slot duration
   - Buffer time between appointments

---

## Files Created

- ✅ `backend/src/appointments/appointments.service.ts` (430 lines)
- ✅ `backend/src/appointments/appointments.controller.ts` (160 lines)
- ✅ `backend/src/appointments/appointments.module.ts` (18 lines)
- ✅ `backend/src/appointments/dto/create-appointment.dto.ts` (50 lines)
- ✅ `backend/src/appointments/dto/update-appointment.dto.ts` (30 lines)
- ✅ `backend/src/appointments/dto/change-appointment-status.dto.ts` (15 lines)
- ✅ `backend/src/appointments/dto/appointment-response.dto.ts` (80 lines)
- ✅ `backend/src/appointments/dto/index.ts` (4 lines)

**Total**: 8 files, 787 lines of code

---

## Build Status

✅ **TypeScript Compilation**: SUCCESS
✅ **Module Registration**: SUCCESS
✅ **Dependency Injection**: SUCCESS
✅ **All Tests**: READY FOR TESTING

---

## Next Task

**Task #8**: Integrate payment processing (PIX and Card)

- Set up AbakatePay API integration
- Create payment service with API wrapper
- Implement PIX QR code generation
- Handle payment webhooks
- Link appointments to payments
- Update appointment status on payment completion

**Dependencies**: Task #7 (✅ COMPLETE)
