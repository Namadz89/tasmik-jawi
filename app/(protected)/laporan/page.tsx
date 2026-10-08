"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Murid = {
  id: string;
  name: string;
  year: number;
  status: string;
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

export default function LaporanPage() {
  const [murid, setMurid] = useState<Murid[]>([]);
  const [tasmik, setTasmik] = useState<TasmikRecord[]>([]);
  const [jawi, setJawi] = useState<JawiRecord[]>([]);

  const [tahun, setTahun] = useState("Semua");
  const [carian, setCarian] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    ambilSemuaData();
  }, []);

  async function ambilSemuaData() {
    setLoading(true);
    setMessage("");

    const [
      { data: muridData, error: muridError },
      { data: tasmikData, error: tasmikError },
      { data: jawiData, error: jawiError },
    ] = await Promise.all([
      supabase
        .from("students")
        .select("*")
        .order("year", { ascending: true })
        .order("name", { ascending: true }),

      supabase
        .from("tasmik_records")
        .select("*")
        .order("date", { ascending: false }),

      supabase
        .from("jawi_records")
        .select("*")
        .order("date", { ascending: false }),
    ]);

    if (muridError) {
      console.error(muridError);
      setMessage("Gagal mengambil data murid.");
      setLoading(false);
      return;
    }

    if (tasmikError) {
      console.error(tasmikError);
      setMessage("Gagal mengambil data Tasmik.");
      setLoading(false);
      return;
    }

    if (jawiError) {
      console.error(jawiError);
      setMessage("Gagal mengambil data Jawi.");
      setLoading(false);
      return;
    }

    setMurid(muridData || []);
    setTasmik(tasmikData || []);
    setJawi(jawiData || []);

    setLoading(false);
  }

  function formatTarikh(tarikh: string) {
    const [tahun, bulan, hari] = tarikh.split("-");

    return `${hari}/${bulan}/${tahun}`;
  }

  function paparanTasmik(item: TasmikRecord) {
    if (item.type === "Al-Quran") {
      return `Al-Quran — Juz ${item.juz} — MS ${item.page}`;
    }

    return `${item.volume} — ${item.iqra} — MS ${item.page}`;
  }

  const muridDitapis = useMemo(() => {
    return murid.filter((item) => {
      const ikutTahun =
        tahun === "Semua" ||
        item.year.toString() === tahun;

      const ikutCarian = item.name
        .toLowerCase()
        .includes(carian.toLowerCase());

      return ikutTahun && ikutCarian;
    });
  }, [murid, tahun, carian]);

  function rekodTasmikMurid(studentId: string) {
    return tasmik
      .filter((item) => item.student_id === studentId)
      .sort((a, b) => {
        return (
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
        );
      });
  }

  function rekodJawiMurid(studentId: string) {
    return jawi
      .filter((item) => item.student_id === studentId)
      .sort((a, b) => {
        return (
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
        );
      });
  }

  function cetakLaporan() {
    window.print();
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 text-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow print:shadow-none">
          <a
            href="/"
            className="text-sm font-semibold text-blue-600 hover:underline print:hidden"
          >
            ← Kembali ke Dashboard
          </a>

          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                📊 Laporan
              </h1>

              <p className="mt-2 text-gray-600">
                Laporan kemajuan Tasmik dan Jawi murid.
              </p>
            </div>

            <button
              onClick={cetakLaporan}
              className="rounded-lg bg-gray-800 px-5 py-3 font-bold text-white hover:bg-gray-900 print:hidden"
            >
              🖨️ Cetak Laporan
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow print:hidden">
          <h2 className="mb-4 text-xl font-bold">
            🔎 Tapis Laporan
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold">
                Tahun
              </label>

              <select
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              >
                <option value="Semua">Semua Tahun</option>
                <option value="1">Tahun 1</option>
                <option value="2">Tahun 2</option>
                <option value="3">Tahun 3</option>
                <option value="4">Tahun 4</option>
                <option value="5">Tahun 5</option>
                <option value="6">Tahun 6</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Cari Murid
              </label>

              <input
                type="text"
                value={carian}
                onChange={(e) => setCarian(e.target.value)}
                placeholder="Taip nama murid..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 font-semibold text-red-700">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow">
            Sedang mengambil data laporan...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow">
              <div className="mb-5 border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold">
                  REKOD TASMIK DAN JAWI
                </h2>

                <p className="mt-1 font-semibold">
                  Guru Pendidikan Islam: RAZEEN BIN RAHMAN
                </p>

                <p className="mt-1 text-gray-600">
                  {tahun === "Semua"
                    ? "Semua Tahun"
                    : `Tahun ${tahun}`}
                </p>
              </div>

              {muridDitapis.length === 0 ? (
                <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-600">
                  Tiada murid dijumpai.
                </div>
              ) : (
                <div className="space-y-5">
                  {muridDitapis.map((student) => {
                    const rekodTasmik =
                      rekodTasmikMurid(student.id);

                    const rekodJawi =
                      rekodJawiMurid(student.id);

                    const tasmikTerbaru =
                      rekodTasmik.length > 0
                        ? rekodTasmik[0]
                        : null;

                    const jawiTerbaru =
                      rekodJawi.length > 0
                        ? rekodJawi[0]
                        : null;

                    return (
                      <div
                        key={student.id}
                        className="rounded-xl border border-gray-200 p-5"
                      >
                        <div className="flex flex-col gap-2 border-b border-gray-200 pb-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-lg font-bold">
                              {student.name}
                            </h3>

                            <p className="text-sm text-gray-600">
                              Tahun {student.year}
                            </p>
                          </div>

                          <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                            {student.status}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div className="rounded-lg bg-blue-50 p-4">
                            <p className="font-bold text-blue-900">
                              📖 Tasmik
                            </p>

                            {tasmikTerbaru ? (
                              <>
                                <p className="mt-2 font-semibold text-blue-900">
                                  {paparanTasmik(
                                    tasmikTerbaru
                                  )}
                                </p>

                                <p className="mt-1 text-sm text-blue-800">
                                  {formatTarikh(
                                    tasmikTerbaru.date
                                  )}
                                </p>
                              </>
                            ) : (
                              <p className="mt-2 text-sm text-blue-800">
                                Belum ada rekod Tasmik.
                              </p>
                            )}

                            {rekodTasmik.length > 1 && (
                              <p className="mt-2 text-xs text-blue-700">
                                Jumlah rekod:{" "}
                                {rekodTasmik.length}
                              </p>
                            )}
                          </div>

                          <div className="rounded-lg bg-green-50 p-4">
                            <p className="font-bold text-green-900">
                              ✍️ Jawi
                            </p>

                            {jawiTerbaru ? (
                              <>
                                <p className="mt-2 font-semibold text-green-900">
                                  Cilik Celik Jawi — MS{" "}
                                  {jawiTerbaru.page}
                                </p>

                                <p className="mt-1 text-sm text-green-800">
                                  {formatTarikh(
                                    jawiTerbaru.date
                                  )}
                                </p>
                              </>
                            ) : (
                              <p className="mt-2 text-sm text-green-800">
                                Belum ada rekod Jawi.
                              </p>
                            )}

                            {rekodJawi.length > 1 && (
                              <p className="mt-2 text-xs text-green-700">
                                Jumlah rekod:{" "}
                                {rekodJawi.length}
                              </p>
                            )}
                          </div>
                        </div>

                        {(rekodTasmik.length > 0 ||
                          rekodJawi.length > 0) && (
                          <details className="mt-4">
                            <summary className="cursor-pointer font-semibold text-gray-700">
                              Lihat sejarah rekod
                            </summary>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              <div>
                                <h4 className="mb-2 font-bold">
                                  Sejarah Tasmik
                                </h4>

                                {rekodTasmik.length === 0 ? (
                                  <p className="text-sm text-gray-500">
                                    Tiada rekod.
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {rekodTasmik.map(
                                      (item) => (
                                        <div
                                          key={item.id}
                                          className="rounded-lg border border-gray-200 p-3"
                                        >
                                          <p className="text-sm font-semibold">
                                            {paparanTasmik(
                                              item
                                            )}
                                          </p>

                                          <p className="text-xs text-gray-500">
                                            {formatTarikh(
                                              item.date
                                            )}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>

                              <div>
                                <h4 className="mb-2 font-bold">
                                  Sejarah Jawi
                                </h4>

                                {rekodJawi.length === 0 ? (
                                  <p className="text-sm text-gray-500">
                                    Tiada rekod.
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {rekodJawi.map(
                                      (item) => (
                                        <div
                                          key={item.id}
                                          className="rounded-lg border border-gray-200 p-3"
                                        >
                                          <p className="text-sm font-semibold">
                                            Cilik Celik Jawi —
                                            MS {item.page}
                                          </p>

                                          <p className="text-xs text-gray-500">
                                            {formatTarikh(
                                              item.date
                                            )}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          main {
            padding: 0 !important;
          }

          .shadow {
            box-shadow: none !important;
          }
        }
      `}</style>
    </main>
  );
}