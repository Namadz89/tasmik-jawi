"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    let active = true;
    async function check() {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      const valid = !error && !!data.user;
      setLoggedIn(valid);
      setChecked(true);
      if (!valid && pathname !== "/login") router.replace("/login");
      if (valid && pathname === "/login") router.replace("/");
    }
    void check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { void check(); });
    return () => { active = false; subscription.unsubscribe(); };
  }, [pathname, router]);
  if (!checked) return <main className="min-h-screen flex items-center justify-center">Memeriksa sesi guru...</main>;
  if (pathname === "/login") return loggedIn ? null : <>{children}</>;
  if (!loggedIn) return null;
  return <>{children}</>;
}
