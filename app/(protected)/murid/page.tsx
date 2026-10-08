"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Murid = {
  id: string;
  name: string;
  year: number;
  status: string;
};

export default function MuridPage() {
  const [murid, setMurid] = useState<Murid[]>([]);
  const [nama, setNama] = useState("");
  const [tahun, setTahun] = useState("1");
  const [status, setStatus] = useState("Aktif");
  const [carian, setCarian] = useState("");
  const [filterTahun, setFilterTahun] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // ================================
  // AMBIL DATA MURID DARI SUPABASE
  // ================================
  async function ambilMurid() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("year", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      setMessage("Gagal mengambil data murid.");
      setLoading(false);
      return;
    }

    setMurid(data || []);
    setLoading(false);
  }

  useEffect(() => {
    ambilMurid();
  }, []);

  // ================================
  // TAMBAH MURID
  // ================================
  async function tambahMurid(e: React.FormEvent) {
    e.preventDefault();

    if (!nama.trim()) {
      setMessage("Sila masukkan nama murid.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("students").insert([
      {
        name: nama.trim(),
        year: Number(tahun),
        status: status,
      },
    ]);

    if (error) {
      console.error(error);
      setMessage("Gagal menyimpan murid.");
      setSaving(false);
      return;
    }

    setNama("");
    setTahun("1");
    setStatus("Aktif");
    setMessage("Murid berjaya ditambah.");
    setSaving(false);

    await ambilMurid();
  }

  // ================================
  // PADAM MURID
  // ================================
  async function padamMurid(id: string, namaMurid: string) {
    const sahkan = window.confirm(
      `Adakah anda pasti mahu padam murid "${namaMurid}"?`
    );

    if (!sahkan) {
      return;
    }

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage(
        "Gagal padam murid. Pastikan murid ini tiada rekod Tasmik atau Jawi."
      );
      return;
    }

    setMessage("Murid berjaya dipadam.");
    await ambilMurid();
  }

  // ================================
  // CARI & FILTER
  // ================================
  const muridDitapis = murid.filter((item) => {
    const padanNama = item.name
      .toLowerCase()
      .includes(carian.toLowerCase());

    const padanTahun =
      filterTahun === "Semua" ||
      item.year.toString() === filterTahun;

    return padanNama && padanTahun;
  });

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 text-black">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <div className="mb-2">
            <a
              href="/"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              ← Kembali ke Dashboard
            </a>
          </div>

          <h1 className="text-3xl font-bold">
            👨‍🎓 Senarai Murid
          </h1>

          <p className="mt-2 text-gray-600">
            Urus senarai murid untuk rekod Tasmik dan Jawi.
          </p>
        </div>

        {/* BORANG TAMBAH MURID */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">
            ➕ Tambah Murid
          </h2>

          <form
            onSubmit={tambahMurid}
            className="grid gap-4 md:grid-cols-4"
          >
            <div className="md:col-span-2">
              <label className="mb-1 block font-semibold">
                Nama Murid
              </label>

              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Ahmad bin Ali"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold">
                Tahun
              </label>

              <select
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              >
                <option value="1">Tahun 1</option>
                <option value="2">Tahun 2</option>
                <option value="3">Tahun 3</option>
                <option value="4">Tahun 4</option>
                <option value="5">Tahun 5</option>
                <option value="6">Tahun 6</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold">
                Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              >
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Murid"}
              </button>
            </div>
          </form>

          {message && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3 font-semibold text-blue-800">
              {message}
            </div>
          )}
        </div>

        {/* SENARAI MURID */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold">
                📋 Senarai Murid
              </h2>

              <p className="mt-1 text-gray-600">
                Jumlah murid: {muridDitapis.length}
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Cari Nama
                </label>

                <input
                  type="text"
                  value={carian}
                  onChange={(e) => setCarian(e.target.value)}
                  placeholder="Cari murid..."
                  className="rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Tahun
                </label>

                <select
                  value={filterTahun}
                  onChange={(e) => setFilterTahun(e.target.value)}
                  className="rounded-lg border border-gray-300 px-4 py-2"
                >
                  <option value="Semua">Semua</option>
                  <option value="1">Tahun 1</option>
                  <option value="2">Tahun 2</option>
                  <option value="3">Tahun 3</option>
                  <option value="4">Tahun 4</option>
                  <option value="5">Tahun 5</option>
                  <option value="6">Tahun 6</option>
                </select>
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="rounded-lg bg-gray-50 p-6 text-center">
              Sedang mengambil data murid...
            </div>
          )}

          {/* TIADA MURID */}
          {!loading && muridDitapis.length === 0 && (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <p className="text-lg font-semibold">
                Tiada murid dijumpai.
              </p>

              <p className="mt-2 text-gray-600">
                Tambahkan murid menggunakan borang di atas.
              </p>
            </div>
          )}

          {/* SENARAI */}
          {!loading && muridDitapis.length > 0 && (
            <div className="space-y-3">
              {muridDitapis.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="text-lg font-bold">
                      {item.name}
                    </h3>

                    <p className="text-gray-600">
                      Tahun {item.year}
                    </p>

                    <span
                      className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                        item.status === "Aktif"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      padamMurid(item.id, item.name)
                    }
                    className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                  >
                    🗑️ Padam
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}