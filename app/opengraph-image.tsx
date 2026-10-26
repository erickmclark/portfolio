import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/content";
import { cardSize, homeBlue, loadCardFonts, resolvePhoto, ShareCard } from "@/lib/share-card";

export const dynamic = "force-dynamic";
export const alt = "Erick Clark - Technology Strategy & AI Transformation Professional";
export const size = cardSize;
export const contentType = "image/png";

export default async function OpengraphImage() {
  const { about } = await getSiteContent();
  const [fonts, photo] = await Promise.all([loadCardFonts(), resolvePhoto(about.photo)]);

  return new ImageResponse(
    <ShareCard photo={photo} {...homeBlue(about.name, about.title)} />,
    { ...size, fonts }
  );
}
