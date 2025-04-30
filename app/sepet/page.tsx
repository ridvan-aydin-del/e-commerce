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
  const [cartDetails, setCartDetails] = useState<Product[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    getUser();
  }, []);

  const fetchCartItems = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Hata:", error.message);
    } else {
      setCart(data);
      fetchProductDetails(data);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchProductDetails = async (cartItems: CartItem[]) => {
    const details: Product[] = [];

    for (const item of cartItems) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", item.product_id)
        .single();

      if (error) {
        console.error("Ürün bilgisi alınamadı:", error.message);
      } else {
        details.push(data);
      }
    }

    setCartDetails(details);
    calculateTotal(details, cartItems);
  };

  const calculateTotal = (productDetails: Product[], cartItems: CartItem[]) => {
    let total = 0;
    cartItems.forEach((item) => {
      const product = productDetails.find((p) => p.id === item.product_id);
      if (product) {
        total += product.price * item.quantity;
      }
    });
    setTotalPrice(total);
  };

  const handleDecrease = async (productId: string) => {
    if (!user) return;

    const item = cart.find((c) => c.product_id === productId);
    if (!item) return;

    if (item.quantity > 1) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: item.quantity - 1 })
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) {
        console.error("Azaltma hatası:", error.message);
      }
    } else {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) {
        console.error("Silme hatası:", error.message);
      }
    }

    fetchCartItems();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Sepet</h1>

      {cart.length === 0 ? (
        <p>Sepetiniz boş.</p>
      ) : (
        <div>
          {cart.map((item, index) => {
            const product = cartDetails.find((p) => p.id === item.product_id);
            if (!product) return null;

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
                  <p className="font-semibold mb-2">
                    {item.quantity} x {product.price} ₺
                  </p>
                  <button
                    onClick={() => handleDecrease(item.product_id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                  >
                    Azalt
                  </button>
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
