"use client";

import { useState } from "react";
import MacroChart from "@/components/dashboard/MacroChart";
import TrendChart from "@/components/dashboard/TrendChart";
import { useT } from "@/lib/LangContext";

export default function ChartsToggle({
  protein,
  fat,
  carbs,
  meals,
}: {
  protein: number;
  fat: number;
  carbs: number;
  meals: { mealType: string; totalCalories: number }[];
}) {
  const { t } = useT();
  const [open, setOpen] = useState(true);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="mb-3 text-sm font-medium text-emerald-600 hover:underline"
      >
        {open ? t.dashboard.hideCharts : t.dashboard.showCharts}
      </button>
      {open && (
        <>
          <MacroChart protein={protein} fat={fat} carbs={carbs} meals={meals} />
          <div className="mt-6">
            <TrendChart />
          </div>
        </>
      )}
    </div>
  );
}
