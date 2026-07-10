# Data Models

## Prisma Schema

Key entities:

### User
- Authentication details
- Profile information
- Food/meal relationships

### Food
- Basic nutritional info
- Health tags (sodium, sugar, LDL)
- Serving sizes

### Meal
- Timestamp
- Associated foods
- Total nutrition values

## Database Setup

1. Run migrations:
```bash
npx prisma migrate dev
```

2. Seed development data:
```bash
npx prisma db seed
```

Key files:
- `/prisma/schema.prisma`
- `/prisma/seed.ts`