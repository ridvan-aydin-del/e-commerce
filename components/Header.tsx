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
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="bg-gray-900 text-white py-4 px-6 flex justify-between items-center shadow">
      {/* Sol: Marka Adı */}
      <Link href="/" className="text-2xl font-bold">
        MyShop
      </Link>

      {/* Sağ: Sepet + Auth Bağlantıları */}
      <div className="flex items-center gap-6">
        {/* Sepet ikonu */}
        <Link href="/sepet" className="relative group">
          <ShoppingCart className="w-6 h-6 hover:text-green-400 transition" />
        </Link>

        {/* Kullanıcı login durumu */}
        {!user ? (
          <>
            <Link href="/login" className="hover:text-gray-300">
              Giriş Yap
            </Link>
            <Link href="/register" className="hover:text-gray-300">
              Kayıt Ol
            </Link>
          </>
        ) : (
          <>
            <span className="text-sm hidden sm:inline">
              Merhaba, {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm"
            >
              Çıkış Yap
            </button>
          </>
        )}
      </div>
    </header>
  );
}
