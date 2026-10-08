"use client";

import { useEffect, useState } from "react";
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

export default function TasmikPage() {
  const [murid, setMurid] = useState<Murid[]>([]);
  const [rekod, setRekod] = useState<TasmikRecord[]>([]);

  const [tahun, setTahun] = useState("1");
  const [muridId, setMuridId] = useState("");

  // Tarikh dikosongkan dahulu supaya Next.js tidak menggunakan
  // new Date() semasa prerender.
  const [tarikh, setTarikh] = useState("");

  const [jenis, setJenis] = useState("Iqra");
  const [jilid, setJilid] = useState("Jilid 1");
  const [iqra, setIqra] = useState("Iqra 1");
  const [mukaSurat, setMukaSurat] = useState("");
  const [juz, setJuz] = useState("1");

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
      .from("tasmik_records")
      .select("*")
      .eq("student_id", muridId)
      .order("date", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Gagal mengambil sejarah rekod Tasmik.");
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

  function paparanRekod(item: TasmikRecord) {
    if (item.type === "Al-Quran") {
      return `Al-Quran — Juz ${item.juz} — MS ${item.page}`;
    }

    return `${item.volume} — ${item.iqra} — MS ${item.page}`;
  }

  function validasiHalaman(): boolean {
    const page = Number(mukaSurat);

    if (!Number.isInteger(page)) {
      setMessage("Sila masukkan nombor muka surat yang sah.");
      return false;
    }

    if (jenis === "Iqra") {
      if (jilid === "Jilid 1" && (page < 1 || page > 130)) {
        setMessage(
          "Jilid 1 hanya mempunyai muka surat 1 hingga 130."
        );
        return false;
      }

      if (jilid === "Jilid 2" && (page < 3 || page > 65)) {
        setMessage(
          "Jilid 2 hanya mempunyai muka surat 3 hingga 65."
        );
        return false;
      }
    }

    if (jenis === "Al-Quran") {
      const nomborJuz = Number(juz);

      if (nomborJuz < 1 || nomborJuz > 30) {
        setMessage(
          "Juz Al-Quran mestilah antara 1 hingga 30."
        );
        return false;
      }

      if (page < 1) {
        setMessage(
          "Sila masukkan nombor muka surat Al-Quran."
        );
        return false;
      }
    }

    return true;
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

    if (!validasiHalaman()) {
      return;
    }

    setSaving(true);
    setMessage("");

    const dataRekod =
      jenis === "Iqra"
        ? {
            student_id: muridId,
            date: tarikh,
            type: "Iqra",
            volume: jilid,
            iqra: iqra,
            page: Number(mukaSurat),
            juz: null,
          }
        : {
            student_id: muridId,
            date: tarikh,
            type: "Al-Quran",
            volume: null,
            iqra: null,
            page: Number(mukaSurat),
            juz: Number(juz),
          };

    const { error } = await supabase
      .from("tasmik_records")
      .insert([dataRekod]);

    if (error) {
      console.error(error);
      setMessage("Gagal menyimpan rekod Tasmik.");
      setSaving(false);
      return;
    }

    setMessage("Rekod Tasmik berjaya disimpan.");
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
            📖 Rekod Tasmik
          </h1>

          <p className="mt-2 text-gray-600">
            Rekod kemajuan bacaan Iqra dan Al-Quran murid.
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
            ➕ Rekod Bacaan
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
                    Progress terakhir:{" "}
                    {paparanRekod(rekodTerbaru)}
                  </p>
                )}

                {!rekodTerbaru && (
                  <p className="mt-2 text-sm text-blue-800">
                    Belum ada rekod Tasmik.
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
                Bahan Bacaan
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setJenis("Iqra")}
                  className={`rounded-lg border px-4 py-3 font-bold ${
                    jenis === "Iqra"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  📘 Iqra
                </button>

                <button
                  type="button"
                  onClick={() => setJenis("Al-Quran")}
                  className={`rounded-lg border px-4 py-3 font-bold ${
                    jenis === "Al-Quran"
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  📖 Al-Quran
                </button>
              </div>
            </div>

            {jenis === "Iqra" && (
              <div className="space-y-5 rounded-xl bg-gray-50 p-4">
                <div>
                  <label className="mb-2 block font-semibold">
                    Jilid
                  </label>

                  <select
                    value={jilid}
                    onChange={(e) => {
                      setJilid(e.target.value);
                      setMukaSurat("");

                      setIqra(
                        e.target.value === "Jilid 1"
                          ? "Iqra 1"
                          : "Iqra 5"
                      );
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  >
                    <option value="Jilid 1">
                      Iqra KPM Jilid 1
                    </option>

                    <option value="Jilid 2">
                      Iqra KPM Jilid 2
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-semibold">
                    Iqra
                  </label>

                  <select
                    value={iqra}
                    onChange={(e) => setIqra(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  >
                    {jilid === "Jilid 1" ? (
                      <>
                        <option value="Iqra 1">Iqra 1</option>
                        <option value="Iqra 2">Iqra 2</option>
                        <option value="Iqra 3">Iqra 3</option>
                        <option value="Iqra 4">Iqra 4</option>
                      </>
                    ) : (
                      <>
                        <option value="Iqra 5">Iqra 5</option>
                        <option value="Iqra 6">Iqra 6</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-semibold">
                    Muka Surat
                  </label>

                  <input
                    type="number"
                    min={jilid === "Jilid 1" ? 1 : 3}
                    max={jilid === "Jilid 1" ? 130 : 65}
                    value={mukaSurat}
                    onChange={(e) =>
                      setMukaSurat(e.target.value)
                    }
                    placeholder={
                      jilid === "Jilid 1"
                        ? "1 - 130"
                        : "3 - 65"
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  />

                  <p className="mt-1 text-sm text-gray-500">
                    {jilid === "Jilid 1"
                      ? "Jilid 1: muka surat 1 hingga 130"
                      : "Jilid 2: muka surat 3 hingga 65"}
                  </p>
                </div>
              </div>
            )}

            {jenis === "Al-Quran" && (
              <div className="space-y-5 rounded-xl bg-gray-50 p-4">
                <div>
                  <label className="mb-2 block font-semibold">
                    Juz
                  </label>

                  <select
                    value={juz}
                    onChange={(e) => setJuz(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
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

                <div>
                  <label className="mb-2 block font-semibold">
                    Muka Surat Al-Quran
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={mukaSurat}
                    onChange={(e) =>
                      setMukaSurat(e.target.value)
                    }
                    placeholder="Contoh: 26"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  />
                </div>
              </div>
            )}

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
                : "💾 Simpan Rekod Tasmik"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">
            📋 Sejarah Rekod Tasmik
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
              Tiada rekod Tasmik untuk murid ini.
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
                    {paparanRekod(item)}
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