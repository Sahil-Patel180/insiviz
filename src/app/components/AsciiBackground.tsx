import { useEffect, useRef } from "react";

const ASCII_CHARS = " .:-=+*#%@░▒▓█";

function valueToChar(v: number): string {
  const idx = Math.floor(v * (ASCII_CHARS.length - 1));
  return ASCII_CHARS[Math.max(0, Math.min(ASCII_CHARS.length - 1, idx))];
}

export function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CHAR_W = 10;
    const CHAR_H = 16;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const render = (ts: number) => {
      timeRef.current = ts / 1000;
      const t = timeRef.current;
      const cols = Math.ceil(canvas.width / CHAR_W);
      const rows = Math.ceil(canvas.height / CHAR_H);

      ctx.fillStyle = "#0d0d0f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${CHAR_H - 2}px 'JetBrains Mono', monospace`;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nx = c / cols;
          const ny = r / rows;
          // layered noise for depth
          const wave1 = Math.sin(nx * 8 + t * 0.4) * Math.cos(ny * 6 - t * 0.3);
          const wave2 = Math.sin((nx + ny) * 5 + t * 0.2) * 0.5;
          const wave3 = Math.cos(nx * 3 - ny * 7 + t * 0.15) * 0.3;
          const raw = (wave1 + wave2 + wave3 + 2) / 4; // normalise ~0..1
          const v = Math.max(0, Math.min(1, raw));

          // brightness ramp: darker at edges
          const edgeFade = (1 - Math.abs(nx * 2 - 1)) * (1 - Math.abs(ny * 2 - 1));
          const brightness = v * edgeFade * 0.38 + 0.04;

          const grey = Math.floor(brightness * 255);
          ctx.fillStyle = `rgb(${grey},${grey},${grey + 8})`;
          ctx.fillText(valueToChar(v), c * CHAR_W, r * CHAR_H + CHAR_H - 2);
        }
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
