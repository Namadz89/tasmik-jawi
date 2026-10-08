"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const result = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (result.error) {
      setError("Email atau kata laluan tidak betul.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">

          <div className="text-center mb-8">
            <div className="text-5xl mb-3">
              📖
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              Rekod Tasmik & Jawi
            </h1>

            <p className="text-slate-500 mt-2">
              Log masuk sebagai Guru Pendidikan Islam
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email MOE anda"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-black placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Kata Laluan
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan kata laluan"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-black placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Sedang log masuk..." : "Log Masuk"}
            </button>

          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Guru Pendidikan Islam
            <br />
            RAZEEN BIN RAHMAN
          </div>

        </div>
      </div>
    </main>
  );
}