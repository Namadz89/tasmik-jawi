
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Rekod = Record<string, unknown>;
type NamaJadual = "students" | "tasmik_records" | "jawi_records";

const JADUAL: NamaJadual[] = [
  "students",
  "tasmik_records",
  "jawi_records",
];

async function ambilSemuaRekod(jadual: NamaJadual): Promise<Rekod[]> {
  const saizHalaman = 500;

  const { count, error: countError } = await supabase
    .from(jadual)
    .select("*", { count: "exact", head: true });

  if (countError) throw new Error(countError.message);
  if (count === null) {
    throw new Error(`Tidak dapat menyemak jumlah rekod ${jadual}.`);
  }

  const semua: Rekod[] = [];

  for (let mula = 0; mula < count; mula += saizHalaman) {
    const { data, error } = await supabase
      .from(jadual)
      .select("*")
      .order("id", { ascending: true })
      .range(mula, mula + saizHalaman - 1);

    if (error) throw new Error(error.message);

    semua.push(...((data ?? []) as Rekod[]));
  }

  if (semua.length !== count) {
    throw new Error(
      `Bilangan rekod ${jadual} berubah semasa sandaran. Sila cuba lagi.`
    );
  }

  return semua;
}

export default function BackupPage() {
  const [sedangBackup, setSedangBackup] = useState(false);
  const [mesej, setMesej] = useState("");
  const [ralat, setRalat] = useState("");

  async function buatBackup() {
    if (sedangBackup) return;

    setSedangBackup(true);
    setMesej("");
    setRalat("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        throw new Error("Sila log masuk semula.");
      }

      // Data masih tertakluk pada polisi RLS Supabase.
      const students = await ambilSemuaRekod("students");
      const tasmik_records = await ambilSemuaRekod("tasmik_records");
      const jawi_records = await ambilSemuaRekod("jawi_records");

      const tarikh = new Date();

      const backup = {
        format: "tasmik-jawi-data-backup",
        version: 1,
        created_at: tarikh.toISOString(),
        tables: {
          students,
          tasmik_records,
          jawi_records,
        },
        counts: {
          students: students.length,
          tasmik_records: tasmik_records.length,
          jawi_records: jawi_records.length,
        },
      };

      const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json;charset=utf-8" }
      );

      const url = URL.createObjectURL(blob);
      const pautan = document.createElement("a");

      const tarikhFail = tarikh.toISOString().slice(0, 10);

      pautan.href = url;
      pautan.download = `Backup_Tasmik_Jawi_${tarikhFail}.json`;

      document.body.appendChild(pautan);
      pautan.click();
      pautan.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 60000);

      setMesej(
        `Fail sandaran disediakan: ${students.length} murid, ` +
        `${tasmik_records.length} rekod Tasmik dan ` +
        `${jawi_records.length} rekod Jawi.`
      );
    } catch (error) {
      setRalat(
        error instanceof Error
          ? error.message
          : "Gagal menyediakan sandaran data."
      );
    } finally {
      setSedangBackup(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-block rounded-lg bg-white px-4 py-3 font-semibold text-blue-700 shadow-sm"
        >
          ← Kembali ke Dashboard
        </Link>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">
            💾 Backup Data
          </h1>

          <p className="mt-3 text-slate-600">
            Muat turun salinan data Sistem Rekod Tasmik & Jawi
            untuk simpanan peribadi guru.
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 p-5">
            <h2 className="font-bold">Kandungan sandaran</h2>

            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Senarai murid Tahun 1 hingga Tahun 6</li>
              <li>Semua rekod bacaan Tasmik yang boleh diakses</li>
              <li>Semua rekod bacaan Jawi yang boleh diakses</li>
              <li>Tarikh sandaran dan jumlah rekod</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={buatBackup}
            disabled={sedangBackup}
            className="mt-6 w-full rounded-xl bg-emerald-700 px-5 py-4 font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {sedangBackup
              ? "Sedang menyediakan sandaran..."
              : "💾 Muat Turun Backup Data (.json)"}
          </button>

          {mesej && (
            <p role="status" className="mt-4 rounded-lg bg-green-50 p-4 text-green-800">
              {mesej}
            </p>
          )}

          {ralat && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">
              {ralat}
            </p>
          )}

          <p className="mt-6 text-sm text-slate-600">
            Penting: Simpan fail di tempat yang selamat.
            Fail ini mengandungi data murid dan bukan
            sandaran penuh pangkalan data Supabase.
          </p>
        </section>
      </div>
    </main>
  );
}
