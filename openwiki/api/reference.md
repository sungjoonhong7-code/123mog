# API Reference

## Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Food
- `GET /api/foods` - List foods
- `POST /api/foods` - Create custom food

### Meals
- `GET /api/meals` - List user's meals
- `POST /api/meals` - Create meal
- `GET /api/meals/export` - Export as CSV
- `GET /api/meals/stats` - Get meal statistics

### User
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile

## Implementation

All API routes use:
- Next.js Route Handlers
- Prisma for database access
- Middleware for auth/protection

Key files:
- `/src/app/api/**/route.ts`
- `/src/middleware.ts`
- `/src/lib/auth.ts`