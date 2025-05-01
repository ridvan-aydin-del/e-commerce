"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Session alma hatas\u0131:", error.message);
        return;
      }

      setUser(session?.user ?? null);
    };

    getUser();
  }, []);

  useEffect(() => {
    const fetchIlanlar = async () => {
      const { data, error } = await supabase.from("products").select("*");

      if (error) {
        console.error("Ürünler Yüklenirken hata:", error.message);
      } else {
        setProducts(data);
      }
    };

    fetchIlanlar();
  }, []);

  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {user?.email === "admin@gmail.com" && (
        <button
          onClick={() => router.push("/urun-ekle")}
          className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
        >
          + Yeni Ürün Ekle
        </button>
      )}

      {products.map((product) => (
        <Link
          href={`/urun/${product.id}`}
          key={product.id}
          className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg border border-gray-200 transition group"
        >
          <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <span className="text-gray-400">Görsel Yok</span>
            )}
          </div>

          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800 group-hover:text-emerald-600 transition">
              {product.title}
            </h2>
            <p className="mt-1 text-md font-semibold text-emerald-500">
              {product.price} ₺
            </p>
          </div>

          <div className="p-4 pt-0">
            <button className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition">
              Detaylar
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
}
