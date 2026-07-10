# Dashboard Architecture

## Components

- **SummaryCards**: Shows daily macro totals (calories, protein, carbs, fat)
- **MacroChart**: Visualizes macro distribution
- **MealList**: Displays logged meals with health tags
- **DateNav**: Date selection controls
- **TrendChart**: Shows nutrient trends over time

## Data Flow

1. User selects date in DateNav
2. API fetches meal data for selected date
3. Components receive data through props
4. SummaryCards/MacroChart recalculate based on meals

Key files:
- `/src/components/dashboard/*`
- `/src/app/dashboard/page.tsx`
- `/src/lib/mealItems.ts`