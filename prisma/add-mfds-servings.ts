// Additive fix-up: the MFDS bulk import (import-mfds-foods.ts) only had a
// generic "g" unit for each food since the source spreadsheet's per-serving
// reference amount column was empty. It does have a "식품중량" (product/
// analysis weight) column though, so add that as a "인분" (portion) serving
// on top of the existing "g" one. Never deletes or modifies existing data.
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import fs from 'fs'
import path from 'path'

const adapter = new PrismaLibSql({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const dataPath = path.join(__dirname, 'data', 'mfds-servings.json')
  const servingsByName: Record<string, number> = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  let added = 0
  let skippedNotFound = 0
  let skippedAlreadyHasServing = 0

  for (const [name, grams] of Object.entries(servingsByName)) {
    const food = await prisma.food.findFirst({
      where: { name },
      include: { servings: true },
    })
    if (!food) {
      skippedNotFound++
      continue
    }
    const hasNonGramServing = food.servings.some((s) => s.unitName !== 'g')
    if (hasNonGramServing) {
      skippedAlreadyHasServing++
      continue
    }
    await prisma.foodServing.create({
      data: { foodId: food.id, unitName: '인분', gramsPerUnit: grams },
    })
    added++
  }

  console.log(`Added ${added} servings, skipped ${skippedNotFound} (not found), ${skippedAlreadyHasServing} (already had a serving).`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
