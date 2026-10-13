
"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (result.error) {
        setError(
          "Email atau kata laluan tidak betul."
        );
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Ralat log masuk:", err);

      setError(
        "Tidak dapat menyambung ke sistem. Sila cuba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 text-slate-900">
      <div className="w-full max-w-lg">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">

          {/* IDENTITI SEKOLAH */}
          <header className="border-b border-slate-100 px-5 pb-6 pt-8 text-center sm:px-8">

            {/* LOGO SEKOLAH */}
            <div className="mb-5 flex justify-center">
              <Image
                src="/logo-sekolah.jpg"
                alt="Logo Sekolah Kebangsaan Kitou"
                width={130}
                height={130}
                priority
                className="h-auto w-28 object-contain sm:w-32"
              />
            </div>

            {/* NAMA SISTEM */}
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-700 sm:text-sm">
              SISTEM REKOD PENDIDIKAN ISLAM
            </p>

            {/* NAMA SEKOLAH */}
            <h1 className="text-xl font-extrabold leading-snug text-slate-900 sm:text-2xl">
              SEKOLAH KEBANGSAAN KITOU,
              <span className="block">
                TAMBUNAN SABAH
              </span>
            </h1>

            {/* KOD SEKOLAH - TANPA LABEL */}
            <p className="mt-2 text-sm font-semibold text-slate-600">
              XBA1229
            </p>

            {/* MOTTO SEKOLAH */}
            <p className="mt-3 text-sm font-bold italic leading-relaxed text-blue-900 sm:text-base">
              SK KITOU HEBAT, MEMBINA GENERASI GEMILANG
            </p>
          </header>

          {/* BORANG LOG MASUK */}
          <section className="px-5 py-7 sm:px-8">

            <div className="mb-7 text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                Rekod Tasmik &amp; Jawi
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Log masuk sebagai Guru Pendidikan Islam
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email MOE
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Masukkan email MOE anda"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-black placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
                />
              </div>

              {/* KATA LALUAN */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Kata Laluan
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Masukkan kata laluan"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-black placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
                />
              </div>

              {/* MESEJ RALAT */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {/* BUTANG LOG MASUK */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Sedang log masuk..."
                  : "Log Masuk"}
              </button>

            </form>
          </section>

          {/* MAKLUMAT GURU */}
          <footer className="border-t border-slate-100 bg-slate-50 px-5 py-5 text-center">

            <p className="text-xs text-slate-500">
              Guru Pendidikan Islam
            </p>

            <p className="mt-1 text-sm font-bold text-slate-700">
              RAZEEN BIN RAHMAN
            </p>

            <p className="mt-3 text-xs text-slate-400">
              Sistem Rekod Tasmik dan Jawi
            </p>

          </footer>

        </div>
      </div>
    </main>
  );
}
