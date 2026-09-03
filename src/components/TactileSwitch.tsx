'use client';

import React from 'react';

interface TactileSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function TactileSwitch({ id, label, checked, onChange }: TactileSwitchProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className="w-11 h-6 bg-stone-300 peer-checked:bg-[#8367C7] rounded-full transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-full shadow-inner"
      />
      <span className="text-sm font-medium text-[#3A3A3A]">{label}</span>
    </label>
  );
}
