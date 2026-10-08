"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function handleLogout() {
    setLoading(true);
    setError("");
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) {
      setError("Log keluar gagal. Sila cuba lagi.");
      setLoading(false);
      return;
    }
    router.replace("/login");
    router.refresh();
  }
  return (
    <div className="flex flex-col items-end gap-2">
      <button type="button" onClick={handleLogout} disabled={loading} className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
        {loading ? "Sedang log keluar..." : "Log Keluar"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
