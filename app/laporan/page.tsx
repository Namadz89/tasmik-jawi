"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Murid = {
  id: string;
  nama: string;
  tahun: number;
  status: string;
};

type RekodTasmik = {
  id: string;
  muridId: string;
  tarikh: string;
  jenis: "Iqra" | "Al-Quran";
  jilid?: "Jilid 1" | "Jilid 2";
  iqra?: string;
  mukaSurat: number;
  juz?: number;
};

type RekodJawi = {
  id: string;
  muridId: string;
  tarikh: string;
  mukaSurat: number;
};

type TabLaporan = "keseluruhan" | "tasmik" | "jawi";

export default function LaporanPage() {
  const [murid, setMurid] = useState<Murid[]>([]);
  const [rekodTasmik, setRekodTasmik] = useState<RekodTasmik[]>([]);
  const [rekodJawi, setRekodJawi] = useState<RekodJawi[]>([]);

  const [tahunDipilih, setTahunDipilih] = useState("Semua");
  const [carian, setCarian] = useState("");

  const [tab, setTab] =
    useState<TabLaporan>("keseluruhan");

  // Ambil data murid
  useEffect(() => {
    const data = localStorage.getItem("senaraiMurid");

    if (data) {
      setMurid(JSON.parse(data));
    }
  }, []);

  // Ambil data Tasmik
  useEffect(() => {
    const data = localStorage.getItem("rekodTasmik");

    if (data) {
      setRekodTasmik(JSON.parse(data));
    }
  }, []);

  // Ambil data Jawi
  useEffect(() => {
    const data = localStorage.getItem("rekodJawi");

    if (data) {
      setRekodJawi(JSON.parse(data));
    }
  }, []);

  // Senarai tahun yang dipilih
  const muridDitapis = murid.filter((item) => {
    const ikutTahun =
      tahunDipilih === "Semua" ||
      item.tahun.toString() === tahunDipilih;

    const ikutCarian =
      item.nama
        .toLowerCase()
        .includes(carian.toLowerCase());

    return ikutTahun && ikutCarian;
  });

  // Dapatkan rekod Tasmik terkini untuk murid
  function dapatkanTasmikTerakhir(
    muridId: string
  ) {
    const senarai = rekodTasmik
      .filter((item) => item.muridId === muridId)
      .sort((a, b) => b.id.localeCompare(a.id));

    return senarai[0];
  }

  // Dapatkan rekod Jawi terkini untuk murid
  function dapatkanJawiTerakhir(
    muridId: string
  ) {
    const senarai = rekodJawi
      .filter((item) => item.muridId === muridId)
      .sort((a, b) => b.id.localeCompare(a.id));

    return senarai[0];
  }

  // Jumlah rekod Tasmik bagi murid yang ditapis
  const jumlahTasmik = rekodTasmik.filter((rekod) =>
    muridDitapis.some(
      (item) => item.id === rekod.muridId
    )
  ).length;

  // Jumlah rekod Jawi bagi murid yang ditapis
  const jumlahJawi = rekodJawi.filter((rekod) =>
    muridDitapis.some(
      (item) => item.id === rekod.muridId
    )
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-8">
          <p className="text-sm font-medium text-slate-500">
            SISTEM REKOD PENDIDIKAN ISLAM
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            📊 Laporan
          </h1>

          <p className="mt-2 text-slate-600">
            Lihat kemajuan Tasmik dan Jawi murid.
          </p>

          <p className="text-sm text-slate-500">
            Guru Pendidikan Islam: RAZEEN BIN RAHMAN
          </p>
        </header>

        {/* TAB LAPORAN */}
        <section className="rounded-2xl bg-white p-4 shadow-sm">

          <div className="grid gap-2 sm:grid-cols-3">

            <button
              type="button"
              onClick={() => setTab("keseluruhan")}
              className={`rounded-xl px-4 py-3 font-medium transition ${
                tab === "keseluruhan"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-black hover:bg-slate-200"
              }`}
            >
              Keseluruhan
            </button>

            <button
              type="button"
              onClick={() => setTab("tasmik")}
              className={`rounded-xl px-4 py-3 font-medium transition ${
                tab === "tasmik"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-black hover:bg-slate-200"
              }`}
            >
              📖 Tasmik
            </button>

            <button
              type="button"
              onClick={() => setTab("jawi")}
              className={`rounded-xl px-4 py-3 font-medium transition ${
                tab === "jawi"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-black hover:bg-slate-200"
              }`}
            >
              ✍️ Jawi
            </button>

          </div>

        </section>

        {/* PENAPIS */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-black">
            Penapis Laporan
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            {/* TAHUN */}
            <div>
              <label className="text-sm font-medium text-black">
                Tahun
              </label>

              <select
                value={tahunDipilih}
                onChange={(e) =>
                  setTahunDipilih(e.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-black outline-none focus:border-slate-400"
              >
                <option value="Semua">
                  Semua Tahun
                </option>

                <option value="1">Tahun 1</option>
                <option value="2">Tahun 2</option>
                <option value="3">Tahun 3</option>
                <option value="4">Tahun 4</option>
                <option value="5">Tahun 5</option>
                <option value="6">Tahun 6</option>
              </select>
            </div>

            {/* CARI */}
            <div>
              <label className="text-sm font-medium text-black">
                Cari Nama Murid
              </label>

              <input
                type="text"
                value={carian}
                onChange={(e) =>
                  setCarian(e.target.value)
                }
                placeholder="Contoh: Ahmad"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-black placeholder:text-slate-400 outline-none focus:border-slate-400"
              />
            </div>

          </div>

        </section>

        {/* RINGKASAN */}
        <section className="mt-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Murid
            </p>

            <p className="mt-2 text-3xl font-bold text-black">
              {muridDitapis.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Rekod Tasmik
            </p>

            <p className="mt-2 text-3xl font-bold text-black">
              {jumlahTasmik}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Rekod Jawi
            </p>

            <p className="mt-2 text-3xl font-bold text-black">
              {jumlahJawi}
            </p>
          </div>

        </section>

        {/* LAPORAN KESELURUHAN */}
        {tab === "keseluruhan" && (
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-black">
              Kemajuan Murid
            </h2>

            {muridDitapis.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <p className="text-black">
                  Tiada murid dijumpai.
                </p>
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">

                <table className="w-full min-w-[700px] text-left">

                  <thead>
                    <tr className="border-b border-slate-200">

                      <th className="px-4 py-3 text-sm font-semibold text-black">
                        Nama Murid
                      </th>

                      <th className="px-4 py-3 text-sm font-semibold text-black">
                        Tahun
                      </th>

                      <th className="px-4 py-3 text-sm font-semibold text-black">
                        Tasmik
                      </th>

                      <th className="px-4 py-3 text-sm font-semibold text-black">
                        Jawi
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {muridDitapis.map((item) => {
                      const tasmik =
                        dapatkanTasmikTerakhir(item.id);

                      const jawi =
                        dapatkanJawiTerakhir(item.id);

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-slate-100 last:border-0"
                        >

                          <td className="px-4 py-4 font-medium text-black">
                            {item.nama}
                          </td>

                          <td className="px-4 py-4 text-black">
                            Tahun {item.tahun}
                          </td>

                          <td className="px-4 py-4 text-black">

                            {tasmik ? (
                              <>
                                {tasmik.jenis === "Iqra"
                                  ? `${tasmik.iqra} — MS ${tasmik.mukaSurat}`
                                  : `Al-Quran — Juz ${tasmik.juz}, MS ${tasmik.mukaSurat}`}
                              </>
                            ) : (
                              <span className="text-slate-400">
                                Belum ada rekod
                              </span>
                            )}

                          </td>

                          <td className="px-4 py-4 text-black">

                            {jawi ? (
                              <>
                                MS {jawi.mukaSurat}
                              </>
                            ) : (
                              <span className="text-slate-400">
                                Belum ada rekod
                              </span>
                            )}

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>
            )}

          </section>
        )}

        {/* LAPORAN TASMIK */}
        {tab === "tasmik" && (
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-black">
              📖 Laporan Tasmik
            </h2>

            {muridDitapis.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <p className="text-black">
                  Tiada murid dijumpai.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">

                {muridDitapis.map((item) => {
                  const tasmik =
                    dapatkanTasmikTerakhir(item.id);

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >

                      <p className="font-bold text-black">
                        {item.nama}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Tahun {item.tahun}
                      </p>

                      <p className="mt-3 text-black">

                        {tasmik ? (
                          tasmik.jenis === "Iqra" ? (
                            <>
                              Kemajuan terakhir:{" "}
                              <strong>
                                {tasmik.iqra}
                              </strong>
                              {" — "}
                              {tasmik.jilid}
                              {" — MS "}
                              {tasmik.mukaSurat}
                            </>
                          ) : (
                            <>
                              Kemajuan terakhir:{" "}
                              <strong>
                                Al-Quran
                              </strong>
                              {" — Juz "}
                              {tasmik.juz}
                              {" — MS "}
                              {tasmik.mukaSurat}
                            </>
                          )
                        ) : (
                          "Belum ada rekod Tasmik."
                        )}

                      </p>

                    </div>
                  );
                })}

              </div>
            )}

          </section>
        )}

        {/* LAPORAN JAWI */}
        {tab === "jawi" && (
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-black">
              ✍️ Laporan Jawi
            </h2>

            {muridDitapis.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <p className="text-black">
                  Tiada murid dijumpai.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">

                {muridDitapis.map((item) => {
                  const jawi =
                    dapatkanJawiTerakhir(item.id);

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >

                      <p className="font-bold text-black">
                        {item.nama}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Tahun {item.tahun}
                      </p>

                      <p className="mt-3 text-black">

                        {jawi ? (
                          <>
                            Kemajuan terakhir:{" "}
                            <strong>
                              Cilik Celik Jawi
                            </strong>
                            {" — MS "}
                            {jawi.mukaSurat}
                          </>
                        ) : (
                          "Belum ada rekod Jawi."
                        )}

                      </p>

                    </div>
                  );
                })}

              </div>
            )}

          </section>
        )}

        {/* KEMBALI */}
        <div className="mt-6 flex flex-wrap gap-3">

          <Link
            href="/"
            className="inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            ← Dashboard
          </Link>

          <Link
            href="/tasmik"
            className="inline-block rounded-xl bg-white px-5 py-3 text-sm font-medium text-black shadow-sm transition hover:bg-slate-100"
          >
            📖 Rekod Tasmik
          </Link>

          <Link
            href="/jawi"
            className="inline-block rounded-xl bg-white px-5 py-3 text-sm font-medium text-black shadow-sm transition hover:bg-slate-100"
          >
            ✍️ Rekod Jawi
          </Link>

        </div>

      </div>
    </main>
  );
}