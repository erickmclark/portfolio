"use client";

import { useState } from 'react';
import type { AboutContent } from '@/lib/types';

export default function AboutTab({
  about,
  onChange,
}: {
  about: AboutContent;
  onChange: (about: AboutContent) => void;
}) {
  const [skillInput, setSkillInput] = useState('');

  function update<K extends keyof AboutContent>(key: K, value: AboutContent[K]) {
    onChange({ ...about, [key]: value });
  }

  function addSkill(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!about.skills.includes(skillInput.trim())) {
        update('skills', [...about.skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold">About</h2>

      <div>
        <label className="text-xs text-muted uppercase tracking-widest mb-1 block">Your Name</label>
        <input
          value={about.name}
          onChange={(e) => update('name', e.target.value)}
          className="w-full px-3 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => update('availableForWork', !about.availableForWork)}
          className={`relative w-10 h-6 rounded-full transition-colors ${about.availableForWork ? 'bg-accent' : 'bg-border'}`}
        >
          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${about.availableForWork ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
        <span className="text-sm">Available for work <span className="text-muted">(shows badge in hero)</span></span>
      </div>

      <div className="space-y-3">
        <label className="text-xs text-muted uppercase tracking-widest block">Bio Paragraphs</label>
        {about.bio.map((para, i) => (
          <textarea
            key={i}
            value={para}
            onChange={(e) => {
              const newBio = [...about.bio];
              newBio[i] = e.target.value;
              update('bio', newBio);
            }}
            rows={3}
            placeholder={`Paragraph ${i + 1}`}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-accent resize-y transition-colors"
          />
        ))}
      </div>

      <div>
        <label className="text-xs text-muted uppercase tracking-widest mb-2 block">Skills</label>
        <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
          {about.skills.map((skill) => (
            <span key={skill} className="flex items-center gap-1 text-sm px-3 py-1 border border-border rounded-full">
              {skill}
              <button
                type="button"
                onClick={() => update('skills', about.skills.filter((s) => s !== skill))}
                className="text-muted hover:text-white ml-1 leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={addSkill}
          placeholder="Type a skill and press Enter to add"
          className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
        />
      </div>
    </div>
  );
}
