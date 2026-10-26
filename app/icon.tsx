import { ImageResponse } from "next/og";
import { loadCardFonts } from "@/lib/share-card";

export const contentType = "image/png";

// Drawn per size on whole pixels: a 32px mark scaled to 16 blurs its border, letter and dot.
const MARKS = {
  small: { size: 16, border: 1, radius: 4, font: 15, eLeft: 1, eTop: -2, dot: 4, dotLeft: 10, dotTop: 8 },
  medium: { size: 32, border: 2, radius: 7, font: 26, eLeft: 3, eTop: -1, dot: 7, dotLeft: 20, dotTop: 17 },
};

export function generateImageMetadata() {
  return Object.entries(MARKS).map(([id, m]) => ({ id, size: { width: m.size, height: m.size }, contentType }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const m = MARKS[(await id) as keyof typeof MARKS] ?? MARKS.medium;
  const [display] = await loadCardFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#e8e4dd",
          border: `${m.border}px solid #141414`,
          borderRadius: m.radius,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: m.eLeft,
            top: m.eTop,
            display: "flex",
            fontFamily: "Funnel Display",
            fontWeight: 700,
            fontSize: m.font,
            lineHeight: 1,
            color: "#141414",
          }}
        >
          e
        </div>
        <div
          style={{
            position: "absolute",
            left: m.dotLeft,
            top: m.dotTop,
            width: m.dot,
            height: m.dot,
            borderRadius: m.dot / 2,
            background: "#ff5a1f",
          }}
        />
      </div>
    ),
    { width: m.size, height: m.size, fonts: [display] }
  );
}
