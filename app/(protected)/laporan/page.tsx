"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Murid = {
  id: string;
  name: string;
  year: number;
  status: string | null;
};

type TasmikRecord = {
  id: string;
  student_id: string;
  date: string;
  type: string;
  volume: string | null;
  iqra: string | null;
  page: number;
  juz: number | null;
};

type JawiRecord = {
  id: string;
  student_id: string;
  date: string;
  page: number;
};

function formatTarikh(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function labelTasmik(item: TasmikRecord) {
  if (item.type === "Al-Quran") {
    return `Al-Quran — Juz ${item.juz ?? "-"} — MS ${item.page}`;
  }
  return `${item.volume ?? "Iqra"} — ${item.iqra ?? ""} — MS ${item.page}`;
}

export default function LaporanPage() {
  const [murid, setMurid] = useState<Murid[]>([]);
  const [tasmik, setTasmik] = useState<TasmikRecord[]>([]);
  const [jawi, setJawi] = useState<JawiRecord[]>([]);
  const [tahun, setTahun] = useState("Semua");
  const [muridId, setMuridId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function ambilData() {
      const [muridRes, tasmikRes, jawiRes] = await Promise.all([
        supabase.from("students").select("*").order("year").order("name"),
        supabase.from("tasmik_records").select("*").order("date", { ascending: false }),
        supabase.from("jawi_records").select("*").order("date", { ascending: false }),
      ]);

      if (!active) return;
      const error = muridRes.error || tasmikRes.error || jawiRes.error;
      if (error) {
        console.error(error);
        setMessage("Gagal mengambil data laporan. Sila semak sambungan dan log masuk.");
      } else {
        setMurid(muridRes.data ?? []);
        setTasmik(tasmikRes.data ?? []);
        setJawi(jawiRes.data ?? []);
      }
      setLoading(false);
    }

    void ambilData();
    return () => { active = false; };
  }, []);

  const pilihanMurid = useMemo(
    () => murid.filter((item) => tahun === "Semua" || String(item.year) === tahun),
    [murid, tahun]
  );

  const muridDipilih = murid.find((item) => item.id === muridId);
  const rekodTasmik = useMemo(
    () => tasmik.filter((item) => item.student_id === muridId),
    [tasmik, muridId]
  );
  const rekodJawi = useMemo(
    () => jawi.filter((item) => item.student_id === muridId),
    [jawi, muridId]
  );

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 text-black print:bg-white print:p-0">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 rounded-2xl bg-white p-6 shadow print:mb-2 print:shadow-none">
          <a href="/" className="text-sm font-semibold text-blue-600 hover:underline print:hidden">
            ← Kembali ke Dashboard
          </a>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 print:mt-0">
            <div>
              <h1 className="text-3xl font-bold">Laporan Individu Murid</h1>
              <p className="mt-2 text-gray-600 print:hidden">Rekod kemajuan Tasmik dan Jawi.</p>
            </div>
            <button
              type="button"
              disabled={!muridDipilih || loading || Boolean(message)}
              onClick={() => window.print()}
              className="rounded-lg bg-gray-800 px-5 py-3 font-bold text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50 print:hidden"
            >
              Cetak / Simpan PDF
            </button>
          </div>
        </header>

        <section className="mb-6 rounded-2xl bg-white p-6 shadow print:hidden">
          <h2 className="mb-4 text-xl font-bold">Pilih Murid</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block font-semibold">
              Tahun
              <select
                value={tahun}
                onChange={(event) => { setTahun(event.target.value); setMuridId(""); }}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black"
              >
                <option value="Semua">Semua Tahun</option>
                {[1, 2, 3, 4, 5, 6].map((year) => (
                  <option key={year} value={String(year)}>Tahun {year}</option>
                ))}
              </select>
            </label>
            <label className="block font-semibold">
              Nama Murid
              <select
                value={muridId}
                onChange={(event) => setMuridId(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black"
              >
                <option value="">-- Pilih murid --</option>
                {pilihanMurid.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Tahun {item.year})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {loading && <p className="rounded-xl bg-white p-6 text-center">Sedang mengambil data laporan...</p>}
        {message && <p className="rounded-xl bg-red-50 p-6 text-red-700">{message}</p>}
        {!loading && !message && !muridDipilih && (
          <p className="rounded-xl bg-white p-6 text-center text-gray-600 print:hidden">
            Sila pilih seorang murid untuk melihat laporan individu.
          </p>
        )}

        {!loading && !message && muridDipilih && (
          <article className="rounded-2xl bg-white p-6 shadow print:rounded-none print:p-0 print:shadow-none">
            <div className="mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold">REKOD TASMIK DAN JAWI</h2>
              <p className="mt-1">Guru Pendidikan Islam: <strong>RAZEEN BIN RAHMAN</strong></p>
              <p className="mt-3"><strong>Nama:</strong> {muridDipilih.name}</p>
              <p><strong>Tahun:</strong> {muridDipilih.year}</p>
              <p><strong>Status:</strong> {muridDipilih.status || "-"}</p>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-blue-50 p-4 print:border print:border-gray-300 print:bg-white">
                <h3 className="font-bold text-blue-900 print:text-black">Tasmik Terkini</h3>
                {rekodTasmik.length ? (
                  <>
                    <p className="mt-2 font-semibold">{labelTasmik(rekodTasmik[0])}</p>
                    <p className="text-sm">{formatTarikh(rekodTasmik[0].date)}</p>
                  </>
                ) : <p className="mt-2">Belum ada rekod.</p>}
                <p className="mt-2 text-sm">Jumlah rekod: {rekodTasmik.length}</p>
              </div>
              <div className="rounded-lg bg-green-50 p-4 print:border print:border-gray-300 print:bg-white">
                <h3 className="font-bold text-green-900 print:text-black">Jawi Terkini</h3>
                {rekodJawi.length ? (
                  <>
                    <p className="mt-2 font-semibold">Cilik Celik Jawi — MS {rekodJawi[0].page}</p>
                    <p className="text-sm">{formatTarikh(rekodJawi[0].date)}</p>
                  </>
                ) : <p className="mt-2">Belum ada rekod.</p>}
                <p className="mt-2 text-sm">Jumlah rekod: {rekodJawi.length}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 print:grid-cols-2">
              <section>
                <h3 className="mb-3 border-b pb-2 text-lg font-bold">Sejarah Tasmik</h3>
                {rekodTasmik.length === 0 ? <p className="text-sm text-gray-600">Tiada rekod.</p> : (
                  <div className="space-y-2">
                    {rekodTasmik.map((item) => (
                      <div key={item.id} className="break-inside-avoid rounded-lg border border-gray-200 p-3">
                        <p className="text-sm font-semibold">{labelTasmik(item)}</p>
                        <p className="text-xs text-gray-600">{formatTarikh(item.date)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              <section>
                <h3 className="mb-3 border-b pb-2 text-lg font-bold">Sejarah Jawi</h3>
                {rekodJawi.length === 0 ? <p className="text-sm text-gray-600">Tiada rekod.</p> : (
                  <div className="space-y-2">
                    {rekodJawi.map((item) => (
                      <div key={item.id} className="break-inside-avoid rounded-lg border border-gray-200 p-3">
                        <p className="text-sm font-semibold">Cilik Celik Jawi — MS {item.page}</p>
                        <p className="text-xs text-gray-600">{formatTarikh(item.date)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}
