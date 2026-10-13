
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (!active) return;

        if (event === "PASSWORD_RECOVERY") {
          setAuthorized(true);
          setChecking(false);
          setError("");
        }
      }
    );

    async function checkRecoveryLink() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw exchangeError;
          }

          if (active) setAuthorized(true);
        } else if (tokenHash && type === "recovery") {
          const { error: verifyError } =
            await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: "recovery",
            });

          if (verifyError) {
            throw verifyError;
          }

          if (active) setAuthorized(true);
        } else if (
          window.location.hash.includes("access_token=") &&
          window.location.hash.includes("type=recovery")
        ) {
          const { data, error: sessionError } =
            await supabase.auth.getSession();

          if (sessionError || !data.session) {
            throw new Error("Sesi pemulihan tidak sah.");
          }

          if (active) setAuthorized(true);
        }
      } catch {
        if (active) {
          setError(
            "Pautan pemulihan tidak sah atau telah tamat tempoh. Sila mohon pautan baharu."
          );
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    void checkRecoveryLink();

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Kata laluan mesti sekurang-kurangnya 8 aksara.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Pengesahan kata laluan tidak sepadan.");
      return;
    }

    if (!authorized) {
      setError("Sesi pemulihan tidak sah.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        setError(
          "Gagal mengemas kini kata laluan. Sila cuba lagi atau mohon pautan baharu."
        );
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");

      await supabase.auth.signOut();
    } catch {
      setError("Ralat sambungan. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 text-slate-900">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-lg">
        <header className="border-b border-slate-100 px-6 py-7 text-center">
          <img
            src="/logo-sekolah.jpg"
            alt="Logo SK Kitou"
            className="mx-auto mb-4 h-24 w-24 object-contain"
          />

          <p className="text-xs font-bold text-blue-600">
            SISTEM REKOD PENDIDIKAN ISLAM
          </p>

          <h1 className="mt-2 text-xl font-extrabold">
            SEKOLAH KEBANGSAAN KITOU,
            TAMBUNAN SABAH
          </h1>

          <p className="mt-2 text-sm font-semibold text-slate-600">
            XBA1229
          </p>
        </header>

        <section className="px-6 py-8 sm:px-8">
          <h2 className="text-center text-2xl font-bold">
            Tetapkan Kata Laluan Baharu
          </h2>

          {checking ? (
            <p className="mt-6 text-center text-sm text-slate-600">
              Sedang mengesahkan pautan pemulihan...
            </p>
          ) : success ? (
            <div className="mt-6 space-y-5">
              <p
                role="status"
                className="rounded-xl bg-green-50 p-4 text-center text-sm text-green-800"
              >
                Kata laluan berjaya dikemas kini.
                Sila log masuk menggunakan kata laluan baharu.
              </p>

              <Link
                href="/login"
                className="block rounded-xl bg-blue-600 px-4 py-3 text-center font-bold text-white"
              >
                Kembali ke Log Masuk
              </Link>
            </div>
          ) : !authorized ? (
            <div className="mt-6 space-y-5">
              <p
                role="alert"
                className="rounded-xl bg-amber-50 p-4 text-center text-sm text-amber-900"
              >
                {error ||
                  "Sila buka pautan pemulihan yang dihantar ke email anda."}
              </p>

              <Link
                href="/login"
                className="block rounded-xl bg-blue-600 px-4 py-3 text-center font-bold text-white"
              >
                Kembali ke Log Masuk
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-semibold"
                >
                  Kata Laluan Baharu
                </label>

                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Sekurang-kurangnya 8 aksara"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-semibold"
                >
                  Sahkan Kata Laluan Baharu
                </label>

                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Masukkan semula kata laluan"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(event) =>
                    setShowPassword(event.target.checked)
                  }
                />
                Paparkan kata laluan
              </label>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? "Sedang menyimpan..."
                  : "Simpan Kata Laluan Baharu"}
              </button>
            </form>
          )}
        </section>

        <footer className="bg-slate-50 p-5 text-center text-xs text-slate-500">
          Sistem Rekod Tasmik dan Jawi
          <p className="mt-1 font-semibold">
            SEKOLAH KEBANGSAAN KITOU
          </p>
        </footer>
      </div>
    </main>
  );
}
