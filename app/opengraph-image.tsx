import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/content";

export const alt = "Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const { about } = await getSiteContent();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 20% 0%, rgba(59,130,246,0.18), transparent 45%)",
          color: "#f5f5f5",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: 26,
            color: "#3b82f6",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {about.title}
        </div>
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            marginTop: 16,
          }}
        >
          {about.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "#a3a3a3",
            marginTop: 28,
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          {about.heroTagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
