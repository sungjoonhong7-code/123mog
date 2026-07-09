"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useT } from "@/lib/LangContext";

function LoginForm() {
  const { t } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(t.login.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🥗</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4">{t.login.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{t.login.desc}</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          {registered && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-sm px-4 py-3 rounded-lg">
              {t.login.registered}
            </div>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t.login.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="input-field"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t.login.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary">
            {loading ? t.login.loading : t.login.submit}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t.login.noAccount}{" "}
            <Link href="/register" className="text-emerald-600 hover:underline font-medium">
              {t.login.signUp}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
