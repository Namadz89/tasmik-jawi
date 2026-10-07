"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Murid = {
  id: string;
  nama: string;
  tahun: number;
  status: string;
};

export default function MuridPage() {
  const [nama, setNama] = useState("");
  const [tahun, setTahun] = useState("1");
  const [status, setStatus] = useState("Aktif");

  const [murid, setMurid] = useState<Murid[]>([]);

  // Ambil data murid yang telah disimpan
  useEffect(() => {
    const data = localStorage.getItem("senaraiMurid");

    if (data) {
      setMurid(JSON.parse(data));
    }
  }, []);

  // Simpan data murid ke browser
  useEffect(() => {
    localStorage.setItem("senaraiMurid", JSON.stringify(murid));
  }, [murid]);

  function tambahMurid() {
    if (nama.trim() === "") {
      alert("Sila masukkan nama murid.");
      return;
    }

    const muridBaru: Murid = {
      id: Date.now().toString(),
      nama: nama.trim(),
      tahun: Number(tahun),
      status: status,
    };

    setMurid([...murid, muridBaru]);

    setNama("");
    setTahun("1");
    setStatus("Aktif");
  }

  function padamMurid(id: string) {
    const sah = confirm("Adakah cikgu pasti mahu memadam murid ini?");

    if (!sah) {
      return;
    }

    setMurid(murid.filter((item) => item.id !== id));
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
            👨‍🎓 Senarai Murid
          </h1>

          <p className="mt-2 text-slate-600">
            Tambah dan urus senarai murid.
          </p>

          <p className="text-sm text-slate-500">
            Guru Pendidikan Islam: RAZEEN BIN RAHMAN
          </p>
        </header>

        {/* BORANG TAMBAH MURID */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-black">
            Tambah Murid
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">

            {/* NAMA */}
            <div>
              <label className="text-sm font-medium text-black">
                Nama Murid
              </label>

              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Ahmad"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-black placeholder:text-slate-400 outline-none focus:border-slate-400"
              />
            </div>

            {/* TAHUN */}
            <div>
              <label className="text-sm font-medium text-black">
                Tahun
              </label>

              <select
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-black outline-none focus:border-slate-400"
              >
                <option value="1">Tahun 1</option>
                <option value="2">Tahun 2</option>
                <option value="3">Tahun 3</option>
                <option value="4">Tahun 4</option>
                <option value="5">Tahun 5</option>
                <option value="6">Tahun 6</option>
              </select>
            </div>

            {/* STATUS */}
            <div>
              <label className="text-sm font-medium text-black">
                Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-black outline-none focus:border-slate-400"
              >
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>

          </div>

          <button
            type="button"
            onClick={tambahMurid}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800"
          >
            + Tambah Murid
          </button>

        </section>

        {/* SENARAI MURID */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <div>
            <h2 className="text-xl font-bold text-black">
              Senarai Murid
            </h2>

            <p className="mt-1 text-sm text-black">
              Jumlah murid: {murid.length}
            </p>
          </div>

          {murid.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <p className="text-black">
                Belum ada murid.
              </p>

              <p className="mt-1 text-sm text-black">
                Gunakan borang di atas untuk menambah murid.
              </p>
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">

              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-sm font-semibold text-black">
                      Nama Murid
                    </th>

                    <th className="px-4 py-3 text-sm font-semibold text-black">
                      Tahun
                    </th>

                    <th className="px-4 py-3 text-sm font-semibold text-black">
                      Status
                    </th>

                    <th className="px-4 py-3 text-sm font-semibold text-black">
                      Tindakan
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {murid.map((item) => (
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
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-black">
                          {item.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => padamMurid(item.id)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Padam
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          )}

        </section>

        {/* KEMBALI */}
        <div className="mt-6 flex gap-3">

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

        </div>

      </div>
    </main>
  );
}