"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const UrunEkle = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async () => {
    const { error } = await supabase.from("products").insert([
      {
        title,
        description,
        price: Number(price),
        image_url: imageUrl,
      },
    ]);

    if (error) {
      alert("Hata oluştu: " + error.message);
    } else {
      alert("products başarıyla oluşturuldu!");
      setTitle("");
      setDescription("");
      setPrice("");
      setImageUrl("");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl mb-4">Ürün Ekle</h1>
      <input
        type="text"
        placeholder="Başlık"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <textarea
        placeholder="Açıklama"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="number"
        placeholder="Fiyat"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="text"
        placeholder="Resim URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="border p-2 mb-4 w-full"
      />
      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Gönder
      </button>
    </div>
  );
};
export default UrunEkle;
