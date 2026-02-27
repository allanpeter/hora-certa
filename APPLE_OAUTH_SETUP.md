# Apple OAuth Setup Guide - Hora Certa

**Last Updated**: Feb 27, 2026
**Status**: ✅ Complete
**Task**: #3 - Implement Apple OAuth SSO

---

## Overview

Complete step-by-step guide to set up Apple Sign in for Hora Certa users. Apple OAuth provides a secure, privacy-focused authentication method with email relay support.

---

## Prerequisites

### 1. Apple Developer Account

- Active Apple Developer Program membership ($99/year)
- Visit: https://developer.apple.com/
- Required roles: Agent or Admin

### 2. App Information

You'll need to gather:
- App ID (Bundle Identifier)
- App name
- Return URLs (redirect URIs)

### 3. Certificates and Keys

- Private key for signing JWTs
- Key ID from Apple
- Team ID from Apple

---

## Step-by-Step Setup

### Step 1: Create an App ID (Bundle Identifier)

1. Go to [Apple Developer Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list)
2. Click **Identifiers** in the left sidebar
3. Click the **+** button to create a new identifier
4. Select **App IDs** and click **Continue**
5. Select **App** and click **Continue**
6. Fill in the form:
   - **Description**: "Hora Certa App" (or your app name)
   - **Bundle ID**: Use reverse domain notation
     - Example: `com.horacerta.app` (for production)
     - Example: `com.horacerta.app.dev` (for development)
7. In **Capabilities**, find and enable **Sign in with Apple**
8. Click **Continue** and then **Register**

**Save your Bundle ID** - you'll need it later.

### Step 2: Create a Services ID

Services ID represents your web domain for Apple Sign in.

1. Go back to [Identifiers](https://developer.apple.com/account/resources/identifiers/list)
2. Click **Services IDs** in the left sidebar
3. Click the **+** button
4. Select **Services IDs** and click **Continue**
5. Fill in the form:
   - **Description**: "Hora Certa Web"
   - **Identifier**: Reverse domain format
     - Example: `com.horacerta.web`
6. Click **Continue** and then **Register**

**Save your Services ID** - needed for web setup.

### Step 3: Configure Web Return URLs

1. Go back to [Services IDs](https://developer.apple.com/account/resources/identifiers/list)
2. Find your newly created Services ID and click it
3. Enable **Sign in with Apple** checkbox
4. Click **Configure**
5. Add your **Return URLs**:
   - Development: `http://localhost:3001/auth/apple/callback`
   - Production: `https://horacerta.com/auth/apple/callback`
6. Click **Save**

---

### Step 4: Create a Private Key

1. Go to [Keys](https://developer.apple.com/account/resources/authkeys/list) in Developer Account
2. Click the **+** button to create a new key
3. Fill in:
   - **Key Name**: "Hora Certa Apple Sign In Key"
4. Enable **Sign in with Apple** checkbox
5. Click **Configure**
   - Primary App ID: Select your App ID from Step 1
   - Web Domain: Select your Services ID from Step 2
   - Return URL: Add `http://localhost:3001/auth/apple/callback`
6. Click **Save**
7. Click **Continue**
8. Review and click **Register**

**IMPORTANT**: Download the `.p8` private key file immediately - it's only available once.

**Save the following from the page**:
- **Key ID** (displayed on the keys list)
- **Team ID** (visible in the top-right corner of Apple Developer account)
- **Private Key** (from the `.p8` file)

---

### Step 5: Extract Private Key Content

The private key file is in `.p8` format. Open it with a text editor:

```bash
cat ~/Downloads/AuthKey_[KeyID].p8
```

**Output will look like:**
```
-----BEGIN PRIVATE KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
...rest of key...
-----END PRIVATE KEY-----
```

Keep this entire content including the BEGIN and END lines.

---

### Step 6: Configure Environment Variables

Update your `.env` file with Apple credentials:

```bash
# Apple OAuth
APPLE_TEAM_ID=your_team_id_here
APPLE_KEY_ID=your_key_id_here
APPLE_CLIENT_ID=com.horacerta.web  # Your Services ID
APPLE_PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\n...your key content...\n-----END PRIVATE KEY-----'
APPLE_CALLBACK_URL=http://localhost:3001/auth/apple/callback
```

**Important**:
- `APPLE_CLIENT_ID` should be your **Services ID** (not the App ID)
- Wrap `APPLE_PRIVATE_KEY` in single quotes
- Replace newlines with `\n` in the .env file or keep multi-line in `.env.production`

---

### Step 7: Verify Configuration

Check that your backend can read the configuration:

```bash
npm run build
npm run start:dev
```

Visit Swagger: http://localhost:3001/api

Should see:
- `POST /auth/apple` - Initiate Apple OAuth
- `POST /auth/apple/callback` - Callback handler

---

## Testing Apple OAuth Locally

### Using Safari (Recommended)

1. Start your backend: `npm run start:dev`
2. Open Safari browser (Apple Sign in only works in Safari on Apple devices)
3. Visit: `http://localhost:3001/auth/apple`
4. You'll be redirected to Apple's login screen
5. Sign in with your Apple ID
6. Authorize the app
7. Should redirect back to: `http://localhost:5173/auth/callback?token=...`

### Using Web

For testing on non-Apple devices:

1. Use Apple's OAuth test endpoint
2. Or create a test Apple ID at https://appleid.apple.com/
3. Test with curl:

```bash
curl -X POST http://localhost:3001/auth/apple \
  -H "Content-Type: application/json" \
  -d '{"user":"{\"name\":{\"firstName\":\"John\",\"lastName\":\"Doe\"},\"email\":\"user@example.com\"}"}'
```

---

## Private Email Relay

Apple users can hide their actual email using "Hide My Email" feature.

### How It Works

1. User enables "Sign in with Apple" with "Share My Email" unchecked
2. Apple generates a private relay email: `xyz1234@privaterelay.appleid.com`
3. The user's real email is kept private

### Implementation

The strategy handles this automatically:

```typescript
// From apple.strategy.ts
if (!email) {
  email = `${id}@privaterelay.appleid.com`;
}
```

Users with private relay emails:
- Can still log in
- Account is created with private relay email
- Should be prompted to verify/update their real email later

---

## Production Deployment

### Update Return URLs

Before deploying to production:

1. Go to [Services IDs](https://developer.apple.com/account/resources/identifiers/list)
2. Find your Services ID
3. Click **Configure**
4. Add production return URL:
   ```
   https://horacerta.com/auth/apple/callback
   ```
5. Save

### Update Environment Variables

Set production credentials in your deployment:

```bash
# Production .env
APPLE_TEAM_ID=your_production_team_id
APPLE_KEY_ID=your_production_key_id
APPLE_CLIENT_ID=com.horacerta.web
APPLE_PRIVATE_KEY=your_production_private_key
APPLE_CALLBACK_URL=https://horacerta.com/auth/apple/callback
```

### Enable in Frontend

Update your frontend login page:

```typescript
// frontend/src/pages/LoginPage.tsx
import { useAppleAuth } from '../hooks/useAuth';

export function LoginPage() {
  const { appleLogin } = useAppleAuth();

  return (
    <button onClick={() => appleLogin()}>
      Sign in with Apple
    </button>
  );
}
```

---

## Troubleshooting

### Error: "Invalid private key"

**Solution**:
- Ensure private key format includes BEGIN/END lines
- Check that newlines are properly escaped (`\n`)
- Verify no extra whitespace at beginning/end

### Error: "Key ID not found"

**Solution**:
- Verify Key ID matches the one in Apple Developer account
- Ensure key hasn't been revoked
- Check that Team ID is correct

### Error: "Callback URL not registered"

**Solution**:
- Go to Apple Developer account
- Find your Services ID
- Click **Configure**
- Add your callback URL to the authorized list
- Save changes

### User email is null

**Solution**:
- User may have chosen "Hide My Email"
- Strategy generates private relay email: `id@privaterelay.appleid.com`
- Prompt user to verify email later

### Not redirecting to frontend

**Solution**:
- Check `FRONTEND_URL` environment variable
- Ensure CORS is configured correctly
- Verify callback URL matches what's registered with Apple

---

## Security Considerations

1. **Private Key Protection**:
   - Never commit private key to git
   - Use .env or environment variables
   - Rotate keys periodically

2. **Token Validation**:
   - JWT tokens are validated by NestJS
   - 7-day expiration default
   - Consider refresh tokens for long sessions

3. **Email Verification**:
   - Trust Apple's email_verified flag
   - Users with private relay emails should verify later

4. **HTTPS Only**:
   - In production, require HTTPS
   - Apple won't allow insecure callbacks

---

## Next Steps

1. Test Apple Sign in in development
2. Deploy to staging environment
3. Update production Apple Developer config
4. Deploy to production
5. Monitor user sign-ups via Apple

---

## References

- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [Sign in with Apple Overview](https://developer.apple.com/sign-in-with-apple/)
- [Sign in with Apple Web Authentication Flow](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api)
- [Passport.js Apple Strategy](https://www.npmjs.com/package/passport-apple)

---

## Support

For issues:
1. Check Apple Developer account status
2. Verify credentials in .env
3. Review browser console for errors
4. Check backend logs: `npm run start:dev`
5. Consult [AUTH_IMPLEMENTATION.md](./AUTH_IMPLEMENTATION.md) for general auth setup
