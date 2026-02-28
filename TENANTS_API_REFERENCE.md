# Tenants API Reference

**All endpoints require JWT authentication (Bearer token)**

---

## Base URL
```
http://localhost:3001/api/tenants
https://horacerta.com/api/tenants  (production)
```

---

## Shop Management

### 1. Create Barber Shop ⭐

**Create a new barber shop (becomes owner)**

```
POST /tenants
```

**Request**:
```json
{
  "slug": "minha-barbearia",
  "name": "Minha Barbearia",
  "address": "Rua das Flores, 123, SP",
  "phone": "+5511999999999",
  "pix_key": "joao@example.com"
}
```

**Response** (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "minha-barbearia",
  "name": "Minha Barbearia",
  "address": "Rua das Flores, 123, SP",
  "phone": "+5511999999999",
  "pix_key": "joao@example.com",
  "logo_url": null,
  "theme": null,
  "settings": null,
  "subscription_tier": "FREE",
  "subscription_active": true,
  "owner_id": "user-id-123",
  "created_at": "2026-02-27T12:00:00Z",
  "updated_at": "2026-02-27T12:00:00Z"
}
```

**Errors**:
- `409 Conflict` - Slug already taken
- `400 Bad Request` - Invalid data

---

### 2. Get My Shops

**Get all shops where user is a member**

```
GET /tenants
```

**Response** (200):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "minha-barbearia",
    "name": "Minha Barbearia",
    ...
  }
]
```

---

### 3. Get Shop Details

**Get specific shop information**

```
GET /tenants/{tenantId}
```

**Path Parameters**:
- `tenantId` - Shop ID (UUID)

**Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "minha-barbearia",
  "name": "Minha Barbearia",
  "address": "Rua das Flores, 123, SP",
  "phone": "+5511999999999",
  "pix_key": "joao@example.com",
  "logo_url": null,
  "theme": { "primary_color": "#000000" },
  "settings": { "working_hours": {} },
  "subscription_tier": "FREE",
  "subscription_active": true,
  "owner_id": "user-id-123",
  "created_at": "2026-02-27T12:00:00Z",
  "updated_at": "2026-02-27T12:00:00Z"
}
```

**Errors**:
- `404 Not Found` - Shop not found

---

### 4. Update Shop Details

**Update shop information (owner only)**

```
PATCH /tenants/{tenantId}
```

**Path Parameters**:
- `tenantId` - Shop ID (UUID)

**Request**:
```json
{
  "name": "Minha Barbearia Premium",
  "phone": "+5511988888888",
  "address": "Rua das Flores, 456, SP",
  "logo_url": "https://example.com/logo.png",
  "pix_key": "joao.silva@example.com"
}
```

**Response** (200):
```json
{
  "id": "550e8400-...",
  "name": "Minha Barbearia Premium",
  ...
}
```

**Errors**:
- `403 Forbidden` - Only owner can update
- `404 Not Found` - Shop not found

---

## Staff Management

### 5. Add Staff Member ⭐

**Add barber, receptionist, or manager to shop (owner/manager only)**

```
POST /tenants/{tenantId}/staff
```

**Path Parameters**:
- `tenantId` - Shop ID

**Request**:
```json
{
  "email": "barber@example.com",
  "role": "BARBER"
}
```

**Request Options**:

| Role | Description |
|------|-------------|
| `BARBER` | Barber who performs services |
| `RECEPTIONIST` | Front desk staff |
| `MANAGER` | Manager with limited permissions |
| `OWNER` | Shop owner (cannot add via API) |

**Response** (201):
```json
{
  "message": "barber@example.com added as BARBER",
  "tenant_user_id": "450e8400-e29b-41d4-a716-446655440001"
}
```

**Errors**:
- `400 Bad Request` - User not found (must sign up first)
- `403 Forbidden` - Only owner/manager can add staff
- `409 Conflict` - User already a member of shop

**Important**: User must create an account first before they can be added to a shop!

---

### 6. Get Staff Members

**Get list of all staff in shop**

```
GET /tenants/{tenantId}/staff
```

**Path Parameters**:
- `tenantId` - Shop ID

**Response** (200):
```json
[
  {
    "id": "450e8400-e29b-41d4-a716-446655440001",
    "email": "joao@example.com",
    "name": "João Silva",
    "role": "OWNER",
    "user_type": "OWNER"
  },
  {
    "id": "450e8400-e29b-41d4-a716-446655440002",
    "email": "barber1@example.com",
    "name": "Barber João",
    "role": "BARBER",
    "user_type": "BARBER"
  },
  {
    "id": "450e8400-e29b-41d4-a716-446655440003",
    "email": "receptionist@example.com",
    "name": "Maria Silva",
    "role": "RECEPTIONIST",
    "user_type": "CLIENT"
  }
]
```

**Errors**:
- `403 Forbidden` - Not a member of this shop

---

### 7. Update Staff Role

**Change staff member role (owner only)**

```
PATCH /tenants/{tenantId}/staff/{tenantUserId}/role
```

**Path Parameters**:
- `tenantId` - Shop ID
- `tenantUserId` - Staff member's tenant_user ID

**Request**:
```json
{
  "role": "MANAGER"
}
```

**Response** (200):
```json
{
  "message": "Staff role updated to MANAGER",
  "new_role": "MANAGER"
}
```

**Errors**:
- `403 Forbidden` - Only owner can change roles
- `404 Not Found` - Staff member not found
- `400 Bad Request` - Cannot change owner role

---

### 8. Remove Staff Member

**Remove staff from shop (owner/manager only)**

```
DELETE /tenants/{tenantId}/staff/{tenantUserId}
```

**Path Parameters**:
- `tenantId` - Shop ID
- `tenantUserId` - Staff member's tenant_user ID

**Response** (200):
```json
{
  "message": "Staff member removed"
}
```

**Errors**:
- `403 Forbidden` - Only owner/manager can remove staff
- `404 Not Found` - Staff member not found
- `400 Bad Request` - Cannot remove owner

---

## Example Usage with cURL

### Create a Shop
```bash
curl -X POST http://localhost:3001/api/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "minha-barbearia",
    "name": "Minha Barbearia",
    "address": "Rua das Flores, 123",
    "phone": "+5511999999999",
    "pix_key": "joao@example.com"
  }'
```

### Get My Shops
```bash
curl http://localhost:3001/api/tenants \
  -H "Authorization: Bearer $TOKEN"
```

### Add a Staff Member
```bash
curl -X POST http://localhost:3001/api/tenants/{tenantId}/staff \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "barber@example.com",
    "role": "BARBER"
  }'
```

### Get Staff List
```bash
curl http://localhost:3001/api/tenants/{tenantId}/staff \
  -H "Authorization: Bearer $TOKEN"
```

### Remove Staff
```bash
curl -X DELETE http://localhost:3001/api/tenants/{tenantId}/staff/{tenantUserId} \
  -H "Authorization: Bearer $TOKEN"
```

---

## Common Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success (GET, PATCH, DELETE) |
| `201` | Created (POST) |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (no token) |
| `403` | Forbidden (no permission) |
| `404` | Not Found |
| `409` | Conflict (slug taken, duplicate member) |

---

## Authentication

All endpoints require:

```
Authorization: Bearer {JWT_TOKEN}
```

Get token from OAuth login:
```
GET /auth/google
GET /auth/google/callback
POST /auth/apple
POST /auth/apple/callback
```

---

## Validation Rules

### Slug
- Min length: 3 chars
- Max length: 50 chars
- Lowercase, hyphens, numbers only
- Must be unique

### Shop Name
- Min length: 3 chars
- Max length: 100 chars

### Phone
- Brazilian format required with `@IsPhoneNumber('BR')`
- Example: `+5511999999999`

### PIX Key
- Max length: 100 chars
- Can be email, CPF, phone, or random key

---

## Permissions Summary

| Action | OWNER | MANAGER | BARBER | RECEPTIONIST | CLIENT |
|--------|-------|---------|--------|--------------|--------|
| Create shop | ✅ | ❌ | ❌ | ❌ | ❌ |
| View shop | ✅ | ✅ | ✅ | ✅ | ❌ |
| Update shop | ✅ | ❌ | ❌ | ❌ | ❌ |
| Add staff | ✅ | ✅ | ❌ | ❌ | ❌ |
| Remove staff | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update staff role | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Response Formats

### Success Response
```json
{
  "id": "...",
  "slug": "...",
  "name": "...",
  ...
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Slug \"xyz\" is already taken",
  "error": "Bad Request"
}
```

### List Response
```json
[
  { "id": "...", ... },
  { "id": "...", ... }
]
```

---

## Rate Limiting

Not currently implemented, but recommended:
- 100 requests per minute per user
- 50 requests per minute for staff creation

---

## Webhooks

Not currently implemented, but useful events:
- `shop.created` - New shop created
- `staff.added` - Staff member added
- `staff.removed` - Staff member removed

---

## Changelog

### Version 1.0 (Feb 27, 2026)
- ✅ Shop creation endpoint
- ✅ Shop listing endpoint
- ✅ Shop details endpoint
- ✅ Shop update endpoint
- ✅ Staff management endpoints
- ✅ Role-based access control

---

## Support

For issues or questions:
1. Check [BARBER_SHOP_ONBOARDING.md](./BARBER_SHOP_ONBOARDING.md) for full guide
2. Check [SHOP_OWNER_IMPLEMENTATION.md](./SHOP_OWNER_IMPLEMENTATION.md) for architecture
3. Check error messages in response body
4. Review your JWT token expiration

---

## Related Documentation

- [BARBER_SHOP_ONBOARDING.md](./BARBER_SHOP_ONBOARDING.md) - Complete implementation guide
- [AUTH_IMPLEMENTATION.md](./AUTH_IMPLEMENTATION.md) - OAuth and JWT
- [APPOINTMENT_BOOKING_GUIDE.md](./APPOINTMENT_BOOKING_GUIDE.md) - Appointments API
- [TASK_PROGRESS.md](./TASK_PROGRESS.md) - Project status
