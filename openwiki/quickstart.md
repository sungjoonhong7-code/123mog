# 123MOG - Diet Tracker

## Overview

123MOG is a nutrition tracking application that helps users:
- Log meals and foods
- Track macronutrients and health metrics
- Get insights through dashboard visualizations
- Maintain data privacy
- Support multiple languages

Key features:
- Singapore-focused food database
- Health tags (sodium, sugar, LDL tracking)
- Dark mode
- PWA support
- CSV export

## Quick Links

- [Dashboard Components](/architecture/dashboard.md)
- [API Endpoints](/api/reference.md)
- [Data Models](/data-models/schema.md)
- [Authentication](/authentication/flow.md)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up database:
```bash
npx prisma migrate dev
npx prisma generate
```

3. Configure environment (copy from .env.example)

4. Run development server:
```bash
npm run dev
```

## Tech Stack

- Next.js 14
- Prisma (PostgreSQL)
- NextAuth
- React charts
- i18n

See [Development](/development/setup.md) for more details.