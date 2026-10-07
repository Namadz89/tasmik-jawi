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

export default function TasmikPage() {
  const tahun = [1, 2, 3, 4, 5, 6];

  const [tahunDipilih, setTahunDipilih] = useState<number | null>(null);
  const [murid, setMurid] = useState<Murid[]>([]);
  const [muridDipilih, setMuridDipilih] = useState<Murid | null>(null);

  const [tarikh, setTarikh] = useState("");
  const [jenis, setJenis] = useState<"Iqra" | "Al-Quran">("Iqra");
  const [jilid, setJilid] = useState<"Jilid 1" | "Jilid 2">("Jilid 1");
  const [iqra, setIqra] = useState("1");
  const [mukaSurat, setMukaSurat] = useState("");
  const [juz, setJuz] = useState("1");

  const [rekod, setRekod] = useState<RekodTasmik[]>([]);

  // Ambil senarai murid
  useEffect(() => {
    const data = localStorage.getItem("senaraiMurid");

    if (data) {
      setMurid(JSON.parse(data));
    }
  }, []);

  // Ambil rekod Tasmik yang telah disimpan
  useEffect(() => {
    const data = localStorage.getItem("rekodTasmik");

    if (data) {
      setRekod(JSON.parse(data));
    }
  }, []);

  // Simpan rekod Tasmik ke browser
  useEffect(() => {
    localStorage.setItem("rekodTasmik", JSON.stringify(rekod));
  }, [rekod]);

  // Murid aktif mengikut tahun
  const muridMengikutTahun = murid.filter(
    (item) =>
      item.tahun === tahunDipilih &&
      item.status === "Aktif"
  );

  // Rekod murid yang dipilih
  const rekodMuridDipilih = muridDipilih
    ? rekod
        .filter((item) => item.muridId === muridDipilih.id)
        .sort((a, b) => b.id.localeCompare(a.id))
    : [];

  function pilihMurid(item: Murid) {
    setMuridDipilih(item);

    // Tetapkan tarikh hari ini
    const hariIni = new Date().toISOString().split("T")[0];
    setTarikh(hariIni);

    // Reset borang
    setJenis("Iqra");
    setJilid("Jilid 1");
    setIqra("1");
    setMukaSurat("");
    setJuz("1");
  }

  function simpanRekod() {
    if (!muridDipilih) {
      alert("Sila pilih murid terlebih dahulu.");
      return;
    }

    if (!tarikh) {
      alert("Sila pilih tarikh.");
      return;
    }

    if (!mukaSurat) {
      alert("Sila masukkan muka surat.");
      return;
    }

    const mukaSuratNumber = Number(mukaSurat);

    // Semakan muka surat mengikut bahan
    if (jenis === "Iqra") {
      if (jilid === "Jilid 1") {
        if (mukaSuratNumber < 1 || mukaSuratNumber > 130) {
          alert("Jilid 1 mempunyai muka surat 1 hingga 130.");
          return;
        }
      }

      if (jilid === "Jilid 2") {
        if (mukaSuratNumber < 3 || mukaSuratNumber > 65) {
          alert("Jilid 2 mempunyai muka surat 3 hingga 65.");
          return;
        }
      }
    }

    if (jenis === "Al-Quran") {
      const juzNumber = Number(juz);

      if (juzNumber < 1 || juzNumber > 30) {
        alert("Juz mesti antara 1 hingga 30.");
        return;
      }
    }

    const rekodBaru: RekodTasmik = {
      id: Date.now().toString(),
      muridId: muridDipilih.id,
      tarikh,
      jenis,
      ...(jenis === "Iqra"
        ? {
            jilid,
            iqra,
            mukaSurat: mukaSuratNumber,
          }
        : {
            mukaSurat: mukaSuratNumber,
            juz: Number(juz),
          }),
    };

    setRekod([rekodBaru, ...rekod]);

    alert("Rekod Tasmik berjaya disimpan.");

    setMukaSurat("");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-8">
          <p className="text-sm font-medium text-slate-500">
            SISTEM REKOD PENDIDIKAN ISLAM
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            📖 Rekod Tasmik
          </h1>

          <p className="mt-2 text-slate-600">
            Rekod bacaan Iqra dan Al-Quran murid.
          </p>

          <p className="text-sm text-slate-500">
            Guru Pendidikan Islam: RAZEEN BIN RAHMAN
          </p>
        </header>

        {/* PILIH TAHUN */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            1. Pilih Tahun
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Pilih tahun untuk melihat senarai murid.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {tahun.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setTahunDipilih(item);
                  setMuridDipilih(null);
                }}
                className={`rounded-xl border px-4 py-5 text-lg font-bold transition ${
                  tahunDipilih === item
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                Tahun {item}
              </button>
            ))}
          </div>

        </section>

        {/* SENARAI MURID */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-black">
            2. Pilih Murid
          </h2>

          {tahunDipilih === null ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <p className="text-black">
                Sila pilih Tahun 1 hingga Tahun 6.
              </p>
            </div>
          ) : muridMengikutTahun.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <p className="font-medium text-black">
                Tiada murid aktif untuk Tahun {tahunDipilih}.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Sila tambah murid di halaman Senarai Murid.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">

              {muridMengikutTahun.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col gap-3 rounded-xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                    muridDipilih?.id === item.id
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200"
                  }`}
                >
                  <div>
                    <p className="font-bold text-black">
                      {item.nama}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Tahun {item.tahun}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => pilihMurid(item)}
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    Rekod Tasmik →
                  </button>
                </div>
              ))}

            </div>
          )}

        </section>

        {/* BORANG REKOD */}
        {muridDipilih && (
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

            <div className="border-b border-slate-200 pb-5">

              <p className="text-sm text-slate-500">
                Murid dipilih
              </p>

              <h2 className="mt-1 text-2xl font-bold text-black">
                {muridDipilih.nama}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tahun {muridDipilih.tahun}
              </p>

            </div>

            {/* BORANG */}
            <div className="mt-6">

              <h3 className="text-xl font-bold text-black">
                3. Rekod Bacaan
              </h3>

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                {/* TARIKH */}
                <div>
                  <label className="text-sm font-medium text-black">
                    Tarikh
                  </label>

                  <input
                    type="date"
                    value={tarikh}
                    onChange={(e) => setTarikh(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-black outline-none focus:border-slate-400"
                  />
                </div>

                {/* JENIS */}
                <div>
                  <label className="text-sm font-medium text-black">
                    Jenis Bacaan
                  </label>

                  <select
                    value={jenis}
                    onChange={(e) =>
                      setJenis(e.target.value as "Iqra" | "Al-Quran")
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-black outline-none focus:border-slate-400"
                  >
                    <option value="Iqra">Iqra</option>
                    <option value="Al-Quran">Al-Quran</option>
                  </select>
                </div>

                {/* BAHAGIAN IQRA */}
                {jenis === "Iqra" && (
                  <>
                    {/* JILID */}
                    <div>
                      <label className="text-sm font-medium text-black">
                        Jilid
                      </label>

                      <select
                        value={jilid}
                        onChange={(e) =>
                          setJilid(
                            e.target.value as "Jilid 1" | "Jilid 2"
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-black outline-none focus:border-slate-400"
                      >
                        <option value="Jilid 1">
                          Iqra KPM Jilid 1
                        </option>

                        <option value="Jilid 2">
                          Iqra KPM Jilid 2
                        </option>
                      </select>
                    </div>

                    {/* IQRA */}
                    <div>
                      <label className="text-sm font-medium text-black">
                        Iqra
                      </label>

                      <select
                        value={iqra}
                        onChange={(e) => setIqra(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-black outline-none focus:border-slate-400"
                      >
                        <option value="1">Iqra 1</option>
                        <option value="2">Iqra 2</option>
                        <option value="3">Iqra 3</option>
                        <option value="4">Iqra 4</option>
                        <option value="5">Iqra 5</option>
                        <option value="6">Iqra 6</option>
                      </select>
                    </div>

                    {/* MUKA SURAT */}
                    <div>
                      <label className="text-sm font-medium text-black">
                        Muka Surat
                      </label>

                      <input
                        type="number"
                        min={jilid === "Jilid 1" ? 1 : 3}
                        max={jilid === "Jilid 1" ? 130 : 65}
                        value={mukaSurat}
                        onChange={(e) => setMukaSurat(e.target.value)}
                        placeholder={
                          jilid === "Jilid 1"
                            ? "1 - 130"
                            : "3 - 65"
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-black placeholder:text-slate-400 outline-none focus:border-slate-400"
                      />

                      <p className="mt-1 text-xs text-slate-500">
                        {jilid === "Jilid 1"
                          ? "Jilid 1: muka surat 1 hingga 130"
                          : "Jilid 2: muka surat 3 hingga 65"}
                      </p>
                    </div>
                  </>
                )}

                {/* BAHAGIAN AL-QURAN */}
                {jenis === "Al-Quran" && (
                  <>
                    {/* JUZ */}
                    <div>
                      <label className="text-sm font-medium text-black">
                        Juz
                      </label>

                      <select
                        value={juz}
                        onChange={(e) => setJuz(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-black outline-none focus:border-slate-400"
                      >
                        {Array.from({ length: 30 }, (_, index) => (
                          <option
                            key={index + 1}
                            value={index + 1}
                          >
                            Juz {index + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* MUKA SURAT */}
                    <div>
                      <label className="text-sm font-medium text-black">
                        Muka Surat Al-Quran
                      </label>

                      <input
                        type="number"
                        min={1}
                        value={mukaSurat}
                        onChange={(e) => setMukaSurat(e.target.value)}
                        placeholder="Contoh: 25"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-black placeholder:text-slate-400 outline-none focus:border-slate-400"
                      />
                    </div>
                  </>
                )}

              </div>

              {/* BUTANG SIMPAN */}
              <button
                type="button"
                onClick={simpanRekod}
                className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-4 font-medium text-white transition hover:bg-slate-800 sm:w-auto"
              >
                💾 Simpan Rekod Tasmik
              </button>

            </div>

            {/* SEJARAH REKOD */}
            <div className="mt-8 border-t border-slate-200 pt-6">

              <h3 className="text-xl font-bold text-black">
                Sejarah Rekod
              </h3>

              {rekodMuridDipilih.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-center">
                  <p className="text-black">
                    Belum ada rekod Tasmik untuk murid ini.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">

                  {rekodMuridDipilih.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >

                      <p className="font-bold text-black">
                        {item.jenis === "Iqra"
                          ? `${item.iqra} — ${item.jilid}`
                          : `Al-Quran — Juz ${item.juz}`}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Tarikh: {item.tarikh}
                      </p>

                      <p className="mt-1 text-sm text-black">
                        Muka Surat: {item.mukaSurat}
                      </p>

                    </div>
                  ))}

                </div>
              )}

            </div>

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
            href="/murid"
            className="inline-block rounded-xl bg-white px-5 py-3 text-sm font-medium text-black shadow-sm transition hover:bg-slate-100"
          >
            👨‍🎓 Senarai Murid
          </Link>

        </div>

      </div>
    </main>
  );
}