"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

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

export default function Sepet() {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Kullanıcı bilgisi alınıyor
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    getUser();
  }, []);

  // Sepet yükleniyor
  useEffect(() => {
    if (!user) return;

    const userKey = user.email || "guest";
    const savedCart = JSON.parse(
      localStorage.getItem(`cart-${userKey}`) || "[]"
    );
    setCart(savedCart);
    calculateTotalPrice(savedCart);
  }, [user]);

  const calculateTotalPrice = (items: CartItem[]) => {
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Sepet</h1>
      {cart.length === 0 ? (
        <p>Sepetiniz boş.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="border p-4 rounded shadow bg-white">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p>{item.description}</p>
              <p>
                {item.price} ₺ x {item.quantity} adet
              </p>
              <p className="font-bold">
                Toplam: {item.price * item.quantity} ₺
              </p>
            </div>
          ))}
          <div className="text-xl font-bold mt-6">
            Sepet Toplamı: {totalPrice} ₺
          </div>
        </div>
      )}
    </div>
  );
}
