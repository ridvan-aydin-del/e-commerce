"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react"; // sepet ikonu

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getUser();

    // Oturum değişikliklerini dinle
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="bg-gray-100 text-gray-800 py-4 px-6 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Sol: Marka Adı */}
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-tight text-emerald-600 hover:text-emerald-700 transition"
        >
          MyShop
        </Link>

        {/* Sağ: Sepet + Auth Bağlantıları */}
        <div className="flex items-center gap-6">
          {/* Sepet ikonu */}
          <Link href="/sepet" className="relative group">
            <ShoppingCart className="w-7 h-7 text-gray-700 hover:text-emerald-500 transition duration-300" />
            <span className="absolute -top-2 -right-2 bg-emerald-500 text-xs rounded-full px-1.5 py-0.5 text-white font-semibold opacity-0 group-hover:opacity-100 transition">
              Sepet
            </span>
          </Link>

          {/* Kullanıcı login durumu */}
          {!user ? (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-emerald-500 transition"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium text-gray-700 hover:text-emerald-500 transition"
              >
                Kayıt Ol
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm hidden sm:inline text-gray-600">
                Merhaba,{" "}
                <span className="font-semibold text-gray-800">
                  {user.email}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-sm font-medium px-4 py-1.5 rounded-full text-white transition"
              >
                Çıkış Yap
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
