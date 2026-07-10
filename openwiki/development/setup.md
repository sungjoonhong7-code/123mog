# Development Setup

## Requirements

- Node.js 18+
- PostgreSQL
- npm/yarn

## First-Time Setup

1. Clone repository
2. Install dependencies:
```bash
npm install
```
3. Copy `.env.example` to `.env` and configure
4. Initialize database:
```bash
npx prisma migrate dev
npx prisma generate
```
5. Start dev server:
```bash
npm run dev
```

## Scripts

- `dev`: Start development server
- `build`: Production build
- `lint`: Run ESLint
- `test`: Run Vitest

## Data Import Tools

See `/prisma/import-*.ts` for food database scripts