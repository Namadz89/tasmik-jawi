
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Murid = {
  id: number | string;
  name: string;
  year: number;
  status: string | null;
};

export default function MuridPage() {
  const [murid, setMurid] = useState<Murid[]>([]);
  const [nama, setNama] = useState("");
  const [tahun, setTahun] = useState("1");
  const [status, setStatus] = useState("Aktif");

  const [carian, setCarian] = useState("");
  const [filterTahun, setFilterTahun] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Ambil data murid
  async function ambilMurid() {
    setLoading(true);

    const { data, error } = await supabase
      .from("students")
      .select("id, name, year, status")
      .order("year", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Gagal mengambil murid:", error);
      setMessage("Gagal mengambil data murid.");
      setIsError(true);
    } else {
      setMurid((data ?? []) as Murid[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void ambilMurid();
  }, []);

  // Tambah murid
  async function tambahMurid(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nama.trim()) {
      setMessage("Sila masukkan nama murid.");
      setIsError(true);
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("students").insert({
      name: nama.trim(),
      year: Number(tahun),
      status,
    });

    if (error) {
      console.error("Gagal menambah murid:", error);
      setMessage("Gagal menyimpan murid.");
      setIsError(true);
      setSaving(false);
      return;
    }

    setNama("");
    setTahun("1");
    setStatus("Aktif");
    setSaving(false);

    await ambilMurid();
    setMessage("Murid berjaya ditambah.");
    setIsError(false);
  }

  // Nyahaktif atau aktifkan semula murid
  async function tukarStatusMurid(item: Murid) {
    const sedangAktif = item.status === "Aktif";
    const statusBaharu = sedangAktif ? "Tidak Aktif" : "Aktif";

    const mesejPengesahan = sedangAktif
      ? `Nyahaktifkan murid "${item.name}"?\n\nSemua rekod Tasmik dan Jawi murid ini akan dikekalkan.`
      : `Aktifkan semula murid "${item.name}"?`;

    if (!window.confirm(mesejPengesahan)) {
      return;
    }

    const id = String(item.id);
    setUpdatingId(id);
    setMessage("");

    const { data, error } = await supabase
      .from("students")
      .update({ status: statusBaharu })
      .eq("id", item.id)
      .select("id, status")
      .single();

    if (error || !data || data.status !== statusBaharu) {
      console.error("Gagal mengubah status:", error);
      setMessage(
        `Gagal mengubah status murid "${item.name}". Sila cuba lagi.`
      );
      setIsError(true);
      setUpdatingId(null);
      return;
    }

    await ambilMurid();

    setMessage(
      sedangAktif
        ? `"${item.name}" berjaya dinyahaktifkan. Semua rekod Tasmik dan Jawi dikekalkan.`
        : `"${item.name}" berjaya diaktifkan semula.`
    );
    setIsError(false);
    setUpdatingId(null);
  }

  // Carian dan penapisan
  const muridDitapis = murid.filter((item) => {
    const padanNama = item.name
      .toLowerCase()
      .includes(carian.trim().toLowerCase());

    const padanTahun =
      filterTahun === "Semua" ||
      Number(item.year) === Number(filterTahun);

    const padanStatus =
      filterStatus === "Semua" ||
      item.status === filterStatus;

    return padanNama && padanTahun && padanStatus;
  });

  const jumlahAktif = murid.filter(
    (item) => item.status === "Aktif"
  ).length;

  const jumlahTidakAktif = murid.filter(
    (item) => item.status !== "Aktif"
  ).length;

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 text-black">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <Link
            href="/"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            ← Kembali ke Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            👨‍🎓 Senarai Murid
          </h1>

          <p className="mt-2 text-gray-600">
            Urus senarai murid untuk rekod Tasmik dan Jawi.
          </p>
        </div>

        {/* BORANG TAMBAH MURID */}
        <section className="mb-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">
            ➕ Tambah Murid
          </h2>

          <form
            onSubmit={tambahMurid}
            className="grid gap-4 md:grid-cols-4"
          >
            <div className="md:col-span-2">
              <label
                htmlFor="nama"
                className="mb-1 block font-semibold"
              >
                Nama Murid
              </label>

              <input
                id="nama"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Ahmad bin Ali"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="tahun"
                className="mb-1 block font-semibold"
              >
                Tahun
              </label>

              <select
                id="tahun"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    Tahun {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-1 block font-semibold"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black"
              >
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <button
                type="submit"
                disabled={saving || loading}
                className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Murid"}
              </button>
            </div>
          </form>

          {message && (
            <div
              role="status"
              className={`mt-4 rounded-lg p-4 font-semibold ${
                isError
                  ? "bg-red-50 text-red-800"
                  : "bg-green-50 text-green-800"
              }`}
            >
              {message}
            </div>
          )}
        </section>

        {/* SENARAI MURID */}
        <section className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-5">
            <h2 className="text-xl font-bold">
              📋 Senarai Murid
            </h2>

            <p className="mt-2 text-gray-600">
              Jumlah murid: {murid.length}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-green-50 p-4">
                <p className="font-semibold text-green-800">
                  Murid Aktif
                </p>
                <p className="mt-1 text-2xl font-bold text-green-900">
                  {jumlahAktif}
                </p>
              </div>

              <div className="rounded-xl bg-gray-100 p-4">
                <p className="font-semibold text-gray-700">
                  Murid Tidak Aktif
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {jumlahTidakAktif}
                </p>
              </div>
            </div>
          </div>

          {/* CARI DAN TAPIS */}
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <div>
              <label
                htmlFor="carian"
                className="mb-1 block text-sm font-semibold"
              >
                Cari Nama
              </label>

              <input
                id="carian"
                type="text"
                value={carian}
                onChange={(e) => setCarian(e.target.value)}
                placeholder="Cari murid..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black"
              />
            </div>

            <div>
              <label
                htmlFor="filterTahun"
                className="mb-1 block text-sm font-semibold"
              >
                Tahun
              </label>

              <select
                id="filterTahun"
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black"
              >
                <option value="Semua">Semua Tahun</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    Tahun {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="filterStatus"
                className="mb-1 block text-sm font-semibold"
              >
                Status
              </label>

              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>
          </div>

          <p className="mb-4 text-sm text-gray-600">
            Memaparkan {muridDitapis.length} murid
          </p>

          {loading ? (
            <div className="rounded-lg bg-gray-50 p-6 text-center">
              Sedang mengambil data murid...
            </div>
          ) : muridDitapis.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center">
              <p className="text-lg font-semibold">
                Tiada murid dijumpai.
              </p>
              <p className="mt-2 text-gray-600">
                Semak carian atau pilihan penapis.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {muridDitapis.map((item) => {
                const aktif = item.status === "Aktif";
                const sedangDikemasKini =
                  updatingId === String(item.id);

                return (
                  <div
                    key={String(item.id)}
                    className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-black">
                        {item.name}
                      </h3>

                      <p className="text-gray-600">
                        Tahun {item.year}
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                          aktif
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {aktif ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={updatingId !== null || saving}
                      onClick={() => void tukarStatusMurid(item)}
                      className={`rounded-lg px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                        aktif
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-green-700 hover:bg-green-800"
                      }`}
                    >
                      {sedangDikemasKini
                        ? "Mengemas kini..."
                        : aktif
                        ? "⏸️ Nyahaktif"
                        : "✅ Aktifkan Semula"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
