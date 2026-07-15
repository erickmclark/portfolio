import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/content";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const { about } = await getSiteContent();

  const initials = about.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 20% 0%, rgba(37,99,235,0.35), transparent 60%)",
          color: "#f5f5f5",
          fontSize: 84,
          fontWeight: 800,
          letterSpacing: "-0.04em",
        }}
      >
        {initials}
      </div>
    ),
    { ...size }
  );
}
