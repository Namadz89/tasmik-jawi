
import Image from "next/image";
import { SEKOLAH } from "../lib/sekolah";

export default function IdentitiSekolah() {
  return (
    <header className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <Image
          src={SEKOLAH.logo}
          alt="Logo Sekolah Kebangsaan Kitou"
          width={100}
          height={100}
          className="h-24 w-24 object-contain"
          priority
        />

        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {SEKOLAH.nama}
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Kod Sekolah: {SEKOLAH.kod}
          </p>

          <p className="mt-2 font-semibold italic text-blue-800">
            {SEKOLAH.motto}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-gray-200 pt-4 text-center">
        <h2 className="text-lg font-bold text-blue-900">
          {SEKOLAH.namaSistem}
        </h2>

        <p className="text-gray-700">
          {SEKOLAH.modul}
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Guru Pendidikan Islam: {SEKOLAH.namaGuru}
        </p>
      </div>
    </header>
  );
}
