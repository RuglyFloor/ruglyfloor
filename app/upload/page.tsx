"use client";
import { useState } from "react";

export default function UploadPage() {
  const [image, setImage] = useState<string | null>(null);
  const [size, setSize] = useState("4x6");
  const [baseColor, setBaseColor] = useState("light");
  const [colors, setColors] = useState(1);

  const basePrice = 99;
  const sizeUpcharge = size === "5x8" ? 40 : size === "6x9" ? 80 : size === "5round" ? 60 : 0;
  const colorUpcharge = baseColor === "dark" ? 30 : 0;
  const overlayUpcharge = colors === 2 ? 50 : 0;

  const total = basePrice + sizeUpcharge + colorUpcharge + overlayUpcharge;

  return (
    <main style={{ padding: 40, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Upload Your Design</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setImage(URL.createObjectURL(file));
        }}
      />

      {image && (
        <div style={{ marginTop: 30 }}>
          <p>Preview</p>
          <div style={{ width: 400, background: "#e5e5e5", padding: 20 }}>
            <img src={image} style={{ width: "100%" }} />
          </div>
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <label>Size</label>
        <select value={size} onChange={(e) => setSize(e.target.value)}>
          <option value="4x6">4×6</option>
          <option value="5x8">5×8</option>
          <option value="6x9">6×9</option>
          <option value="5round">5′ Round</option>
        </select>
      </div>

      <div>
        <label>Base Color</label>
        <select value={baseColor} onChange={(e) => setBaseColor(e.target.value)}>
          <option value="light">Light / Standard</option>
          <option value="dark">Dark (Upcharge)</option>
        </select>
      </div>

      <div>
        <label>Design Colors</label>
        <select value={colors} onChange={(e) => setColors(Number(e.target.value))}>
          <option value={1}>1 Color</option>
          <option value={2}>2 Colors (+ Overlay)</option>
        </select>
      </div>

      <h2>Total: ${total}</h2>

      <button style={{ padding: 16, fontWeight: 700 }}>
        CHECKOUT (Stripe)
      </button>

      <p style={{ marginTop: 20, fontSize: 14 }}>
        Payment starts production. We finalize stencil work after purchase.
      </p>
    </main>
  );
}
