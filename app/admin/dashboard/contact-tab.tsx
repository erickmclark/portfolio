"use client";

import { useMemo, useState } from 'react';
import { CONTACT_INTENT_IDS, CONTACT_INTENTS } from '@/lib/contact';
import type { ContactContent, ContactPageContent, SiteContent } from '@/lib/types';
import { validateSiteContent } from '@/lib/validate';
import { GroupHead } from '../ui';
import { LedgerLayout, SheetHead, TextField, type LedgerRow } from '../ui/edit';
import { errorFor, errorsUnder } from './content-edit';

type BlockId = 'details' | 'page' | 'topics';

const BLOCKS: { id: BlockId; title: string; note: string; paths: string[] }[] = [
  { id: 'details', title: 'Contact details', note: 'Email, LinkedIn and GitHub', paths: ['contact'] },
  { id: 'page', title: 'Contact page', note: 'Heading and intro, also on the homepage', paths: ['contactPage.heading', 'contactPage.intro'] },
  { id: 'topics', title: 'Form topics', note: 'The six topic labels', paths: ['contactPage.topics'] },
];

export default function ContactTab({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const [selected, setSelected] = useState<BlockId>('details');
  const errors = useMemo(() => {
    const r = validateSiteContent(content);
    return r.ok ? [] : r.errors.filter((m) => m.startsWith('contact'));
  }, [content]);
  const page = content.contactPage;
  if (!page) {
    return <div role="alert" className="border border-error px-4 py-3">The contact page content did not load. Reload the page; nothing was changed.</div>;
  }

  const setContact = (next: Partial<ContactContent>) => onChange({ ...content, contact: { ...content.contact, ...next } });
  const setPage = (next: Partial<ContactPageContent>) => onChange({ ...content, contactPage: { ...page, ...next } });

  const rows: LedgerRow[] = BLOCKS.map((b) => ({
    id: b.id,
    title: b.title,
    note: b.note,
    stamp: b.paths.some((p) => errorsUnder(errors, p).length > 0) ? 'Fix' : undefined,
  }));
  const block = BLOCKS.find((b) => b.id === selected) ?? BLOCKS[0];
  const position = BLOCKS.indexOf(block) + 1;

  return (
    <LedgerLayout
      eyebrow={`Contact · ${BLOCKS.length} groups`}
      title="Contact"
      intro="Your contact details, and the text on the contact page and form."
      listLabel="Contact groups"
      rows={rows}
      selectedId={block.id}
      onSelect={(id) => setSelected(id as BlockId)}
      sheet={({ headingRef, onBack }) => (
        <div className="border border-ink bg-white p-4 pb-10 md:p-8">
          <SheetHead eyebrow={`Group ${position} of ${BLOCKS.length}`} title={block.title} headingRef={headingRef} onBack={onBack} backLabel="All groups" />
          <div className="mt-8 space-y-4">
            {block.id === 'details' && (
              <>
                <GroupHead title="Contact details" />
                <TextField label="Email" value={content.contact.email} onChange={(v) => setContact({ email: v })} placeholder="you@example.com" error={errorFor(errors, 'contact.email')} />
                <TextField label="LinkedIn URL" value={content.contact.linkedinUrl} onChange={(v) => setContact({ linkedinUrl: v })} placeholder="https://linkedin.com/in/yourhandle" error={errorFor(errors, 'contact.linkedinUrl')} mono />
                <TextField label="GitHub URL" value={content.contact.githubUrl} onChange={(v) => setContact({ githubUrl: v })} placeholder="https://github.com/yourusername" error={errorFor(errors, 'contact.githubUrl')} mono />
              </>
            )}
            {block.id === 'page' && (
              <>
                <GroupHead title="Contact page" />
                <p className="text-sm text-ink-muted">This text appears on the contact page and in the homepage contact section.</p>
                <TextField label="Heading" value={page.heading} onChange={(v) => setPage({ heading: v })} error={errorFor(errors, 'contactPage.heading')} />
                <TextField label="Intro" multiline rows={4} value={page.intro} onChange={(v) => setPage({ intro: v })} error={errorFor(errors, 'contactPage.intro')} />
              </>
            )}
            {block.id === 'topics' && (
              <>
                <GroupHead title="Form topics" note="6" />
                <p className="text-sm text-ink-muted">Labels shown in the topic choice on the contact form. The id under each label is fixed.</p>
                {CONTACT_INTENT_IDS.map((id) => (
                  <div key={id}>
                    <TextField
                      label={`Topic label: ${CONTACT_INTENTS.find((i) => i.id === id)?.label ?? id}`}
                      value={page.topics[id]}
                      onChange={(v) => setPage({ topics: { ...page.topics, [id]: v } })}
                      error={errorFor(errors, `contactPage.topics.${id}`)}
                    />
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted">id: {id}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    />
  );
}
