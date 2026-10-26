import { Fragment } from 'react';

export default function PrivacyParagraph({ text, email }: { text: string; email: string }) {
  const parts = text.split('{email}');
  return (
    <p>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <a href={`mailto:${email}`} className="break-all font-semibold underline underline-offset-4">
              {email}
            </a>
          )}
        </Fragment>
      ))}
    </p>
  );
}
