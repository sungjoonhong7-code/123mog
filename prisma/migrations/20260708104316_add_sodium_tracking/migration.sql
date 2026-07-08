-- AlterTable
ALTER TABLE "Food" ADD COLUMN "sodiumPer100g" REAL;

-- AlterTable
ALTER TABLE "MealItem" ADD COLUMN "totalSodium" REAL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "sodiumTarget" REAL;
