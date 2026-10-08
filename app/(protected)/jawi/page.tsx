"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Murid = {
  id: string;
  name: string;
  year: number;
  status: string;
};

type JawiRecord = {
  id: string;
  student_id: string;
  date: string;
  page: number;
};

export default function JawiPage() {
  const [murid, setMurid] = useState<Murid[]>([]);
  const [rekod, setRekod] = useState<JawiRecord[]>([]);

  const [tahun, setTahun] = useState("1");
  const [muridId, setMuridId] = useState("");
  const [tarikh, setTarikh] = useState("");
  const [mukaSurat, setMukaSurat] = useState("");

  const [loadingMurid, setLoadingMurid] = useState(true);
  const [loadingRekod, setLoadingRekod] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const hariIni = new Date();

    const tahunSekarang = hariIni.getFullYear();
    const bulan = String(hariIni.getMonth() + 1).padStart(2, "0");
    const hari = String(hariIni.getDate()).padStart(2, "0");

    setTarikh(`${tahunSekarang}-${bulan}-${hari}`);
  }, []);

  async function ambilMurid() {
    setLoadingMurid(true);

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("status", "Aktif")
      .order("year", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      setMessage("Gagal mengambil data murid.");
      setLoadingMurid(false);
      return;
    }

    setMurid(data || []);
    setLoadingMurid(false);
  }

  async function ambilRekod() {
    if (!muridId) {
      setRekod([]);
      return;
    }

    setLoadingRekod(true);

    const { data, error } = await supabase
      .from("jawi_records")
      .select("*")
      .eq("student_id", muridId)
      .order("date", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Gagal mengambil sejarah rekod Jawi.");
      setLoadingRekod(false);
      return;
    }

    setRekod(data || []);
    setLoadingRekod(false);
  }

  useEffect(() => {
    ambilMurid();
  }, []);

  useEffect(() => {
    setMuridId("");
    setRekod([]);
  }, [tahun]);

  useEffect(() => {
    ambilRekod();
  }, [muridId]);

  const muridTahun = murid.filter(
    (item) => item.year.toString() === tahun
  );

  const muridDipilih = murid.find(
    (item) => item.id === muridId
  );

  const rekodTerbaru = rekod.length > 0 ? rekod[0] : null;

  function formatTarikh(tarikhRekod: string) {
    const [tahun, bulan, hari] = tarikhRekod.split("-");

    return `${hari}/${bulan}/${tahun}`;
  }

  async function simpanRekod(e: React.FormEvent) {
    e.preventDefault();

    if (!muridId) {
      setMessage("Sila pilih murid.");
      return;
    }

    if (!tarikh) {
      setMessage("Sila pilih tarikh.");
      return;
    }

    if (!mukaSurat) {
      setMessage("Sila masukkan muka surat.");
      return;
    }

    const page = Number(mukaSurat);

    if (!Number.isInteger(page)) {
      setMessage("Sila masukkan nombor muka surat yang sah.");
      return;
    }

    if (page < 9 || page > 280) {
      setMessage(
        "Modul Cilik Celik Jawi mempunyai muka surat 9 hingga 280."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("jawi_records")
      .insert([
        {
          student_id: muridId,
          date: tarikh,
          page: page,
        },
      ]);

    if (error) {
      console.error(error);
      setMessage("Gagal menyimpan rekod Jawi.");
      setSaving(false);
      return;
    }

    setMessage("Rekod Jawi berjaya disimpan.");
    setMukaSurat("");
    setSaving(false);

    await ambilRekod();
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-6 text-black">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <a
            href="/"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            ← Kembali ke Dashboard
          </a>

          <h1 className="mt-3 text-3xl font-bold">
            ✍️ Rekod Jawi
          </h1>

          <p className="mt-2 text-gray-600">
            Modul Cilik Celik Jawi
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <label className="mb-2 block font-bold">
            Tahun
          </label>

          <select
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 md:w-64"
          >
            <option value="1">Tahun 1</option>
            <option value="2">Tahun 2</option>
            <option value="3">Tahun 3</option>
            <option value="4">Tahun 4</option>
            <option value="5">Tahun 5</option>
            <option value="6">Tahun 6</option>
          </select>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-bold">
            ➕ Rekod Cilik Celik Jawi
          </h2>

          <form onSubmit={simpanRekod} className="space-y-5">
            <div>
              <label className="mb-2 block font-semibold">
                Murid
              </label>

              {loadingMurid ? (
                <div className="rounded-lg bg-gray-50 p-3">
                  Sedang mengambil data murid...
                </div>
              ) : (
                <select
                  value={muridId}
                  onChange={(e) => setMuridId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                >
                  <option value="">
                    -- Pilih Murid --
                  </option>

                  {muridTahun.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {muridDipilih && (
              <div className="rounded-xl bg-blue-50 p-4">
                <p className="font-bold text-blue-900">
                  {muridDipilih.name}
                </p>

                <p className="mt-1 text-sm text-blue-800">
                  Tahun {muridDipilih.year}
                </p>

                {rekodTerbaru && (
                  <p className="mt-2 font-semibold text-blue-900">
                    Progress terakhir: MS {rekodTerbaru.page}
                  </p>
                )}

                {!rekodTerbaru && (
                  <p className="mt-2 text-sm text-blue-800">
                    Belum ada rekod Jawi.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="mb-2 block font-semibold">
                Tarikh
              </label>

              <input
                type="date"
                value={tarikh}
                onChange={(e) => setTarikh(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 md:w-64"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Muka Surat
              </label>

              <input
                type="number"
                min="9"
                max="280"
                value={mukaSurat}
                onChange={(e) =>
                  setMukaSurat(e.target.value)
                }
                placeholder="9 - 280"
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />

              <p className="mt-1 text-sm text-gray-500">
                Cilik Celik Jawi: muka surat 9 hingga 280
              </p>
            </div>

            {message && (
              <div className="rounded-lg bg-blue-50 p-3 font-semibold text-blue-800">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || loadingMurid}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              {saving
                ? "Menyimpan..."
                : "💾 Simpan Rekod Jawi"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">
            📋 Sejarah Rekod Jawi
          </h2>

          {!muridId && (
            <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-600">
              Pilih murid untuk melihat sejarah rekod.
            </div>
          )}

          {muridId && loadingRekod && (
            <div className="rounded-lg bg-gray-50 p-6 text-center">
              Sedang mengambil sejarah rekod...
            </div>
          )}

          {muridId && !loadingRekod && rekod.length === 0 && (
            <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-600">
              Tiada rekod Jawi untuk murid ini.
            </div>
          )}

          {muridId && !loadingRekod && rekod.length > 0 && (
            <div className="space-y-3">
              {rekod.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <p className="font-bold">
                    Cilik Celik Jawi — MS {item.page}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Tarikh: {formatTarikh(item.date)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}