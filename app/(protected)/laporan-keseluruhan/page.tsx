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

  const [exporting, setExporting] = useState(false);

  const [exportError, setExportError] = useState("");

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

  async function eksportExcel() {

    if (loading || error || exporting) return;

    setExporting(true);

    setExportError("");

    try {

      // Import hanya apabila butang diklik supaya halaman lebih ringan.

      const ExcelJS = (await import("exceljs")).default;

      const workbook = new ExcelJS.Workbook();

      const sheet = workbook.addWorksheet(`Tahun ${tahun}`);

      sheet.columns = [

        { header: "Bil.", key: "bil", width: 9 },

        { header: "Nama Murid", key: "nama", width: 28 },

        { header: "Tahun", key: "tahun", width: 12 },

        { header: "Tasmik Terkini", key: "tasmik", width: 42 },

        { header: "Tarikh Tasmik", key: "tarikhTasmik", width: 18 },

        { header: "Jawi Terkini", key: "jawi", width: 32 },

        { header: "Tarikh Jawi", key: "tarikhJawi", width: 18 },

      ];

      sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

      sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1D4ED8" } };

      sheet.getRow(1).alignment = { vertical: "middle" };

      sheet.getRow(1).height = 25;

      sheet.views = [{ state: "frozen", ySplit: 1 }];

      sheet.autoFilter = "A1:G1";

      rows.forEach(({ murid: m, tasmik: t, jawi: j }, index) => {

        const row = sheet.addRow({

          bil: index + 1,

          nama: m.name,

          tahun: m.year,

          tasmik: t ? formatTasmik(t) : "Belum ada rekod",

          tarikhTasmik: formatTarikh(t?.date),

          jawi: j ? `Cilik Celik Jawi — MS ${j.page}` : "Belum ada rekod",

          tarikhJawi: formatTarikh(j?.date),

        });

        row.alignment = { vertical: "middle", wrapText: true };

        if (index % 2 === 1) {

          row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };

        }

      });

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer as BlobPart], {

        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `Laporan_Tasmik_Jawi_Tahun_${tahun}.xlsx`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 60000);

    } catch (err) {

      console.error(err);

      setExportError("Gagal mengeksport Excel. Sila cuba lagi.");

    } finally {

      setExporting(false);

    }

  }

  return (

    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6 print:bg-white print:p-0">

      <div className="mx-auto max-w-7xl">

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">

          <Link href="/" className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-700 shadow-sm hover:bg-blue-50">← Kembali ke Dashboard</Link>

          <div className="flex flex-wrap gap-2">

            <button type="button" onClick={eksportExcel} disabled={loading || !!error || exporting} className="rounded-lg bg-green-700 px-5 py-2 font-semibold text-white hover:bg-green-800 disabled:opacity-50">

              {exporting ? "Menyediakan Excel..." : "📊 Eksport Excel (.xlsx)"}

            </button>

            <button type="button" onClick={() => window.print()} disabled={loading || !!error} className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50">🖨️ Cetak / Simpan PDF</button>

          </div>

        </div>

        {exportError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-700 print:hidden">{exportError}</p>}

        <header className="mb-6 rounded-2xl bg-white p-6 shadow-sm print:mb-4 print:rounded-none print:p-0 print:shadow-none">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start print:flex-row print:items-start print:gap-4">
            <img
              src="/logo-sekolah.jpg"
              alt="Logo Sekolah Kebangsaan Kitou"
              width={100}
              height={120}
              className="h-28 w-auto shrink-0 object-contain print:h-20"
            />
            <div className="text-center sm:text-left print:text-left">
              <p className="text-sm font-bold text-blue-700 print:text-black">SISTEM REKOD PENDIDIKAN ISLAM</p>
              <h1 className="mt-1 text-xl font-extrabold leading-tight sm:text-2xl print:text-lg">
                SEKOLAH KEBANGSAAN KITOU, TAMBUNAN SABAH
              </h1>
              <p className="mt-1 text-sm">Kod Sekolah: XBA1229</p>
              <p className="mt-2 text-sm font-bold italic text-blue-800 print:text-black">
                SK KITOU HEBAT, MEMBINA GENERASI GEMILANG
              </p>
            </div>
          </div>
          <div className="mt-5 border-b-2 border-slate-800 pb-4 text-center print:mt-3 print:pb-2">
            <h2 className="text-xl font-bold print:text-base">LAPORAN KESELURUHAN MENGIKUT TAHUN</h2>
            <p className="mt-1 text-sm">Guru Pendidikan Islam: <strong>RAZEEN BIN RAHMAN</strong></p>
            <p className="mt-2 font-bold">Tahun {tahun}</p>
          </div>
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

      <style>{`@media print { @page { size: A4 landscape; margin: 10mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } thead { display: table-header-group; } tr { break-inside: avoid; } }`}</style>

    </main>

  );

}
