# Frontend API Configuration & Setup

**Date**: Feb 27, 2026
**Status**: ✅ Complete Configuration

---

## Current Setup ✅

Your frontend is **already properly configured** to call the backend with `/api` prefix!

### How It Works

```
Frontend Request
    ↓
axios instance (config/api.ts)
    ↓
baseURL: /api (defaults to this)
    ↓
Request to /api/users/profile
    ↓
(Dev) Vite proxy → http://localhost:3001/users/profile
(Prod) Nginx → http://localhost:3001/users/profile
```

---

## Key Files

### 1. **API Configuration** ✅
**File**: `frontend/src/config/api.ts`

```typescript
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,  // ← Adds /api prefix
});

// Automatically adds JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. **Vite Proxy Configuration** ✅
**File**: `frontend/vite.config.ts`

```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: process.env.VITE_API_URL || 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
    },
  },
},
```

This means:
- **In Development** (`npm run dev`):
  - `/api/users/profile` → `http://localhost:3001/users/profile`
- **In Production** (via Nginx):
  - `/api/users/profile` → Nginx routes to backend

---

## Environment Variables

### Development
**No .env file needed!** Defaults work perfectly:
```
VITE_API_URL not set → defaults to '/api'
Port: 5173
Proxy target: http://localhost:3001
```

### Production
Create `.env.production` to override:

```bash
# .env.production
VITE_API_URL=https://api.horacerta.com
```

Or keep default `/api` and let Nginx handle routing (recommended).

---

## How to Call the Backend

### ✅ **Correct Way** (Already Implemented)

**Using the api module** (in hooks/components):

```typescript
import api from '../config/api';

// GET request
const { data } = await api.get('/users/profile');
// → Sends: GET /api/users/profile

// POST request
const { data } = await api.post('/tenants', {
  slug: 'my-shop',
  name: 'My Shop',
});
// → Sends: POST /api/tenants

// PATCH request
const { data } = await api.patch('/users/profile', {
  name: 'Updated Name',
});
// → Sends: PATCH /api/users/profile

// DELETE request
await api.delete(`/tenants/${tenantId}/staff/${staffId}`);
// → Sends: DELETE /api/tenants/{tenantId}/staff/{staffId}
```

**With React Query** (in hooks):

```typescript
import { useQuery } from '@tanstack/react-query';
import api from '../config/api';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/users/profile');
      return data;
    },
  });
};
```

---

## ❌ **Wrong Ways** (Don't Do This)

### ❌ Direct fetch without /api prefix
```typescript
// WRONG
fetch('/users/profile')  // Won't work in production!
```

### ❌ Direct fetch with hardcoded URL
```typescript
// WRONG
fetch('http://localhost:3001/users/profile')  // Only works locally!
```

### ❌ Not using the api module
```typescript
// WRONG
axios.get('/users/profile')  // Bypasses token interceptor!
```

---

## All Available Endpoints

### Auth
```
GET  /auth/google                      # OAuth login
GET  /auth/google/callback             # OAuth callback
POST /auth/apple                       # Apple OAuth
POST /auth/apple/callback              # Apple callback
GET  /auth/profile                     # Get current user (protected)
```

### Users
```
GET  /users/profile                    # Get profile
PATCH /users/profile                   # Update profile
GET  /users/{id}                       # Get user by ID
```

### Tenants (Shops)
```
POST /tenants                          # Create shop
GET  /tenants                          # Get my shops
GET  /tenants/{id}                     # Get shop details
PATCH /tenants/{id}                    # Update shop
```

### Tenants - Staff
```
POST   /tenants/{id}/staff             # Add staff
GET    /tenants/{id}/staff             # List staff
PATCH  /tenants/{id}/staff/{id}/role   # Change role
DELETE /tenants/{id}/staff/{id}        # Remove staff
```

### Appointments
```
POST   /appointments                   # Book appointment
GET    /appointments                   # List appointments
GET    /appointments/{id}              # Get appointment
PATCH  /appointments/{id}/status       # Update status
PATCH  /appointments/{id}              # Reschedule
DELETE /appointments/{id}              # Cancel
```

### Payments
```
GET    /payments                       # List payments
POST   /payments                       # Process payment
GET    /payments/{id}                  # Get payment details
```

---

## Example: Create Shop from Frontend

### 1. Create the Hook

**File**: `frontend/src/hooks/useShops.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../config/api';

export const useCreateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shopData) => {
      const { data } = await api.post('/tenants', shopData);
      return data;
    },
    onSuccess: () => {
      // Invalidate shops list to refetch
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
};

export const useMyShops = () => {
  return useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data } = await api.get('/tenants');
      return data;
    },
  });
};
```

### 2. Use in Component

**File**: `frontend/src/pages/CreateShopPage.tsx`

```typescript
import { useState } from 'react';
import { useCreateShop } from '../hooks/useShops';

export function CreateShopPage() {
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [pixKey, setPixKey] = useState('');

  const createShop = useCreateShop();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // This automatically:
    // 1. Adds '/api' prefix
    // 2. Adds Authorization header with JWT
    // 3. Sends POST request
    await createShop.mutateAsync({
      slug,
      name,
      address,
      phone,
      pix_key: pixKey,
    });

    // Handle success
    if (createShop.isSuccess) {
      navigate(`/shop/${createShop.data.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />
      <input
        placeholder="Shop Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {/* More fields... */}
      <button type="submit" disabled={createShop.isPending}>
        {createShop.isPending ? 'Creating...' : 'Create Shop'}
      </button>
      {createShop.isError && (
        <p className="error">{createShop.error.response.data.message}</p>
      )}
    </form>
  );
}
```

---

## Request Flow Diagram

### Development Flow
```
React Component
        ↓
useCreateShop() hook
        ↓
api.post('/tenants', {...})
        ↓
axios creates request:
  POST /api/tenants
  Authorization: Bearer TOKEN
  Content-Type: application/json
        ↓
Vite dev server (port 5173)
        ↓
Vite proxy intercepts /api requests
        ↓
Proxies to http://localhost:3001/tenants
        ↓
NestJS backend processes request
        ↓
Returns response to frontend
        ↓
React component updates state
```

### Production Flow
```
React Component
        ↓
useCreateShop() hook
        ↓
api.post('/tenants', {...})
        ↓
axios creates request:
  POST /api/tenants
  Authorization: Bearer TOKEN
  Content-Type: application/json
        ↓
Browser sends to Nginx (same origin)
        ↓
Nginx routes /api/* to backend:3001/*
        ↓
NestJS backend processes request
        ↓
Returns response
        ↓
React component updates state
```

---

## Testing API Calls

### 1. Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Make a request
4. Click on request
5. Verify:
   - ✅ URL shows `/api/...`
   - ✅ Authorization header present
   - ✅ Status is 2xx (success) or expected error

### 2. Test in Console

```javascript
// In browser console:

// Get current token
localStorage.getItem('token')

// Make test request
fetch('/api/users/profile', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
}).then(r => r.json()).then(console.log)
```

### 3. Watch API Configuration
```javascript
// In browser console:
import api from './src/config/api'
console.log(api.defaults.baseURL)  // Should be '/api'
console.log(api.defaults.headers)  // Should have Authorization
```

---

## Common Issues & Fixes

### Issue 1: "Cannot find module ../config/api"
**Solution**: Make sure the import path is correct
```typescript
// Correct:
import api from '../config/api';

// Wrong:
import api from '@/config/api';  // If not using @ alias
import api from './config/api';  // Wrong relative path
```

### Issue 2: API calls not including token
**Solution**: Use the `api` module from config/api.ts, not plain axios
```typescript
// Wrong:
import axios from 'axios';
axios.get('/users/profile')  // No token!

// Correct:
import api from '../config/api';
api.get('/users/profile')  // Has token!
```

### Issue 3: 404 errors on API calls
**Solution**: Ensure `/api` prefix is being added
```javascript
// Check in Network tab:
// Should see: /api/users/profile
// Not: /users/profile
```

### Issue 4: CORS errors
**Solution**: CORS is handled by Nginx in production and Vite proxy in dev
- Dev: Vite proxy (`vite.config.ts` line 14-20)
- Prod: Nginx proxy (`frontend/default.conf`)

---

## Environment Setup for Different Environments

### Local Development
**No setup needed!** Just run:
```bash
npm run dev
# Automatically uses /api prefix and proxies to :3001
```

### Docker Development
**docker-compose.yml** already configured:
```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    # Vite dev server with proxy enabled
```

### Production (Nginx)
**frontend/default.conf** handles routing:
```nginx
location /api/ {
  proxy_pass http://backend:3001/;  # Strips /api
}

location / {
  root /usr/share/nginx/html;       # Serves SPA
}
```

---

## Checklist: API Integration

- [ ] Using `api` module from `config/api.ts` for all requests
- [ ] All requests include `/api/` prefix (handled by baseURL)
- [ ] Authorization header added automatically
- [ ] Using React Query for data fetching
- [ ] Error handling in place (catch 401, show login)
- [ ] Loading states while fetching
- [ ] Success/error messages to user
- [ ] No hardcoded URLs (use config)

---

## Quick Reference: API Module

```typescript
import api from '../config/api';

// GET
api.get('/endpoint')
api.get('/endpoint', { params: { key: 'value' } })

// POST
api.post('/endpoint', { data: 'value' })
api.post('/endpoint', data, { headers: { custom: 'header' } })

// PATCH
api.patch('/endpoint', { updates: 'here' })

// DELETE
api.delete('/endpoint')

// Error handling
api.get('/endpoint')
  .then(res => res.data)
  .catch(err => {
    if (err.response.status === 401) {
      // Handle auth error
    }
    throw err;
  })
```

---

## Next Steps

1. ✅ Review this guide
2. ✅ Verify all API calls use `api` module
3. ✅ Check Network tab to confirm `/api/` prefix
4. ⏭️ Build frontend pages for:
   - Create shop (`POST /tenants`)
   - List shops (`GET /tenants`)
   - Manage staff (`POST /tenants/{id}/staff`)
5. ⏭️ Test all endpoints with real data

---

## Support

**Files**:
- API Config: `frontend/src/config/api.ts`
- Vite Config: `frontend/vite.config.ts`
- Nginx Config: `frontend/default.conf` (production)

**Documentation**:
- [Backend API Reference](./TENANTS_API_REFERENCE.md)
- [Barber Shop Guide](./BARBER_SHOP_ONBOARDING.md)

---

## Summary

Your frontend is **already properly configured** to call the backend with the `/api` prefix!

✅ **API module** (config/api.ts) adds `/api` and JWT token
✅ **Vite proxy** (vite.config.ts) proxies to backend in dev
✅ **Nginx config** (default.conf) routes in production

**Just use**: `api.get('/users/profile')` and everything works! 🚀
