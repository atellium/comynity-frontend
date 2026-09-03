import { ImageResponse } from "next/og";

export const alt = "Comynity — discover trusted local businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px", color: "white", background: "linear-gradient(135deg, #155e75, #0891b2)" }}>
      <div style={{ display: "flex", fontSize: 82, fontWeight: 800 }}>Comynity</div>
      <div style={{ display: "flex", marginTop: 28, maxWidth: 900, fontSize: 38 }}>Discover trusted local businesses and services near you.</div>
    </div>,
    size,
  );
}
