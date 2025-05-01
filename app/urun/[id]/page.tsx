"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
}

const UrunDetay = () => {
  const params = useParams();
  const urunId = params?.id as string;
  const [urun, setUrun] = useState<Product | null>(null);
  const [user, setUser] = useState<User | null>(null);

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

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();
  }, []);

  const addToCart = async (userId: string, productId: string) => {
    if (!userId || !productId) return;

    // Sepette bu ürün var mı kontrol et
    const { data: existingCartItem, error: selectError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    if (selectError) {
      console.error("Sepet kontrol hatası:", selectError.message);
      return;
    }

    if (existingCartItem) {
      // Eğer ürün varsa, quantity'yi artır
      const newQuantity = existingCartItem.quantity + 1;

      const { data: updatedData, error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingCartItem.id)
        .select();

      if (updateError) {
        console.error("Sepet güncelleme hatası:", updateError.message);
      } else {
        console.log("Sepet güncellendi, yeni quantity:", newQuantity);
        console.log("Güncellenen veriler:", updatedData); // Güncellenen verileri kontrol et
      }
    } else {
      // Eğer ürün yoksa, yeni ürün ekle
      const { error: insertError } = await supabase.from("cart_items").insert([
        {
          user_id: userId,
          product_id: productId,
          quantity: 1, // Yeni ürün eklenirken quantity 1
        },
      ]);

      if (insertError) {
        console.error("Yeni ürün sepete eklenemedi:", insertError.message);
      } else {
        console.log("Yeni ürün sepete eklendi");
      }
    }
    alert("Ürün sepete eklendi !");
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg overflow-hidden p-6 space-y-6 mt-10">
      <h1 className="text-3xl font-bold text-gray-900">{urun?.title}</h1>
      <p className="text-gray-700 leading-relaxed">{urun?.description}</p>

      {urun?.image_url && (
        <div className="rounded-lg overflow-hidden">
          <img
            src={urun.image_url}
            alt={urun.title}
            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <p className="text-xl font-semibold text-emerald-600">{urun?.price} ₺</p>

      <button
        onClick={() => {
          if (user && urun) {
            addToCart(user.id, urun.id);
          }
        }}
        className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-medium text-lg"
      >
        Sepete Ekle
      </button>
    </div>
  );
};

export default UrunDetay;
