"use client";

import { useRef, useState, useEffect } from "react";

export function PixelPFP({ handle, size = 48 }: { handle: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `https://unavatar.io/twitter/${handle}`;
    img.onload = () => {
      const pxSize = 12;
      canvas.width = size;
      canvas.height = size;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, pxSize, pxSize);
      ctx.drawImage(canvas, 0, 0, pxSize, pxSize, 0, 0, size, size);
      setLoaded(true);
    };
    img.onerror = () => {
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = "#33ff33";
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = "#001a00";
      ctx.font = `bold ${size * 0.6}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(handle[0]?.toUpperCase() || "?", size / 2, size / 2);
      setLoaded(true);
    };
  }, [handle, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="border border-[#33ff33]/30"
      style={{ imageRendering: "pixelated", width: size, height: size }}
    />
  );
}
