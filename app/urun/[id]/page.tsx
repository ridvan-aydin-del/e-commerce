"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const UrunDetay = () => {
  const params = useParams();
  const urunId = params?.id as string;
  const [urun, setUrun] = useState<Product | null>(null);

  useEffect(() => {
    const fetchUrun = async () => {
      if (!urunId) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", urunId)
        .maybeSingle();

      if (error) {
        console.error("Hata:", error.message);
      } else {
        setUrun(data);
      }
    };

    fetchUrun();
  }, [urunId]);

  const addToCart = async () => {
    if (!urun) return;

    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    const userKey = user?.email || "guest";

    const cart: CartItem[] = JSON.parse(
      localStorage.getItem(`cart-${userKey}`) || "[]"
    );

    const existingItem = cart.find((item) => item.id === urun.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...urun, quantity: 1 });
    }

    localStorage.setItem(`cart-${userKey}`, JSON.stringify(cart));
    alert("Ürün sepete eklendi");
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">{urun?.title}</h1>
      <p className="text-gray-600">{urun?.description}</p>
      {urun?.image_url && (
        <img
          src={urun.image_url}
          alt={urun.title}
          className="w-full h-48 object-cover rounded-lg"
        />
      )}
      <p className="text-lg font-semibold text-green-600">{urun?.price} ₺</p>
      <button
        onClick={addToCart}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
      >
        Sepete Ekle
      </button>
    </div>
  );
};

export default UrunDetay;
