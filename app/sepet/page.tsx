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

interface CartItem {
  product_id: string;
  quantity: number;
}

export default function Sepet() {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDetails, setCartDetails] = useState<Product[]>([]); // Ürün bilgilerini tutacak
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user) return;

      // Kullanıcıya ait sepet öğelerini alıyoruz
      const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Hata:", error.message);
      } else {
        setCart(data); // Sepet öğelerini state'e set ediyoruz
        fetchProductDetails(data); // Ürün detaylarını çekiyoruz
      }
    };

    fetchCartItems();
  }, [user]);

  const fetchProductDetails = async (cartItems: CartItem[]) => {
    const details: Product[] = [];

    for (const item of cartItems) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.product_id)
        .single(); // Ürün bilgilerini alıyoruz

      if (error) {
        console.error("Ürün bilgisi alınamadı:", error.message);
      } else {
        details.push({
          id: data.id,
          title: data.title,
          description: data.description,
          price: data.price,
          image_url: data.image_url,
        });
      }
    }

    setCartDetails(details); // Ürün detaylarını state'e set ediyoruz
    calculateTotal(details, cartItems); // Toplam fiyatı hesaplıyoruz
  };

  const calculateTotal = (productDetails: Product[], cartItems: CartItem[]) => {
    let total = 0;

    cartItems.forEach((item, index) => {
      const product = productDetails[index];
      total += product.price * item.quantity; // Ürün fiyatını ve miktarını kullanarak toplam fiyatı hesaplıyoruz
    });

    setTotalPrice(total); // Toplam fiyatı state'e set ediyoruz
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Sepet</h1>

      {cart.length === 0 ? (
        <p>Sepetiniz boş.</p>
      ) : (
        <div>
          {cart.map((item, index) => {
            const product = cartDetails[index]; // Ürün detaylarını alıyoruz
            if (!product) return null; // Eğer ürün bilgisi yoksa, render etmiyoruz

            return (
              <div
                key={item.product_id}
                className="flex items-center justify-between py-4 border-b"
              >
                <div className="flex items-center space-x-4">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{product.title}</h3>
                    <p>{product.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {item.quantity} x {product.price} ₺
                  </p>
                </div>
              </div>
            );
          })}
          <div className="mt-4">
            <h2 className="text-xl font-bold">Toplam Fiyat: {totalPrice} ₺</h2>
          </div>
        </div>
      )}
    </div>
  );
}
