# Quick API Checklist ⚡

**Use this checklist when making API calls from the frontend**

---

## Before You Code

- [ ] Backend is running: `npm run start:dev` (port 3001)
- [ ] Frontend is running: `npm run dev` (port 5173)
- [ ] You have a valid JWT token in `localStorage.getItem('token')`

---

## Making API Calls

### ✅ The Right Way

```typescript
import api from '../config/api';

// Every request automatically gets:
// - /api prefix
// - Authorization: Bearer {token}
// - Content-Type: application/json

// GET
const { data } = await api.get('/users/profile');

// POST
const { data } = await api.post('/tenants', {
  slug: 'my-shop',
  name: 'My Shop',
});

// PATCH
const { data } = await api.patch('/users/profile', {
  name: 'Updated Name',
});

// DELETE
await api.delete(`/tenants/${id}/staff/${memberId}`);
```

### ✅ With React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../config/api';

// Fetch data
export const useShops = () => {
  return useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data } = await api.get('/tenants');
      return data;
    },
  });
};

// Mutate data
export const useCreateShop = () => {
  return useMutation({
    mutationFn: async (shopData) => {
      const { data } = await api.post('/tenants', shopData);
      return data;
    },
  });
};
```

### ✅ With Error Handling

```typescript
try {
  const { data } = await api.post('/tenants', shopData);
  console.log('Shop created:', data);
} catch (error) {
  if (error.response?.status === 400) {
    console.error('Validation error:', error.response.data.message);
  } else if (error.response?.status === 409) {
    console.error('Conflict:', error.response.data.message);
  } else {
    console.error('Error:', error.message);
  }
}
```

---

## Endpoint Quick Reference

### Create Shop
```typescript
api.post('/tenants', {
  slug: 'joao-silva',
  name: 'João Silva Barbearia',
  address: 'Rua das Flores, 123',
  phone: '+5511999999999',
  pix_key: 'joao@example.com',
})
```

### Get My Shops
```typescript
api.get('/tenants')
```

### Get Shop Details
```typescript
api.get('/tenants/{tenantId}')
```

### Update Shop
```typescript
api.patch('/tenants/{tenantId}', {
  name: 'Updated Name',
  phone: '+5511988888888',
})
```

### Add Staff Member
```typescript
api.post('/tenants/{tenantId}/staff', {
  email: 'barber@example.com',
  role: 'BARBER',  // BARBER, RECEPTIONIST, MANAGER
})
```

### Get Staff List
```typescript
api.get('/tenants/{tenantId}/staff')
```

### Update Staff Role
```typescript
api.patch('/tenants/{tenantId}/staff/{tenantUserId}/role', {
  role: 'MANAGER',
})
```

### Remove Staff
```typescript
api.delete('/tenants/{tenantId}/staff/{tenantUserId}')
```

---

## Debug: Verify Setup

Open browser console and run:

```javascript
// Check 1: Is token set?
console.log('Token:', localStorage.getItem('token') ? 'YES' : 'NO');

// Check 2: Is API configured?
import('./src/config/api.ts').then(m => {
  console.log('API baseURL:', m.api.defaults.baseURL);  // Should be /api
});

// Check 3: Test API call
fetch('/api/users/profile', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e));
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | No token or expired | Login again via OAuth |
| 404 Not Found | Wrong endpoint | Check endpoint spelling |
| 409 Conflict | Slug taken, user duplicate | Try different slug or email |
| 400 Bad Request | Invalid data | Check required fields |
| No response | Backend down | Start backend: `npm run start:dev` |

---

## Network Tab Checklist

1. Open DevTools (F12)
2. Go to Network tab
3. Make an API call
4. Click on request
5. Verify:
   - [ ] URL contains `/api/`
   - [ ] Status is 2xx or 401/404
   - [ ] Authorization header present
   - [ ] Response shows expected data

---

## Files to Reference

| Task | File |
|------|------|
| Making API calls | `frontend/src/config/api.ts` |
| Using in hooks | `frontend/src/hooks/useProfile.ts` (example) |
| Dev setup | `frontend/vite.config.ts` |
| Prod setup | `frontend/default.conf` |
| All endpoints | `TENANTS_API_REFERENCE.md` |

---

## ✅ You're Good If...

- [ ] All API calls use `api.get()`, `api.post()`, etc.
- [ ] No hardcoded URLs like `http://localhost:3001`
- [ ] No plain `fetch()` or `axios()` without the api module
- [ ] Network tab shows `/api/...` URLs
- [ ] Authorization header is present in requests
- [ ] Requests work in both dev (npm run dev) and prod

---

## TL;DR

```typescript
// ✅ Always use this:
import api from '../config/api';
api.get('/users/profile')

// ❌ Never use this:
fetch('/users/profile')
axios.get('/users/profile')
fetch('http://localhost:3001/users/profile')
```

That's it! Everything else is automatic! 🚀
