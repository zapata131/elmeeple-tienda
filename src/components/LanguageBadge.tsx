import React from 'react';
import { EditionLanguage } from '../types';

interface LanguageBadgeProps {
  language: EditionLanguage;
}

export function LanguageBadge({ language }: LanguageBadgeProps) {
  const configs = {
    es: { label: 'Español (ES)', classes: 'bg-amber-100 text-amber-900 border-amber-300' },
    en: { label: 'Inglés (EN)', classes: 'bg-blue-100 text-blue-900 border-blue-300' },
    multi: { label: 'Multilingüe (MULTI)', classes: 'bg-purple-100 text-purple-900 border-purple-300' },
  };

  const config = configs[language] || configs.es;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
