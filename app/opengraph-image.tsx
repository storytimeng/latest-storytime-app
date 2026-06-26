import { ImageResponse } from "next/og";
import { APP_CONFIG } from "@/config/app";

export const runtime = "edge";
export const alt = `${APP_CONFIG.name} — ${APP_CONFIG.shortDescription}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #361B17 0%, #5C2E22 60%, #F8951D 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo area */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "#FFEBD0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            fontSize: 52,
          }}
        >
          📖
        </div>

        {/* Site name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#FFEBD0",
            letterSpacing: "-2px",
            marginBottom: 16,
          }}
        >
          Storytime
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#F8951D",
            fontWeight: 500,
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Home To Budding Authors &amp; Readers
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 4,
            borderRadius: 2,
            background: "#F8951D",
            margin: "28px 0",
          }}
        />

        {/* Sub tagline */}
        <div
          style={{
            fontSize: 22,
            color: "#FFEBD0",
            opacity: 0.8,
            textAlign: "center",
          }}
        >
          Read, Write &amp; Grow · storytime.ng
        </div>
      </div>
    ),
    { ...size },
  );
}
