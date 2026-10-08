"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Murid = { id: string; name: string; year: number };
type Tasmik = { id: string; student_id: string; date: string; type: string; volume: string | null; iqra: string | null; page: number; juz: number | null };
type Jawi = { id: string; student_id: string; date: string; page: number };
type Rekod = { id: string; date: string; page: number; label: string };

function tarikh(value: string) {
  const [y, m, d] = value.slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : value;
}
function tasmikLabel(r: Tasmik) {
  return r.type === "Al-Quran"
    ? `Al-Quran · Juz ${r.juz ?? "-"} · MS ${r.page}`
    : `${r.volume ?? "Iqra"} · ${r.iqra ?? ""} · MS ${r.page}`;
}
function monthKey(date: string) { return date.slice(0, 7); }
function isQuran(r: Tasmik) { return r.type === "Al-Quran"; }
function sorted<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

export default function AnalisisPage() {
  const [murid, setMurid] = useState<Murid[]>([]);
  const [tasmik, setTasmik] = useState<Tasmik[]>([]);
  const [jawi, setJawi] = useState<Jawi[]>([]);
  const [tahun, setTahun] = useState("Semua");
  const [muridId, setMuridId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const [a, b, c] = await Promise.all([
        supabase.from("students").select("id,name,year").order("year").order("name"),
        supabase.from("tasmik_records").select("id,student_id,date,type,volume,iqra,page,juz").order("date", { ascending: false }),
        supabase.from("jawi_records").select("id,student_id,date,page").order("date", { ascending: false }),
      ]);
      if (!active) return;
      if (a.error || b.error || c.error) {
        console.error(a.error || b.error || c.error);
        setError("Gagal memuatkan analisis. Sila semak sambungan dan sesi login.");
      } else {
        setMurid(a.data ?? []);
        setTasmik(b.data ?? []);
        setJawi(c.data ?? []);
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  const pilihan = useMemo(() => murid.filter(m => tahun === "Semua" || String(m.year) === tahun), [murid, tahun]);
  const dipilih = murid.find(m => m.id === muridId);
  const tm = useMemo(() => sorted(tasmik.filter(r => r.student_id === muridId)), [tasmik, muridId]);
  const jm = useMemo(() => sorted(jawi.filter(r => r.student_id === muridId)), [jawi, muridId]);
  const iqra = useMemo(() => tm.filter(r => !isQuran(r)), [tm]);
  const quran = useMemo(() => tm.filter(isQuran), [tm]);

  const bulan = useMemo(() => {
    const keys = Array.from(new Set([...tm, ...jm].map(r => monthKey(r.date)).filter(k => /^\d{4}-\d{2}$/.test(k)))).sort().slice(-6);
    return keys.map(key => ({
      key,
      label: `${key.slice(5)}/${key.slice(0, 4)}`,
      t: tm.filter(r => monthKey(r.date) === key).length,
      j: jm.filter(r => monthKey(r.date) === key).length,
    }));
  }, [tm, jm]);
  const maxSesi = Math.max(1, ...bulan.flatMap(b => [b.t, b.j]));

  const kumpulan = [
    { title: "Iqra", records: iqra.map(r => ({ id: r.id, date: r.date, page: r.page, label: tasmikLabel(r) })) },
    { title: "Al-Quran", records: quran.map(r => ({ id: r.id, date: r.date, page: r.page, label: tasmikLabel(r) })) },
    { title: "Jawi", records: jm.map(r => ({ id: r.id, date: r.date, page: r.page, label: `Cilik Celik Jawi · MS ${r.page}` })) },
  ];

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 text-black">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-2xl bg-white p-6 shadow">
          <Link href="/" className="text-sm font-semibold text-blue-700 hover:underline">← Kembali ke Dashboard</Link>
          <h1 className="mt-3 text-3xl font-bold">Analisis Kemajuan Murid</h1>
          <p className="mt-2 text-gray-600">Statistik sesi bacaan dan perkembangan Tasmik serta Jawi.</p>
        </header>
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">Pilih Murid</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="font-semibold">Tahun
              <select className="mt-2 block w-full rounded-lg border border-gray-300 bg-white p-3 text-black" value={tahun} onChange={e => { setTahun(e.target.value); setMuridId(""); }}>
                <option value="Semua">Semua Tahun</option>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>Tahun {n}</option>)}
              </select>
            </label>
            <label className="font-semibold">Nama Murid
              <select className="mt-2 block w-full rounded-lg border border-gray-300 bg-white p-3 text-black" value={muridId} onChange={e => setMuridId(e.target.value)}>
                <option value="">-- Pilih murid --</option>
                {pilihan.map(m => <option key={m.id} value={m.id}>{m.name} (Tahun {m.year})</option>)}
              </select>
            </label>
          </div>
        </section>
        {loading && <p className="rounded-xl bg-white p-6 text-center">Sedang memuatkan data analisis...</p>}
        {error && <p className="rounded-xl bg-red-50 p-6 text-red-700">{error}</p>}
        {!loading && !error && !dipilih && <p className="rounded-xl bg-white p-6 text-center text-gray-600">Sila pilih seorang murid untuk melihat analisis.</p>}
        {!loading && !error && dipilih && <>
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">{dipilih.name}</h2>
            <p className="text-gray-600">Tahun {dipilih.year} · Guru: RAZEEN BIN RAHMAN</p>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ["Jumlah Sesi Tasmik", tm.length],
                ["Jumlah Sesi Jawi", jm.length],
                ["Sesi Iqra", iqra.length],
                ["Sesi Al-Quran", quran.length],
              ].map(([label, value]) => <div key={String(label)} className="rounded-xl bg-slate-100 p-4"><p className="text-sm text-slate-600">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border p-4"><h3 className="font-bold">Tasmik terkini</h3><p className="mt-2">{tm[0] ? tasmikLabel(tm[0]) : "Belum ada rekod."}</p>{tm[0] && <p className="text-sm text-gray-600">{tarikh(tm[0].date)}</p>}</div>
              <div className="rounded-xl border p-4"><h3 className="font-bold">Jawi terkini</h3><p className="mt-2">{jm[0] ? `Cilik Celik Jawi · MS ${jm[0].page}` : "Belum ada rekod."}</p>{jm[0] && <p className="text-sm text-gray-600">{tarikh(jm[0].date)}</p>}</div>
            </div>
          </section>
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">Graf Sesi Bacaan Mengikut Bulan</h2>
            <p className="mt-1 text-sm text-gray-600">Sehingga 6 bulan yang mempunyai rekod. Graf menunjukkan bilangan sesi, bukan bilangan halaman.</p>
            {bulan.length === 0 ? <p className="mt-5 text-gray-500">Belum ada data untuk graf.</p> : <div className="mt-5 space-y-4">
              {bulan.map(b => <div key={b.key} className="grid grid-cols-[65px_1fr] items-center gap-3">
                <span className="text-sm font-semibold">{b.label}</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2"><span className="w-14 text-xs text-blue-700">Tasmik</span><div className="h-4 flex-1 rounded bg-slate-100"><div className="h-4 rounded bg-blue-600" style={{ width: `${b.t / maxSesi * 100}%` }} /></div><span className="w-7 text-right text-sm">{b.t}</span></div>
                  <div className="flex items-center gap-2"><span className="w-14 text-xs text-green-700">Jawi</span><div className="h-4 flex-1 rounded bg-slate-100"><div className="h-4 rounded bg-green-600" style={{ width: `${b.j / maxSesi * 100}%` }} /></div><span className="w-7 text-right text-sm">{b.j}</span></div>
                </div>
              </div>)}
            </div>}
          </section>
          <section className="grid gap-5 lg:grid-cols-3">
            {kumpulan.map(group => <div key={group.title} className="rounded-2xl bg-white p-5 shadow">
              <h2 className="text-xl font-bold">Perkembangan {group.title}</h2>
              <p className="mt-1 text-sm text-gray-600">{group.records.length} sesi direkodkan</p>
              {group.records.length === 0 ? <p className="mt-4 text-sm text-gray-500">Belum ada rekod.</p> : <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
                {group.records.map((r: Rekod) => <div key={r.id} className="rounded-lg border border-gray-200 p-3"><p className="text-sm font-semibold">{r.label}</p><p className="mt-1 text-xs text-gray-600">{tarikh(r.date)}</p></div>)}
              </div>}
            </div>)}
          </section>
          <p className="text-sm text-gray-600">Nota: Kemajuan dinilai berdasarkan rekod bacaan yang disimpan. Halaman bagi jilid Iqra atau juz Al-Quran yang berlainan tidak dianggap sebagai satu turutan halaman yang sama.</p>
        </>}
      </div>
    </main>
  );
}
