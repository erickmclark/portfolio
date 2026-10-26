import Image from "next/image";

export default function AboutPortrait({
  photo,
  name,
  quote,
  className = "",
}: {
  photo?: string;
  name: string;
  quote?: string;
  className?: string;
}) {
  if (!photo) return null;
  return (
    <figure className={`flex flex-col items-center text-center lg:items-start lg:text-left ${className}`.trim()}>
      <Image
        src={photo}
        alt={`Portrait of ${name}`}
        width={160}
        height={160}
        sizes="160px"
        className="h-40 w-40 rounded-full object-cover ring-[3px] ring-brand-blue ring-offset-4 ring-offset-paper"
      />
      {quote?.trim() && (
        <blockquote className="mt-6 max-w-[34ch] text-[17px] italic leading-[1.5] text-ink-muted">
          “{quote}”
        </blockquote>
      )}
    </figure>
  );
}
