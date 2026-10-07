"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Murid = {
  id: string;
  nama: string;
  tahun: number;
  status: string;
};

type RekodJawi = {
  id: string;
  muridId: string;
  tarikh: string;
  mukaSurat: number;
};

export default function JawiPage() {
  const tahun = [1, 2, 3, 4, 5, 6];

  const [tahunDipilih, setTahunDipilih] = useState<number | null>(null);
  const [murid, setMurid] = useState<Murid[]>([]);
  const [muridDipilih, setMuridDipilih] = useState<Murid | null>(null);

  const [tarikh, setTarikh] = useState("");
  const [mukaSurat, setMukaSurat] = useState("");

  const [rekod, setRekod] = useState<RekodJawi[]>([]);

  // Ambil senarai murid
  useEffect(() => {
    const data = localStorage.getItem("senaraiMurid");

    if (data) {
      setMurid(JSON.parse(data));
    }
  }, []);

  // Ambil rekod Jawi
  useEffect(() => {
    const data = localStorage.getItem("rekodJawi");

    if (data) {
      setRekod(JSON.parse(data));
    }
  }, []);

  // Simpan rekod Jawi
  useEffect(() => {
    localStorage.setItem("rekodJawi", JSON.stringify(rekod));
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
    setMukaSurat("");
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

    // Cilik Celik Jawi bermula pada muka surat 9
    // dan berakhir pada muka surat 280.
    if (mukaSuratNumber < 9 || mukaSuratNumber > 280) {
      alert("Muka surat Cilik Celik Jawi mestilah antara 9 hingga 280.");
      return;
    }

    const rekodBaru: RekodJawi = {
      id: Date.now().toString(),
      muridId: muridDipilih.id,
      tarikh,
      mukaSurat: mukaSuratNumber,
    };

    setRekod([rekodBaru, ...rekod]);

    alert("Rekod Jawi berjaya disimpan.");

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
            ✍️ Rekod Jawi
          </h1>

          <p className="mt-2 text-slate-600">
            Rekod kemajuan Cilik Celik Jawi.
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
                    Rekod Jawi →
                  </button>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* BORANG REKOD JAWI */}
        {muridDipilih && (
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

            {/* MAKLUMAT MURID */}
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
                3. Rekod Cilik Celik Jawi
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

                {/* MUKA SURAT */}
                <div>
                  <label className="text-sm font-medium text-black">
                    Muka Surat
                  </label>

                  <input
                    type="number"
                    min={9}
                    max={280}
                    value={mukaSurat}
                    onChange={(e) => setMukaSurat(e.target.value)}
                    placeholder="9 - 280"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-black placeholder:text-slate-400 outline-none focus:border-slate-400"
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    Cilik Celik Jawi: muka surat 9 hingga 280
                  </p>
                </div>

              </div>

              {/* BUTANG SIMPAN */}
              <button
                type="button"
                onClick={simpanRekod}
                className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-4 font-medium text-white transition hover:bg-slate-800 sm:w-auto"
              >
                💾 Simpan Rekod Jawi
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
                    Belum ada rekod Jawi untuk murid ini.
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
                        Cilik Celik Jawi — MS {item.mukaSurat}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Tarikh: {item.tarikh}
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