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

export default function Home() {
  const [jumlahMurid, setJumlahMurid] = useState(0);
  const [jumlahTasmik, setJumlahTasmik] = useState(0);
  const [jumlahJawi, setJumlahJawi] = useState(0);

  useEffect(() => {
    function kemasKiniStatistik() {
      const dataMurid = localStorage.getItem("senaraiMurid");
      const dataTasmik = localStorage.getItem("rekodTasmik");
      const dataJawi = localStorage.getItem("rekodJawi");

      const senaraiMurid: Murid[] = dataMurid
        ? JSON.parse(dataMurid)
        : [];

      const rekodTasmik: RekodTasmik[] = dataTasmik
        ? JSON.parse(dataTasmik)
        : [];

      const rekodJawi: RekodJawi[] = dataJawi
        ? JSON.parse(dataJawi)
        : [];

      setJumlahMurid(senaraiMurid.length);
      setJumlahTasmik(rekodTasmik.length);
      setJumlahJawi(rekodJawi.length);
    }

    kemasKiniStatistik();

    window.addEventListener(
      "storage",
      kemasKiniStatistik
    );

    return () => {
      window.removeEventListener(
        "storage",
        kemasKiniStatistik
      );
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm font-medium text-slate-500">
            SISTEM REKOD PENDIDIKAN ISLAM
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">
            Tasmik & Jawi
          </h1>

          <p className="mt-3 text-slate-600">
            Selamat datang, RAZEEN BIN RAHMAN
          </p>

          <p className="text-sm text-slate-500">
            Guru Pendidikan Islam
          </p>
        </header>

        {/* Statistik */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Jumlah Murid
            </p>

            <p className="mt-2 text-3xl font-bold text-black">
              {jumlahMurid}
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

        {/* Menu Utama */}
        <section className="mt-6">
          <h2 className="mb-4 text-xl font-bold text-black">
            Menu Utama
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Tasmik */}
            <Link
              href="/tasmik"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:bg-slate-50 hover:shadow-md"
            >
              <div className="text-3xl">
                📖
              </div>

              <h3 className="mt-4 text-xl font-bold text-black">
                Rekod Tasmik
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Rekod kemajuan Iqra dan Al-Quran murid.
              </p>

              <p className="mt-4 text-sm font-medium text-slate-900">
                Buka Rekod Tasmik →
              </p>
            </Link>

            {/* Jawi */}
            <Link
              href="/jawi"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:bg-slate-50 hover:shadow-md"
            >
              <div className="text-3xl">
                ✍️
              </div>

              <h3 className="mt-4 text-xl font-bold text-black">
                Rekod Jawi
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Rekod kemajuan Cilik Celik Jawi.
              </p>

              <p className="mt-4 text-sm font-medium text-slate-900">
                Buka Rekod Jawi →
              </p>
            </Link>

            {/* Senarai Murid */}
            <Link
              href="/murid"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:bg-slate-50 hover:shadow-md"
            >
              <div className="text-3xl">
                👨‍🎓
              </div>

              <h3 className="mt-4 text-xl font-bold text-black">
                Senarai Murid
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Tambah dan urus senarai murid Tahun 1 hingga Tahun 6.
              </p>

              <p className="mt-4 text-sm font-medium text-slate-900">
                Buka Senarai Murid →
              </p>
            </Link>

            {/* Laporan */}
            <Link
              href="/laporan"
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:bg-slate-50 hover:shadow-md"
            >
              <div className="text-3xl">
                📊
              </div>

              <h3 className="mt-4 text-xl font-bold text-black">
                Laporan
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Lihat kemajuan keseluruhan, Tasmik dan Jawi.
              </p>

              <p className="mt-4 text-sm font-medium text-slate-900">
                Buka Laporan →
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}