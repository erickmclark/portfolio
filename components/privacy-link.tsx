'use client';

import { useRef, useState } from 'react';
import PrivacyDialog, { type PrivacyContent } from '@/components/privacy-dialog';

type Props = {
  className?: string;
  children: React.ReactNode;
  content: PrivacyContent;
  email: string;
};

export default function PrivacyLink({ className, children, content, email }: Props) {
  const [open, setOpen] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  return (
    <>
      <a
        ref={linkRef}
        href="/privacy"
        className={className}
        onClick={(e) => {
          if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          setOpen(true);
        }}
      >
        {children}
      </a>
      <PrivacyDialog
        open={open}
        onClose={() => {
          setOpen(false);
          linkRef.current?.focus();
        }}
        content={content}
        email={email}
      />
    </>
  );
}
