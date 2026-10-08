
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import LogoutButton from "@/components/LogoutButton";

type Murid = {
  id: number | string;
  name: string;
  year: number;
  status: string;
};

type TasmikRecord = {
  id: number | string;
  student_id: number | string;
  date: string;
  type: string;
  volume: string | null;
  iqra: string | null;
  page: number;
  juz: number | null;
};

type JawiRecord = {
  id: number | string;
  student_id: number | string;
  date: string;
  page: number;
};

type RekodTerkini = {
  id: string;
  student_id: number | string;
  date: string;
  module: "Tasmik" | "Jawi";
  progress: string;
};

export default function DashboardPage() {
  const [murid, setMurid] = useState<Murid[]>([]);
  const [tasmik, setTasmik] = useState<TasmikRecord[]>([]);
  const [jawi, setJawi] = useState<JawiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      const [muridResult, tasmikResult, jawiResult] =
        await Promise.all([
          supabase.from("students").select("*"),
          supabase.from("tasmik_records").select("*"),
          supabase.from("jawi_records").select("*"),
        ]);

      if (
        muridResult.error ||
        tasmikResult.error ||
        jawiResult.error
      ) {
        setError("Gagal mendapatkan data daripada Supabase.");
        setLoading(false);
        return;
      }

      setMurid((muridResult.data ?? []) as Murid[]);
      setTasmik((tasmikResult.data ?? []) as TasmikRecord[]);
      setJawi((jawiResult.data ?? []) as JawiRecord[]);
      setLoading(false);
    }

    void loadData();
  }, []);

  const namaMurid = (id: number | string) => {
    return (
      murid.find((item) => String(item.id) === String(id))
        ?.name ?? "Murid tidak ditemui"
    );
  };

  const formatTasmik = (record: TasmikRecord) => {
    if (record.type?.toLowerCase().includes("quran")) {
      return `Al-Quran - Juz ${record.juz ?? "-"}, MS ${record.page}`;
    }

    return `${record.volume ?? "Iqra"} - ${
      record.iqra ?? ""
    }, MS ${record.page}`;
  };

  const rekodTerkini: RekodTerkini[] = [
    ...tasmik.map((record) => ({
      id: `tasmik-${record.id}`,
      student_id: record.student_id,
      date: record.date,
      module: "Tasmik" as const,
      progress: formatTasmik(record),
    })),
    ...jawi.map((record) => ({
      id: `jawi-${record.id}`,
      student_id: record.student_id,
      date: record.date,
      module: "Jawi" as const,
      progress: `Cilik Celik Jawi - MS ${record.page}`,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  const jumlahMurid = murid.length;
  const jumlahTasmik = tasmik.length;
  const jumlahJawi = jawi.length;
  const jumlahRekod = jumlahTasmik + jumlahJawi;

  const menu = [
    {
      title: "Dashboard",
      description: "Ringkasan sistem",
      icon: "🏠",
      href: "/",
      color: "bg-slate-800",
    },
    {
      title: "Rekod Tasmik",
      description: "Iqra dan Al-Quran",
      icon: "📖",
      href: "/tasmik",
      color: "bg-blue-700",
    },
    {
      title: "Rekod Jawi",
      description: "Cilik Celik Jawi",
      icon: "✍️",
      href: "/jawi",
      color: "bg-emerald-700",
    },
    {
      title: "Senarai Murid",
      description: "Pengurusan murid",
      icon: "👨‍🎓",
      href: "/murid",
      color: "bg-violet-700",
    },
    {
      title: "Laporan",
      description: "Semak dan cetak laporan",
      icon: "📊",
      href: "/laporan",
      color: "bg-amber-700",
    },
    {
      title: "Analisis Kemajuan",
      description: "Statistik dan perkembangan bacaan murid",
      icon: "📈",
      href: "/analisis",
      color: "bg-cyan-700",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-black sm:px-6">
      <div className="mx-auto max-w-6xl">

        {/* TAJUK DAN BUTANG LOG KELUAR */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              SISTEM REKOD PENDIDIKAN ISLAM
            </h1>

            <p className="mt-2 text-slate-600">
              Rekod Tasmik dan Jawi
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Guru Pendidikan Islam: RAZEEN BIN RAHMAN
            </p>
          </div>

          <LogoutButton />
        </div>

        {/* MENU UTAMA */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-slate-800">
            Menu Utama
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {menu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${item.color} rounded-2xl p-6 text-white shadow-md transition hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="text-4xl">{item.icon}</div>

                <h3 className="mt-4 text-xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-gray-200">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* RINGKASAN STATISTIK */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-slate-800">
            Ringkasan Rekod
          </h2>

          {loading ? (
            <div className="rounded-xl bg-white p-6 text-slate-600">
              Sedang mendapatkan data...
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-6 text-red-700">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                {
                  label: "Jumlah Murid",
                  value: jumlahMurid,
                  icon: "👨‍🎓",
                },
                {
                  label: "Rekod Tasmik",
                  value: jumlahTasmik,
                  icon: "📖",
                },
                {
                  label: "Rekod Jawi",
                  value: jumlahJawi,
                  icon: "✍️",
                },
                {
                  label: "Jumlah Semua Rekod",
                  value: jumlahRekod,
                  icon: "📊",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <div className="text-3xl">{item.icon}</div>

                  <p className="mt-3 text-sm text-slate-600">
                    {item.label}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* BILANGAN MURID MENGIKUT TAHUN */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold text-slate-800">
            Bilangan Murid Mengikut Tahun
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((tahun) => {
              const jumlah = murid.filter(
                (item) => Number(item.year) === tahun
              ).length;

              return (
                <div
                  key={tahun}
                  className="rounded-xl bg-white p-5 text-center shadow-sm"
                >
                  <p className="font-semibold text-slate-700">
                    Tahun {tahun}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-blue-700">
                    {jumlah}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Murid
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* REKOD TERKINI */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-slate-800">
            Rekod Terkini
          </h2>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {loading ? (
              <p className="p-6 text-slate-600">
                Sedang memuatkan rekod...
              </p>
            ) : error ? (
              <p className="p-6 text-red-600">{error}</p>
            ) : rekodTerkini.length === 0 ? (
              <p className="p-6 text-slate-500">
                Belum ada rekod Tasmik atau Jawi.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-4">Tarikh</th>
                      <th className="p-4">Nama Murid</th>
                      <th className="p-4">Modul</th>
                      <th className="p-4">Kemajuan</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rekodTerkini.map((record) => (
                      <tr
                        key={record.id}
                        className="border-t border-slate-200"
                      >
                        <td className="p-4">
                          {record.date}
                        </td>

                        <td className="p-4 font-medium">
                          {namaMurid(record.student_id)}
                        </td>

                        <td className="p-4">
                          {record.module}
                        </td>

                        <td className="p-4">
                          {record.progress}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-6 text-center text-sm text-slate-500">
          Sistem Rekod Pendidikan Islam
          <br />
          Guru Pendidikan Islam: RAZEEN BIN RAHMAN
        </footer>
      </div>
    </main>
  );
}
