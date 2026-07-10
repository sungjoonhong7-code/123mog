# Authentication System

## Implementation

- NextAuth.js for session management
- JWT tokens for API protection
- Password hashing via bcrypt
- Per-user data isolation

## Flow

1. User registers via `/api/auth/register`
2. Credentials are hashed and stored
3. Subsequent logins create JWT session
4. All API routes verify session
5. Database queries filter by userId

Key security features:
- Rate limiting on auth endpoints
- CSRF protection
- Secure cookies

Key files:
- `/src/app/api/auth/**`
- `/src/middleware.ts`
- `/src/lib/auth.ts`