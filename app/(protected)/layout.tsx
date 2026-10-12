
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      setChecking(true);
      setAllowed(false);
      setMessage("");

      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        setChecking(false);
        router.replace("/login");
        return;
      }

      // Semak kebenaran guru melalui Supabase RPC.
      const { data: authorized, error: accessError } =
        await supabase.rpc("is_authorized_teacher");

      if (!active) return;

      if (accessError) {
        console.error(
          "Ralat semakan kebenaran guru:",
          accessError
        );

        setMessage(
          "Tidak dapat mengesahkan kebenaran guru. Sila cuba lagi."
        );
        setAllowed(false);
        setChecking(false);
        return;
      }

      if (authorized !== true) {
        setMessage(
          "Akses ditolak. Akaun ini tidak mempunyai kebenaran sebagai guru."
        );
        setAllowed(false);
        setChecking(false);
        return;
      }

      setAllowed(true);
      setChecking(false);
    }

    void checkAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setAllowed(false);
        setChecking(false);
        router.replace("/login");
      }

      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        void checkAccess();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-700">
          Memeriksa kebenaran guru...
        </p>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 p-6">
        <h1 className="text-xl font-bold text-red-700">
          Akses Tidak Dibenarkan
        </h1>

        <p className="max-w-md text-center text-slate-700">
          {message || "Anda tidak mempunyai akses ke sistem ini."}
        </p>

        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/login");
          }}
          className="rounded-lg bg-slate-800 px-5 py-3 font-semibold text-white"
        >
          Log Keluar
        </button>
      </main>
    );
  }

  return <>{children}</>;
}
