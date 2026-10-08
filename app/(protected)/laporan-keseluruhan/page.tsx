"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Murid = { id: number | string; name: string; year: number; status: string | null };
type Tasmik = { id: number | string; student_id: number | string; date: string; type: string; volume: string | null; iqra: string | null; page: number; juz: number | null };
type Jawi = { id: number | string; student_id: number | string; date: string; page: number };

function formatTasmik(item: Tasmik): string {
  if (item.type?.toLowerCase().includes("quran")) {
    return `Al-Quran — Juz ${item.juz ?? "-"}, MS ${item.page}`;
  }
  return `${item.volume ?? "Iqra"}${item.iqra ? ` — ${item.iqra}` : ""}, MS ${item.page}`;
}

function formatTarikh(value: string | undefined): string {
  if (!value) return "—";
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export default function LaporanKeseluruhanPage() {
  const [murid, setMurid] = useState<Murid[]>([]);
  const [tasmik, setTasmik] = useState<Tasmik[]>([]);
  const [jawi, setJawi] = useState<Jawi[]>([]);
  const [tahun, setTahun] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [a, b, c] = await Promise.all([
          supabase.from("students").select("*").order("name"),
          supabase.from("tasmik_records").select("*").order("date", { ascending: false }),
          supabase.from("jawi_records").select("*").order("date", { ascending: false }),
        ]);
        if (a.error || b.error || c.error) throw new Error(a.error?.message || b.error?.message || c.error?.message || "Gagal mendapatkan data.");
        if (!active) return;
        setMurid((a.data ?? []) as Murid[]);
        setTasmik((b.data ?? []) as Tasmik[]);
        setJawi((c.data ?? []) as Jawi[]);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Ralat tidak diketahui.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const rows = useMemo(() => {
    const latestTasmik = new Map<string, Tasmik>();
    const latestJawi = new Map<string, Jawi>();
    for (const record of tasmik) {
      const key = String(record.student_id);
      if (!latestTasmik.has(key)) latestTasmik.set(key, record);
    }
    for (const record of jawi) {
      const key = String(record.student_id);
      if (!latestJawi.has(key)) latestJawi.set(key, record);
    }
    return murid
      .filter((m) => Number(m.year) === tahun)
      .sort((a, b) => a.name.localeCompare(b.name, "ms"))
      .map((m) => ({
        murid: m,
        tasmik: latestTasmik.get(String(m.id)),
        jawi: latestJawi.get(String(m.id)),
      }));
  }, [murid, tasmik, jawi, tahun]);

  const adaTasmik = rows.filter((r) => r.tasmik).length;
  const adaJawi = rows.filter((r) => r.jawi).length;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link href="/" className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-700 shadow-sm hover:bg-blue-50">← Kembali ke Dashboard</Link>
          <button type="button" onClick={() => window.print()} disabled={loading || !!error} className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50">🖨️ Cetak / Simpan PDF</button>
        </div>

        <header className="mb-6 rounded-2xl bg-white p-6 shadow-sm print:rounded-none print:p-0 print:shadow-none">
          <h1 className="text-2xl font-bold">LAPORAN KESELURUHAN MENGIKUT TAHUN</h1>
          <p className="mt-1 text-slate-600">Sistem Rekod Pendidikan Islam — Tasmik & Jawi</p>
          <p className="mt-1 text-sm text-slate-600">Guru Pendidikan Islam: RAZEEN BIN RAHMAN</p>
          <p className="mt-3 font-semibold">Tahun {tahun}</p>
        </header>

        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm print:hidden">
          <label htmlFor="tahun" className="mb-2 block font-semibold">Pilih Tahun</label>
          <select id="tahun" value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="w-full max-w-xs rounded-lg border border-slate-300 bg-white p-3 text-black">
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>Tahun {n}</option>)}
          </select>
        </section>

        {loading ? <p className="rounded-xl bg-white p-6">Sedang mendapatkan data...</p> : error ? <p className="rounded-xl bg-red-50 p-6 text-red-700">Gagal mendapatkan data: {error}</p> : (
          <>
            <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 print:grid-cols-3">
              {[
                { label: "Jumlah Murid", value: rows.length },
                { label: "Murid Ada Rekod Tasmik", value: adaTasmik },
                { label: "Murid Ada Rekod Jawi", value: adaJawi },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white p-5 shadow-sm print:border print:shadow-none">
                  <p className="text-sm text-slate-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                </div>
              ))}
            </section>
            <section className="overflow-hidden rounded-2xl bg-white shadow-sm print:overflow-visible print:rounded-none print:shadow-none">
              <h2 className="p-5 text-lg font-bold">Senarai Kemajuan Murid — Tahun {tahun}</h2>
              {rows.length === 0 ? <p className="px-5 pb-6 text-slate-600">Tiada murid bagi tahun ini.</p> : (
                <div className="overflow-x-auto print:overflow-visible">
                  <table className="w-full min-w-[760px] border-collapse text-left text-sm print:min-w-0 print:text-xs">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="border border-slate-200 p-3">Bil.</th>
                        <th className="border border-slate-200 p-3">Nama Murid</th>
                        <th className="border border-slate-200 p-3">Tasmik Terkini</th>
                        <th className="border border-slate-200 p-3">Tarikh Tasmik</th>
                        <th className="border border-slate-200 p-3">Jawi Terkini</th>
                        <th className="border border-slate-200 p-3">Tarikh Jawi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ murid: m, tasmik: t, jawi: j }, i) => (
                        <tr key={String(m.id)} className="break-inside-avoid">
                          <td className="border border-slate-200 p-3">{i + 1}</td>
                          <td className="border border-slate-200 p-3 font-medium">{m.name}</td>
                          <td className="border border-slate-200 p-3">{t ? formatTasmik(t) : "Belum ada rekod"}</td>
                          <td className="border border-slate-200 p-3">{formatTarikh(t?.date)}</td>
                          <td className="border border-slate-200 p-3">{j ? `Cilik Celik Jawi — MS ${j.page}` : "Belum ada rekod"}</td>
                          <td className="border border-slate-200 p-3">{formatTarikh(j?.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
            <p className="mt-5 text-sm text-slate-500">Nota: Paparan menunjukkan rekod terkini mengikut tarikh bagi setiap murid dan modul.</p>
          </>
        )}
      </div>
      <style jsx global>{`@media print { @page { size: A4 landscape; margin: 10mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>
    </main>
  );
}
