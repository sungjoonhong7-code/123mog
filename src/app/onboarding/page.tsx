"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/LangContext";

export default function OnboardingPage() {
  const { t } = useT();
  const router = useRouter();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [saving, setSaving] = useState(false);

  const finish = async (skip = false) => {
    setSaving(true);
    if (skip) {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingDone: true }),
      });
      router.push("/dashboard");
      return;
    }
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age: parseInt(age) || null,
        gender: gender || null,
        height: parseFloat(height) || null,
        weight: parseFloat(weight) || null,
        goalWeight: parseFloat(goalWeight) || null,
        activityLevel: activityLevel || null,
        onboardingDone: true,
      }),
    });
    setSaving(false);
    if (res.ok) router.push("/dashboard");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md card p-8 space-y-4">
        <div className="text-center">
          <span className="text-4xl">🎯</span>
          <h1 className="text-2xl font-bold mt-3">{t.onboarding.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{t.onboarding.desc}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder={t.profile.age}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="input-field"
          />
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field">
            <option value="">{t.common.select}</option>
            <option value="male">{t.profile.male}</option>
            <option value="female">{t.profile.female}</option>
          </select>
          <input
            type="number"
            placeholder={t.profile.height}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder={t.profile.weight}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="input-field"
          />
        </div>
        <input
          type="number"
          placeholder={t.profile.goalWeight}
          value={goalWeight}
          onChange={(e) => setGoalWeight(e.target.value)}
          className="input-field"
        />
        <select
          value={activityLevel}
          onChange={(e) => setActivityLevel(e.target.value)}
          className="input-field"
        >
          <option value="sedentary">{t.profile.activitySedentary}</option>
          <option value="light">{t.profile.activityLight}</option>
          <option value="moderate">{t.profile.activityModerate}</option>
          <option value="active">{t.profile.activityActive}</option>
          <option value="very_active">{t.profile.activityVeryActive}</option>
        </select>
        <button
          onClick={() => finish(false)}
          disabled={saving || !age || !gender || !height || !weight}
          className="w-full btn-primary"
        >
          {t.onboarding.done}
        </button>
        <button
          onClick={() => finish(true)}
          disabled={saving}
          className="w-full text-sm text-gray-500 hover:underline"
        >
          {t.onboarding.skip}
        </button>
      </div>
    </div>
  );
}
