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
      const { data, error } = await supabase.auth.getSession();
      setUser(data?.session?.user ?? null);
    };

    getUser();
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
    };

    fetchSession();

    const fetchIlanlar = async () => {
      const { data, error } = await supabase.from("products").select("*");

      if (error) {
        console.error("Ürünler yüklenirken hata:", error.message);
      } else {
        setProducts(data);
      }
    };

    fetchIlanlar();
  }, []);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {user?.email === "admin@gmail.com" && (
        <button
          onClick={() => router.push("/urun-ekle")}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Yeni Ürün Ekle
        </button>
      )}
      {products.map((product) => (
        <Link
          href={`/urun/${product.id}`}
          key={product.id}
          className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden shadow hover:shadow-xl transition group"
        >
          <div className="h-48 bg-gray-800 flex items-center justify-center overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="object-cover w-full h-full group-hover:scale-105 transition"
              />
            ) : (
              <span className="text-gray-500">Görsel Yok</span>
            )}
          </div>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2 text-white">
              {product.title}
            </h2>
            <p className="mt-2 font-bold text-green-400">{product.price} ₺</p>
          </div>
          <div className="p-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
              Detaylar
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
}
