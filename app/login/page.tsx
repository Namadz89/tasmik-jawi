
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
  const [success, setSuccess] = useState("");
  const [lupaPassword, setLupaPassword] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError("Email atau kata laluan tidak betul.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Ralat sambungan. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo:
              `${window.location.origin}/reset-password`,
          }
        );

      if (resetError) {
        setError(
          "Permintaan tidak berjaya. Sila cuba lagi sebentar."
        );
        return;
      }

      setSuccess(
        "Jika email ini berdaftar, pautan pemulihan kata laluan akan dihantar. Sila semak peti masuk dan folder Spam."
      );
    } catch {
      setError("Ralat sambungan. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 text-slate-900">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="border-b border-slate-100 px-6 py-7 text-center">
          <img
            src="/logo-sekolah.jpg"
            alt="Logo SK Kitou"
            className="mx-auto mb-4 h-28 w-28 object-contain"
          />

          <p className="text-xs font-bold tracking-wide text-blue-600">
            SISTEM REKOD PENDIDIKAN ISLAM
          </p>

          <h1 className="mt-2 text-xl font-extrabold leading-snug">
            SEKOLAH KEBANGSAAN KITOU,
            TAMBUNAN SABAH
          </h1>

          <p className="mt-2 text-sm font-semibold text-slate-600">
            XBA1229
          </p>

          <p className="mt-3 text-sm font-semibold italic text-blue-900">
            SK KITOU HEBAT, MEMBINA GENERASI GEMILANG
          </p>
        </div>

        <div className="px-6 py-7 sm:px-8">
          <h2 className="text-center text-2xl font-bold">
            {lupaPassword
              ? "Lupa Kata Laluan"
              : "Rekod Tasmik & Jawi"}
          </h2>

          <p className="mt-2 text-center text-sm text-slate-500">
            {lupaPassword
              ? "Masukkan email berdaftar untuk menerima pautan pemulihan."
              : "Log masuk sebagai Guru Pendidikan Islam"}
          </p>

          <form
            onSubmit={
              lupaPassword
                ? handleResetPassword
                : handleLogin
            }
            className="mt-7 space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Masukkan email anda"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {!lupaPassword && (
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold"
                >
                  Kata Laluan
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Masukkan kata laluan"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                role="status"
                className="rounded-lg bg-green-50 p-3 text-sm text-green-800"
              >
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Sila tunggu..."
                : lupaPassword
                ? "Hantar Pautan Pemulihan"
                : "Log Masuk"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setLupaPassword(!lupaPassword);
                setError("");
                setSuccess("");
              }}
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              {lupaPassword
                ? "← Kembali ke Log Masuk"
                : "Lupa Kata Laluan?"}
            </button>
          </div>
        </div>

        <footer className="bg-slate-50 px-6 py-5 text-center text-xs text-slate-500">
          Guru Pendidikan Islam
          <p className="mt-1 font-bold text-slate-800">
            RAZEEN BIN RAHMAN
          </p>
          <p className="mt-2">
            Sistem Rekod Tasmik dan Jawi
          </p>
        </footer>
      </div>
    </main>
  );
}
