import React from 'react';

interface LanguageBadgeProps {
  language: 'es' | 'en' | 'multi';
}

export const LanguageBadge: React.FC<LanguageBadgeProps> = ({ language }) => {
  switch (language) {
    case 'es':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#73D8D4]/20 text-[#2B8C88] border border-[#73D8D4]/40">
          Español (ES)
        </span>
      );
    case 'en':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          Inglés (EN)
        </span>
      );
    case 'multi':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          Multilingüe (MULTI)
        </span>
      );
    default:
      return null;
  }
};
