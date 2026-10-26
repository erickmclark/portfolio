import { ImageResponse } from "next/og";
import { loadCardFonts } from "@/lib/share-card";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const [display] = await loadCardFonts();
  const k = size.width / 64;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#e8e4dd",
          border: `${3 * k}px solid #141414`,
          borderRadius: 14 * k,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: (28 - 28) * k - 3 * k,
            top: (48 - 50 * 0.78) * k - 3 * k - 4 * k,
            width: 56 * k,
            display: "flex",
            justifyContent: "center",
            fontFamily: "Funnel Display",
            fontWeight: 700,
            fontSize: 50 * k,
            lineHeight: 1,
            letterSpacing: -2 * k,
            color: "#141414",
          }}
        >
          e
        </div>
        <div
          style={{
            position: "absolute",
            left: (48.5 - 6.5) * k - 3 * k,
            top: (44 - 6.5) * k - 3 * k,
            width: 13 * k,
            height: 13 * k,
            borderRadius: 6.5 * k,
            background: "#ff5a1f",
          }}
        />
      </div>
    ),
    { ...size, fonts: [display] }
  );
}
