# Quick Start: Google OAuth Testing

## Prerequisites
- PostgreSQL running on localhost:5432
- Node.js and npm installed
- Google OAuth credentials from Google Cloud Console

## Step 1: Set Up Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → Create **OAuth 2.0 Client ID**
5. Set up:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3001`
   - Authorized redirect URIs: `http://localhost:3001/auth/google/callback`
6. Copy **Client ID** and **Client Secret**

## Step 2: Update .env File

Edit `backend/.env`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
JWT_SECRET=your-super-secret-key-here
FRONTEND_URL=http://localhost:5173
```

## Step 3: Run Database Migrations

```bash
cd backend
npm run migration:run
```

This will add `google_id` and `email_verified` columns to the users table.

## Step 4: Start Backend

```bash
npm run start:dev
```

You should see:
```
✅ Application running on http://localhost:3001
📚 API Docs available at http://localhost:3001/api
```

## Step 5: Test OAuth Flow

### Option A: Using Browser

1. Open http://localhost:3001/auth/google
2. Login with your Google account
3. You'll be redirected to http://localhost:5173/auth/callback?token=YOUR_TOKEN
4. Extract the token from the URL

### Option B: Using Swagger UI

1. Open http://localhost:3001/api
2. Click on **auth** section
3. Click on **GET /auth/google**
4. Click **Try it out**
5. This will redirect to Google login

### Option C: Using curl

```bash
# This won't work with curl directly because OAuth requires browser session
# But you can test the profile endpoint with a token

# First, get a token from the browser flow above, then:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/auth/profile
```

## Step 6: Verify User in Database

```bash
# Connect to PostgreSQL
psql -U postgres -d hora_certa_dev -c "SELECT id, email, name, google_id, email_verified, user_type FROM users;"
```

You should see the user created with:
- `google_id` = Google's unique ID
- `email_verified` = true
- `user_type` = CLIENT

## Step 7: Test Protected Route

```bash
# Get your JWT token from the OAuth flow

# Test with valid token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/auth/profile

# Should return 200 with user profile

# Test without token
curl http://localhost:3001/auth/profile
# Should return 401 Unauthorized
```

## Troubleshooting

### "Cannot reach Google login"
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in .env
- Verify you're on localhost:3001

### "Callback URL mismatch"
- Ensure `GOOGLE_CALLBACK_URL` in .env matches Google Cloud Console exactly
- Must be: `http://localhost:3001/auth/google/callback`

### "User not created in database"
- Check PostgreSQL is running
- Check migrations were applied: `npm run migration:run`
- Check user creation logs in console

### "JWT validation fails"
- Check `JWT_SECRET` is set in .env
- Token format must be: `Authorization: Bearer <token>`
- Token expires after 7 days

## API Endpoints

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| GET | `/auth/google` | No | Start OAuth flow |
| GET | `/auth/google/callback` | No | OAuth callback (auto) |
| GET | `/auth/profile` | Yes* | Get current user |

*Requires Bearer token in Authorization header

## Next Steps

1. **Test all endpoints** in Swagger at `/api`
2. **Create frontend login page** with button to `/auth/google`
3. **Store token** in localStorage on frontend
4. **Add tenant creation** - let users create/manage barber shops
5. **Add role management** - assign users to tenants with specific roles

## File Structure

```
backend/src/
├── auth/
│   ├── auth.controller.ts      (OAuth endpoints)
│   ├── auth.service.ts         (User validation, JWT)
│   ├── auth.module.ts          (Module config)
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── dto/
│   │   └── auth-response.dto.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── google-auth.guard.ts
│   └── strategies/
│       ├── google.strategy.ts
│       └── jwt.strategy.ts
├── database/
│   ├── entities/
│   │   └── user.entity.ts      (Updated with OAuth fields)
│   └── migrations/
│       └── 1704081600001-AddOAuthFieldsToUser.ts
├── app.module.ts               (Updated with AuthModule)
└── main.ts
```

## What's Working

✅ Google OAuth login flow
✅ JWT token generation
✅ Protected routes with JWT
✅ User auto-creation on first OAuth login
✅ User profile update on subsequent logins
✅ Swagger documentation with auth
✅ CORS enabled for frontend

## What's Next

After testing OAuth, implement:

1. **Tenant Creation** - Users create barber shops
2. **Tenant User Roles** - Assign users to tenants (OWNER, MANAGER, BARBER, RECEPTIONIST)
3. **Tenant Isolation** - Middleware to extract tenant from JWT
4. **Role-Based Guards** - Protect endpoints by role
5. **Profile Management** - Update user profile

See `AUTH_IMPLEMENTATION.md` for full details.
