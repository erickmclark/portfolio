import Image from "next/image";

type Props = {
  src?: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Renders a project's image, or a tasteful monogram placeholder when no image
 * has been uploaded. Always fills its (relatively positioned) parent.
 */
export default function ProjectImage({ src, alt, sizes, priority, className }: Props) {
  if (src) {
    return (
      <Image src={src} alt={alt} fill className={className} sizes={sizes} priority={priority} />
    );
  }

  const initial = alt.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface via-background to-surface"
      aria-label={alt}
      role="img"
    >
      <span className="text-6xl font-black text-muted/30 select-none">{initial}</span>
    </div>
  );
}
